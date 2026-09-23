import type { APIGuildMember } from "discord-api-types/v10";

/**
 * A command-log row as the API returns it.
 *
 * Deliberately not the Prisma model: V7 stores snowflakes as `BIGINT` and the
 * handler's return value goes through `JSON.stringify`, which throws on a
 * `bigint`. Ids cross the wire as strings and the timestamp as ISO text, which
 * is also the shape the table renders.
 */
export interface CommandLogEntry {
	id: string;
	guildId: string;
	userId: string;
	commandName: string;
	commandType: string;
	commandId: string | null;
	subcommand: string | null;
	channelId: string | null;
	success: boolean;
	errorReason: string | null;
	executedAt: string;
	latencyMs: number | null;
	metadata: { member: APIGuildMember };
}
