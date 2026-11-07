import type { APIGuildMember } from "discord-api-types/v10";
import type { ModerationCaseExtra, ModerationCaseMessage } from "../utils/moderation-case";
import type {
	ModerationCaseStatus,
	ModerationMetadata,
	ModerationTypeName,
} from "./moderation-types";

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
	referenceId: number | null;
	/** Seconds, `0` when the case is not temporary. */
	duration: number;
	metadata: ModerationMetadata;
	status: ModerationCaseStatus;
	/** What the case holds besides its row: the roles the member had, the role, the old nickname. */
	extra: ModerationCaseExtra | null;
	/** The message the case is about, when it is about one. */
	message: ModerationCaseMessage | null;
	createdAt: string | null;
}
