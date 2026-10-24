import type { H3Event } from "h3";
import { compactSettingsChanges } from "#server/utils/audit/patch-to-changes";
import { AutoChannelError, type AutoChannelKind } from "#server/utils/auto-channels/write";
import { authorizeGuildManager, useManagedGuild } from "#server/utils/guilds/manager";
import { guildSettingsUpdate } from "#shared/audit/actions";
import { isSnowflake } from "#shared/utils/snowflake";
import { useLogger, withAuditMethods } from "evlog";
import { createError as createH3Error } from "h3";

/**
 * `authorize` hook of the Auto-Delete, Auto-Purge and Auto-Message routes:
 * who asks has to manage the guild of the path, and a refusal is audited.
 */
export const authorizeAutoChannelManager = authorizeGuildManager(
	"Insufficient permissions to manage the automatic channels",
);

export { useManagedGuild };

/**
 * A refusal the editor can act on, with its code in `data`: h3's
 * `createError` puts it in the response body, where the client reads it.
 */
function autoChannelError(
	statusCode: number,
	statusMessage: string,
	data: Record<string, unknown>,
) {
	return createH3Error({ data, message: statusMessage, statusCode, statusMessage });
}

const ERROR_RESPONSES = {
	channel: [400, "Not a text channel of this server"],
	limit: [400, "Too many channels"],
	unknown: [404, "Channel not set"],
} as const satisfies Record<AutoChannelError["code"], readonly [number, string]>;

/** Answers with what went wrong; anything that is not an {@linkcode AutoChannelError} is thrown again. */
export function throwAutoChannelError(error: unknown): never {
	if (!(error instanceof AutoChannelError)) throw error;

	const [status, message] = ERROR_RESPONSES[error.code];
	throw autoChannelError(status, message, { code: error.code });
}

/** Answers a request whose body the validator refused. */
export function throwInvalidAutoChannelBody(errors: readonly string[]): never {
	throw autoChannelError(400, "Invalid body", { code: "invalid", errors });
}

/** The channel of the path, which has to be an ID. */
export function readChannelParam(event: H3Event): string {
	const channelId = getRouterParam(event, "channel") ?? "";
	if (!isSnowflake(channelId)) {
		throw autoChannelError(400, "Invalid channel", {
			code: "invalid",
			errors: ["channel: Expected a channel ID."],
		});
	}
	return channelId;
}

/**
 * Records a change to the row of a channel in the audit chain. A row has no
 * settings key of its own, so its fields are filed under `<kind>.<channel>`,
 * as the rules are under `automodRule.<name>`.
 */
export function auditAutoChannelChange(
	event: H3Event,
	kind: AutoChannelKind,
	channelId: string,
	before: object | null,
	after: object | null,
): void {
	const { guild, member } = useManagedGuild(event);
	const key = `${kind}.${channelId}`;

	withAuditMethods(useLogger(event)).audit(
		guildSettingsUpdate({
			actor: { type: "user", id: member.user.id, displayName: member.user.username },
			changes: compactSettingsChanges(
				before === null ? {} : { [key]: withoutId(before) },
				after === null ? {} : { [key]: withoutId(after) },
			),
			outcome: "success",
			target: { type: "guild", id: guild.id },
		}),
	);
}

// The row ID and the next run say nothing an admin changed.
function withoutId(row: object): Record<string, unknown> {
	const { id: _id, nextRunAt: _nextRunAt, ...rest } = row as Record<string, unknown>;
	return rest;
}
