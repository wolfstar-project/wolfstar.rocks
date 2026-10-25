import type { Snowflake } from "discord-api-types/v10";
import { db, type Database } from "#server/database/prisma";
import {
	fetchAutoModerationRules,
	insertAutoModerationRule,
	patchAutoModerationRule,
	removeAutoModerationRule,
} from "#server/database/settings/automod/storage";
import { createKeyedLock } from "#server/utils/keyed-lock";
import {
	getDefaultAutoModerationRule,
	MaximumAutoModerationRuleNameLength,
	MaximumAutoModerationRules,
	type AutoModerationRule,
	type AutoModerationRuleData,
	type AutoModerationRuleType,
} from "#shared/utils/automod-rules";

/**
 * What goes wrong when a rule is created, edited or deleted, to translate for
 * whoever asked. The codes are the bot's.
 */
export type AutoModerationRuleErrorCode = "limit" | "nameTaken" | "nameInvalid" | "unknown";

export class AutoModerationRuleError extends Error {
	public constructor(public readonly code: AutoModerationRuleErrorCode) {
		super(`Auto-moderation rule error: ${code}`);
	}
}

export type AutoModerationRuleUpdate = Partial<Omit<AutoModerationRuleData, "type">>;

/** Reads the auto-moderation rules of a guild, oldest first. */
export function readAutoModerationRules(guildId: Snowflake): Promise<AutoModerationRule[]> {
	return fetchAutoModerationRules(db.orm, guildId);
}

function validateName(
	rules: readonly AutoModerationRule[],
	name: string,
	ignoreId: string | null = null,
) {
	const trimmed = name.trim();
	if (trimmed.length === 0 || trimmed.length > MaximumAutoModerationRuleNameLength) {
		throw new AutoModerationRuleError("nameInvalid");
	}
	// A name made of digits could be taken for the ID of another rule:
	if (/^\d+$/u.test(trimmed)) throw new AutoModerationRuleError("nameInvalid");

	const lower = trimmed.toLowerCase();
	if (rules.some((rule) => rule.id !== ignoreId && rule.name.toLowerCase() === lower)) {
		throw new AutoModerationRuleError("nameTaken");
	}
	return trimmed;
}

type Orm = Database["orm"];

const withGuildLock = createKeyedLock<Snowflake>();

// First key of the advisory lock the rule writes of a guild run under; the
// second is derived from the guild. Arbitrary, and only has to differ from the
// keys other code locks on (the audit chain uses a single-key lock).
const RULES_LOCK_NAMESPACE = 1_635_086_445;
const RULES_LOCK_KEY_RANGE = 2_147_483_647n;

/**
 * Runs the writes of a guild one after the other, each on the rules the
 * database has at that time, so two changes made at once do not undo each
 * other.
 *
 * The queue orders the writes of this process without holding a connection for
 * each one waiting. The transaction-scoped advisory lock orders them across
 * the other instances of the dashboard, which share no memory. The bot does
 * not take that lock: against it, the unique index on the name is what holds.
 */
export async function writeAutoModerationRules<T>(
	guildId: Snowflake,
	callback: (rules: readonly AutoModerationRule[], orm: Orm) => Promise<T>,
): Promise<T> {
	return withGuildLock(guildId, () => {
		// Two guilds that share a key only wait for each other; nothing breaks.
		const guildKey = Number(BigInt(guildId) % RULES_LOCK_KEY_RANGE);
		return db.transaction(async (tx) => {
			await tx.execute(
				db.raw.sql`SELECT pg_advisory_xact_lock(${RULES_LOCK_NAMESPACE}, ${guildKey})`
					.affectedCount()
					.build(),
			);
			return callback(await fetchAutoModerationRules(tx.orm, guildId), tx.orm);
		});
	});
}

/**
 * The name of the index that keeps the names of the rules of a guild unique,
 * whatever the case. It catches what {@linkcode validateName} cannot: two
 * processes creating the same name at once.
 */
