import { db, type Database } from "#server/database/prisma";

/**
 * The Postgres channel the bot listens on to learn that the dashboard wrote a
 * guild's settings. The bot caches them per process and would otherwise keep
 * what it read until it restarts.
 */
export const GUILD_SETTINGS_UPDATE_CHANNEL = "guild_settings_update";

type DatabaseTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

/**
 * Tells the bot that `keys` of a guild's settings changed. Run inside the
 * write's transaction: Postgres delivers a notification only when that
 * transaction commits, so the bot never reads a write that was rolled back.
 * The payload names the keys, never their values, and stays far under
 * Postgres's 8000-byte limit.
 */
export async function notifyGuildSettingsUpdate(
	tx: Pick<DatabaseTransaction, "execute">,
	guildId: string,
	keys: readonly string[],
): Promise<void> {
	const payload = JSON.stringify({ guildId, keys: [...new Set(keys)].toSorted() });
	await tx.execute(
		db.raw.sql`SELECT pg_notify(${GUILD_SETTINGS_UPDATE_CHANNEL}, ${payload})`
			.affectedCount()
			.build(),
	);
}
