import type { Snowflake } from "discord-api-types/v10";
import { db, type Database } from "#server/database/prisma";
import {
	fetchJoinGuardRuleRows,
	insertJoinGuardRule,
	patchJoinGuardRule,
	removeJoinGuardRule,
} from "#server/database/settings/joinguard/rules";
import { createKeyedLock } from "#server/utils/keyed-lock";
import {
	MaximumJoinGuardRules,
	validateJoinGuardRule,
	type JoinGuardRule,
	type JoinGuardRuleInput,
	type JoinGuardRuleProblem,
} from "#shared/utils/join-guard";

/** What goes wrong when a rule is created, edited or deleted, to translate for whoever asked. */
export type JoinGuardRuleErrorCode = "limit" | "nameTaken" | "unknown" | "invalid";

export class JoinGuardRuleError extends Error {
	public constructor(
		public readonly code: JoinGuardRuleErrorCode,
		/** Why the rule is refused, for `invalid`. */
		public readonly problem: JoinGuardRuleProblem | null = null,
	) {
		super(`Join guard rule error: ${code}${problem === null ? "" : ` (${problem})`}`);
	}
}

/** Reads the rules of the join guard of a guild, oldest first. */
export function readJoinGuardRules(guildId: Snowflake): Promise<JoinGuardRule[]> {
	return fetchJoinGuardRuleRows(db.orm, guildId);
}

type Orm = Database["orm"];

const withGuildLock = createKeyedLock<Snowflake>();

// First key of the advisory lock the rule writes of a guild run under; the
// second is derived from the guild. Arbitrary, and only has to differ from the
// keys other code locks on (1_635_086_445 to 1_635_086_449 are taken).
const RULES_LOCK_NAMESPACE = 1_635_086_450;
const RULES_LOCK_KEY_RANGE = 2_147_483_647n;

/**
 * Runs the writes of a guild one after the other, each on the rules the
 * database has at that time, so the limit and the names are checked against
 * what is there: the queue orders the writes of this process, the
 * transaction-scoped advisory lock orders them across the other instances.
 *
 * The bot is not told: it reads the rules again every 10 seconds at most
 * (`JoinGuardConfigLifetime`), so there is nothing to drop.
 */
function writeJoinGuardRules<T>(
	guildId: Snowflake,
	callback: (rules: readonly JoinGuardRule[], orm: Orm) => Promise<T>,
): Promise<T> {
	return withGuildLock(guildId, () => {
		const guildKey = Number(BigInt(guildId) % RULES_LOCK_KEY_RANGE);
		return db.transaction(async (tx) => {
			await tx.execute(
				db.raw.sql`SELECT pg_advisory_xact_lock(${RULES_LOCK_NAMESPACE}, ${guildKey})`
					.affectedCount()
					.build(),
			);
			return callback(await fetchJoinGuardRuleRows(tx.orm, guildId), tx.orm);
		});
	});
}

/**
 * The name of the index made by hand that keeps the names of the rules of a
 * guild unique whatever their case (`20261027T2001_add_join_guard`). It
 * catches what {@linkcode assertNameFree} cannot: two processes creating the
 * same name at once.
 */
const UNIQUE_NAME_INDEX = "GuildJoinGuardRule_guild_id_name_key";

function isUniqueNameError(error: unknown) {
	for (let current = error; current instanceof Error; current = current.cause) {
		if (
			current.message.includes(UNIQUE_NAME_INDEX) ||
			(current as { constraint?: unknown }).constraint === UNIQUE_NAME_INDEX
		) {
			return true;
		}
	}
	return false;
}

function rethrowNameTaken(error: unknown): never {
	throw isUniqueNameError(error) ? new JoinGuardRuleError("nameTaken") : error;
}

function assertNameFree(rules: readonly JoinGuardRule[], name: string, ignoreId: string | null) {
	const lower = name.toLowerCase();
	if (rules.some((rule) => rule.id !== ignoreId && rule.name.toLowerCase() === lower)) {
		throw new JoinGuardRuleError("nameTaken");
	}
}

/** Refuses a rule the bot could not run, with the problem the editor shows for it. */
function assertValid(input: JoinGuardRuleInput) {
	const problem = validateJoinGuardRule(input);
	if (problem !== null) throw new JoinGuardRuleError("invalid", problem);
}

/**
 * Creates a rule for a guild, after the ones it has.
 * @throws {@linkcode JoinGuardRuleError} When the guild has the most rules it
 * can have, the rule is invalid, or its name is taken whatever its case.
 */
export async function createJoinGuardRule(
	guildId: Snowflake,
	input: JoinGuardRuleInput,
): Promise<JoinGuardRule> {
	assertValid(input);
	return writeJoinGuardRules(guildId, async (rules, orm) => {
		if (rules.length >= MaximumJoinGuardRules) throw new JoinGuardRuleError("limit");
		assertNameFree(rules, input.name, null);
		return insertJoinGuardRule(orm, guildId, input).catch(rethrowNameTaken);
	});
}

export interface JoinGuardRuleChange {
	/** The rule as the database had it when the write ran. */
	before: JoinGuardRule;
	/** The rule after the change. */
	after: JoinGuardRule;
	/** The fields that changed, empty when nothing did. */
	changed: (keyof JoinGuardRuleInput)[];
}

/**
 * Edits a rule of a guild. The fields that are given are merged into the rule
 * as the database has it inside the write queue, and the rule they make is
 * checked whole.
 * @throws {@linkcode JoinGuardRuleError} When the rule does not exist, the
 * rule it would become is invalid, or the new name is taken.
 */
export function updateJoinGuardRule(
	guildId: Snowflake,
	ruleId: string,
	patch: Partial<JoinGuardRuleInput>,
): Promise<JoinGuardRuleChange> {
	return writeJoinGuardRules(guildId, async (rules, orm) => {
		const rule = rules.find((entry) => entry.id === ruleId);
		if (!rule) throw new JoinGuardRuleError("unknown");

		const changed = (Object.keys(patch) as (keyof JoinGuardRuleInput)[]).filter(
			(key) => patch[key] !== undefined && patch[key] !== rule[key],
		);
		if (changed.length === 0) return { before: rule, after: rule, changed };

		const data = Object.fromEntries(
			changed.map((key) => [key, patch[key]]),
		) as Partial<JoinGuardRuleInput>;
		const after: JoinGuardRule = { ...rule, ...data };
		assertValid(after);
		if (changed.includes("name")) assertNameFree(rules, after.name, ruleId);

		const found = await patchJoinGuardRule(orm, guildId, ruleId, data).catch(rethrowNameTaken);
		if (!found) throw new JoinGuardRuleError("unknown");

		return { before: rule, after, changed };
	});
}

/**
 * Deletes a rule of a guild.
 * @returns The rule that was deleted.
 * @throws {@linkcode JoinGuardRuleError} When the rule does not exist.
 */
export function deleteJoinGuardRule(guildId: Snowflake, ruleId: string): Promise<JoinGuardRule> {
	return writeJoinGuardRules(guildId, async (rules, orm) => {
		const rule = rules.find((entry) => entry.id === ruleId);
		if (!rule || !(await removeJoinGuardRule(orm, guildId, ruleId))) {
			throw new JoinGuardRuleError("unknown");
		}
		return rule;
	});
}
