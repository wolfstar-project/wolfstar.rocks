import type { APIGuildMember } from "discord-api-types/v10";
import type { ModerationMetadata, ModerationTypeName } from "./moderation-types";

export interface ModerationLogEntry {
	caseId: number;
	guildId: string;
	userId: string | null;
	targetMember: APIGuildMember | null;
	moderatorId: string;
	moderatorMember: APIGuildMember | null;
	typeCode: number;
	typeName: ModerationTypeName | "Unknown";
	reason: string | null;
	imageURL: string | null;
	duration: bigint | null;
	metadata: ModerationMetadata;
	createdAt: string | null;
}
