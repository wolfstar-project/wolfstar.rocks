import type { Database } from "#server/database/prisma";
import type { Snowflake } from "discord-api-types/v10";

type Orm = Database["orm"];

/**
 * Whether an account is on the shared ban list: a guild banned it for
 * raiding or scamming, by the join guard or by the honeypot. The list
 * outlives the guild that banned them, and every guild's checkpoint reads it.
 */
export async function isOnJoinGuardSharedBanList(orm: Orm, userId: Snowflake): Promise<boolean> {
	const row = await orm.public.JoinGuardSharedBan.first({ userId: BigInt(userId) });
	return row !== null;
}