const UNIQUE_NAME_INDEX = "GuildAutoModerationRule_guild_id_name_key";

function isUniqueNameError(error: unknown) {
	for (let current = error; current instanceof Error; current = current.cause) {
		if (current.message.includes(UNIQUE_NAME_INDEX)) return true;
	}
	return false;
}

function rethrowNameTaken(error: unknown): never {
	throw isUniqueNameError(error) ? new AutoModerationRuleError("nameTaken") : error;
}

/**
 * Creates a rule for a guild.
 *
 * @param guildId - The ID of the guild.
 * @param name - The name of the rule, unique in the guild.
 * @param type - What the rule looks for.
 * @param data - What the rule does not take the default of.
 * @throws {@linkcode AutoModerationRuleError} When the guild has too many
 * rules, or the name is invalid or taken.
 */
export function createAutoModerationRule(
	guildId: Snowflake,
	name: string,
	type: AutoModerationRuleType,
	data: Partial<Omit<AutoModerationRuleData, "name" | "type">> = {},
): Promise<AutoModerationRule> {
	return writeAutoModerationRules(guildId, async (rules, orm) => {
		if (rules.length >= MaximumAutoModerationRules) throw new AutoModerationRuleError("limit");

		return insertAutoModerationRule(orm, guildId, {
			...getDefaultAutoModerationRule(type),
			...data,
			name: validateName(rules, name),
			type,
		}).catch(rethrowNameTaken);
	});
}

export interface AutoModerationRuleChange {
	/** The rule as the database had it when the write ran. */
	before: AutoModerationRule;
	/** The rule after the change. */
	after: AutoModerationRule;
	/** What was written, empty when nothing changed. */
	patch: AutoModerationRuleUpdate;
}

/**
 * Edits a rule of a guild. The type of a rule cannot change, since its
 * options depend on it.
 *
 * @param guildId - The ID of the guild.
 * @param ruleId - The ID of the rule.
 * @param resolve - Reads what changes from the rule as the database has it
 * inside the write queue, so two requests that change different options do
 * not restore each other's old value. Returns `null` to change nothing.
 * @throws {@linkcode AutoModerationRuleError} When the rule does not exist,
 * or the new name is invalid or taken.
 */
export function updateAutoModerationRule(
	guildId: Snowflake,
	ruleId: string,
	resolve: (rule: AutoModerationRule) => AutoModerationRuleUpdate | null,
): Promise<AutoModerationRuleChange> {
	return writeAutoModerationRules(guildId, async (rules, orm) => {
		const rule = rules.find((entry) => entry.id === ruleId);
		if (!rule) throw new AutoModerationRuleError("unknown");

		const update = resolve(rule);
		if (update === null || Object.keys(update).length === 0) {
			return { before: rule, after: rule, patch: {} };
		}

		const patch =
			update.name === undefined
				? update
				: { ...update, name: validateName(rules, update.name, ruleId) };
		const found = await patchAutoModerationRule(orm, guildId, ruleId, patch).catch(
			rethrowNameTaken,
		);
		if (!found) throw new AutoModerationRuleError("unknown");

		return { before: rule, after: { ...rule, ...patch } as AutoModerationRule, patch };
	});
}

/**
 * Deletes a rule of a guild.
 *
 * @returns The rule that was deleted.
 * @throws {@linkcode AutoModerationRuleError} When the rule does not exist.
 */
export function deleteAutoModerationRule(
	guildId: Snowflake,
	ruleId: string,
): Promise<AutoModerationRule> {
	return writeAutoModerationRules(guildId, async (rules, orm) => {
		const rule = rules.find((entry) => entry.id === ruleId);
		if (!rule || !(await removeAutoModerationRule(orm, guildId, ruleId))) {
			throw new AutoModerationRuleError("unknown");
		}
		return rule;
	});
}
