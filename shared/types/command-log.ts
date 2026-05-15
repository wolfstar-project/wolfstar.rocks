import type { APIGuildMember } from "discord-api-types/v10";

export interface CommandLogEntry {
	id: string;
	guildId: string;
	userId: string;
	member: APIGuildMember | null;
	commandName: string;
	subcommand: string | null;
	channelId: string | null;
	success: boolean;
	errorReason: string | null;
	executedAt: string;
	latencyMs: number | null;
}
