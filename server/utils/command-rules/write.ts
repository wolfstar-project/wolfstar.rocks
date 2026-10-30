import type { DatabaseTransaction } from "#server/database/settings/storage";
import type { CommandRuleSettings } from "#shared/utils/command-rules";
import { db } from "#server/database/prisma";
import { createError } from "evlog";

// Next to the namespaces of the rules of `automod/rules.ts` and of the Auto-* tables.
const COMMAND_RULES_LOCK_NAMESPACE = 1_635_086_449;
const LOCK_KEY_RANGE = 2_147_483_647n;

/** The answer to a save made on what someone else changed since. */
export function commandRuleConflict() {
	return createError({
		message: "This command changed since it was opened",
		status: 409,
		code: "conflict",
		why: "Someone saved this command after the editor loaded it, and saving would undo their change",
		fix: "Reload the command's rules and make the change again",
	});
}

/**
 * Refuses a save when the two settings it was made from are no longer what the
 * database holds. A Worker cannot wait on another request's lock (see
 * `canWaitOnOtherRequests`), so two saves can read the same settings, and the
 * later one would erase the earlier one, even for another command. It runs first
 * in the save's transaction: the advisory lock orders the saves of every
 * instance of the dashboard, and the row lock waits for a write in progress.
 *
 * @param guildId The guild the save is for.
 * @param read The settings the save was made from.
 */
export function assertCommandSettingsUnchanged(guildId: string, read: CommandRuleSettings) {
	return async (tx: DatabaseTransaction): Promise<void> => {
		// Two guilds that share a key only wait for each other; nothing breaks.
		const guildKey = Number(BigInt(guildId) % LOCK_KEY_RANGE);
		await tx.execute(
			db.raw.sql`SELECT pg_advisory_xact_lock(${COMMAND_RULES_LOCK_NAMESPACE}, ${guildKey})`
				.affectedCount()
				.build(),
		);
		await tx.execute(
			db.raw
				.sql`SELECT 1 FROM "public"."GuildCommands" WHERE "id" = ${guildId}::bigint FOR UPDATE`
				.affectedCount()
				.build(),
		);

		const row = await tx.orm.public.GuildCommands.first({ id: BigInt(guildId) });
		const stored = [row?.disabled ?? [], row?.disabledInChannels ?? []];
		const expected = [read.commandsDisabled, read.commandsRestrictions];
		if (JSON.stringify(stored) !== JSON.stringify(expected)) throw commandRuleConflict();
	};
}
