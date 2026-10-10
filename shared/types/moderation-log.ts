import type { APIGuildMember } from "discord-api-types/v10";
import type { ModerationAction, ModerationMetadata } from "./moderation-types";

export interface ModerationLogEntry {
	caseId: number;
	guildId: string;
	userId: string | null;
	targetMember: APIGuildMember | null;
	moderatorId: string;
	moderatorMember: APIGuildMember | null;
	typeCode: number;
	typeName: ModerationAction | "Unknown";
	reason: string | null;
	referenceId: number | null;
	duration: number;
	metadata: ModerationMetadata;
	createdAt: string | null;
}
