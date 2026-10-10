import type { APIGuildMember } from "discord-api-types/v10";
import type { ModerationActionName, ModerationMetadata } from "./moderation-types";

export interface ModerationLogEntry {
	caseId: number;
	guildId: string;
	userId: string | null;
	targetMember: APIGuildMember | null;
	moderatorId: string;
	moderatorMember: APIGuildMember | null;
	typeCode: number;
	typeName: ModerationActionName | "Unknown";
	reason: string | null;
	referenceId: number | null;
	duration: number;
	metadata: ModerationMetadata;
	createdAt: string | null;
}
