import type { Snowflake } from "discord-api-types/v10";
import type { H3Event } from "h3";
import { db } from "#server/database/prisma";
import { notifyGuildSettingsUpdate } from "#server/database/settings/notify";
import {
	fetchWarnThresholds,
	removeWarnThreshold,
	upsertWarnThreshold,
} from "#server/database/settings/warnings/storage";
import { compactSettingsChanges } from "#server/utils/audit/patch-to-changes";
import { authorizeGuildManager, useManagedGuild } from "#server/utils/guilds/manager";
import { createKeyedLock } from "#server/utils/keyed-lock";
import { guildSettingsUpdate } from "#shared/audit/actions";
import {
	MAXIMUM_WARN_THRESHOLDS,
	parseWarnThresholdCount,
	type WarnThreshold,
	type WarnThresholdData,
} from "#shared/utils/warn-thresholds";
import { useLogger, withAuditMethods } from "evlog";
import { createError as createH3Error } from "h3";

/**
 * `authorize` hook of the warning threshold routes: who asks has to manage the
 * guild of the path, and a refusal is audited.
 */
export const authorizeWarnThresholdManager = authorizeGuildManager(
	"Insufficient permissions to manage the warning thresholds",
);

/** What goes wrong when a threshold is set or removed: the server has as many as it can, or none at that number. */
export type WarnThresholdErrorCode = "limit" | "unknown";

export class WarnThresholdError extends Error {
	public constructor(public readonly code: WarnThresholdErrorCode) {
		super(`Warning threshold error: ${code}`);
	}
}

/** What a write changed: the threshold as it was, `null` for a new one, and as it is, `null` once removed. */
export interface WarnThresholdChange {
	before: WarnThreshold | null;
	after: WarnThreshold | null;
}

// Arbitrary, only different from the keys other code locks on (1_635_086_445
// to 1_635_086_450 are taken).
const LOCK_NAMESPACE = 1_635_086_451;
const LOCK_KEY_RANGE = 2_147_483_647n;
const withKeyLock = createKeyedLock();

/**
 * Runs the writes of a guild's thresholds one after the other: the queue
 * orders those of this process, the transaction-scoped advisory lock those of
 * the other instances of the dashboard. The bot's `/warn-thresholds add` takes
 * neither; the unique index on the number of warnings is what holds against it.
 */
function writeWarnThresholds<T>(
	guildId: Snowflake,
	callback: (orm: typeof db.orm) => Promise<T>,
): Promise<T> {
	return withKeyLock(guildId, () => {
		const guildKey = Number(BigInt(guildId) % LOCK_KEY_RANGE);
		return db.transaction(async (tx) => {
			await tx.execute(
				db.raw.sql`SELECT pg_advisory_xact_lock(${LOCK_NAMESPACE}, ${guildKey})`
					.affectedCount()
					.build(),
			);
			const result = await callback(tx.orm);
			// The bot caches the thresholds: it reloads them on this, once committed.
			await notifyGuildSettingsUpdate(tx, guildId, ["warnThresholds"]);
			return result;
		});
	});
}

/** Reads the warning thresholds of a guild, by their number of warnings. */
export function readWarnThresholds(guildId: Snowflake): Promise<WarnThreshold[]> {
	return fetchWarnThresholds(db.orm, guildId);
}

/**
 * Sets the threshold of a number of warnings, a new one or the one it has.
 *
 * @throws {@linkcode WarnThresholdError} `limit` when the guild has the most
 * thresholds it can have and this is one more.
 */
export function setWarnThreshold(
	guildId: Snowflake,
	count: number,
	data: WarnThresholdData,
): Promise<WarnThresholdChange> {
	return writeWarnThresholds(guildId, async (orm) => {
		const existing = await fetchWarnThresholds(orm, guildId);
		const before = existing.find((threshold) => threshold.count === count) ?? null;
		if (!before && existing.length >= MAXIMUM_WARN_THRESHOLDS) {
			throw new WarnThresholdError("limit");
		}
		const after = await upsertWarnThreshold(orm, guildId, count, data);
		return { after, before };
	});
}

/**
 * Removes the threshold of a number of warnings.
 *
 * @returns The threshold that was removed.
 * @throws {@linkcode WarnThresholdError} `unknown` when the guild has none at that number.
 */
export function clearWarnThreshold(guildId: Snowflake, count: number): Promise<WarnThreshold> {
	return writeWarnThresholds(guildId, async (orm) => {
		const existing = await fetchWarnThresholds(orm, guildId);
		const before = existing.find((threshold) => threshold.count === count);
		if (!before || !(await removeWarnThreshold(orm, guildId, count))) {
			throw new WarnThresholdError("unknown");
		}
		return before;
	});
}

/**
 * A refusal the editor can act on, with its code in `data`: h3's
 * `createError` puts it in the response body, where the client reads it.
 */
function warnThresholdError(
	statusCode: number,
	statusMessage: string,
	data: Record<string, unknown>,
) {
	return createH3Error({ data, message: statusMessage, statusCode, statusMessage });
}

const ERROR_RESPONSES = {
	limit: [400, "Too many warning thresholds"],
	unknown: [404, "Warning threshold not set"],
} as const satisfies Record<WarnThresholdErrorCode, readonly [number, string]>;

/** Answers with what went wrong; anything that is not a {@linkcode WarnThresholdError} is thrown again. */
export function throwWarnThresholdError(error: unknown): never {
	if (!(error instanceof WarnThresholdError)) throw error;

	const [status, message] = ERROR_RESPONSES[error.code];
	throw warnThresholdError(status, message, { code: error.code });
}

/** Answers a request whose body the validator refused. */
export function throwInvalidWarnThresholdBody(errors: readonly string[]): never {
	throw warnThresholdError(400, "Invalid body", { code: "invalid", errors });
}

/** The number of warnings of the path. */
export function readCountParam(event: H3Event): number {
	const count = parseWarnThresholdCount(getRouterParam(event, "count"));
	if (count === null) {
		throw warnThresholdError(400, "Invalid number of warnings", {
			code: "invalid",
			errors: ["count: Expected a whole number of warnings from 1 to 50."],
		});
	}
	return count;
}

/**
 * Records a change to a threshold in the audit chain. A threshold has no
 * settings key of its own, so its fields are filed under
 * `warnThreshold.<count>`, as the rules are under `automodRule.<name>`.
 */
export function auditWarnThresholdChange(
	event: H3Event,
	change: WarnThresholdChange,
	count: number,
) {
	const { guild, member } = useManagedGuild(event);
	const key = `warnThreshold.${count}`;
	const fields = (threshold: WarnThreshold | null) => {
		if (threshold === null) return {};
		const { count: _count, ...rest } = threshold;
		return { [key]: rest };
	};

	withAuditMethods(useLogger(event)).audit(
		guildSettingsUpdate({
			actor: { type: "user", id: member.user.id, displayName: member.user.username },
			changes: compactSettingsChanges(fields(change.before), fields(change.after)),
			outcome: "success",
			target: { type: "guild", id: guild.id },
		}),
	);
}
