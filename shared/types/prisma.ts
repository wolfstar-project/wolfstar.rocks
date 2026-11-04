import type { AuditEventChanges, PermissionsNode, UniqueRoleSet } from "#server/database";
import type { AppealQuestion } from "#shared/utils/appeal-forms";
import type {
	AutoModerationRuleEscalationStep,
	AutoModerationRuleOptions,
} from "#shared/utils/automod-rules";

type StoredAuditEventChanges = AuditEventChanges;
type StoredAutoModerationRuleOptions = AutoModerationRuleOptions;
type StoredAppealQuestion = AppealQuestion;

/**
 * A file of an answer to an `attachment` question, which the website keeps
 * under `key`. Mirrors `AppealFile` in the bot's `settings/appeals/types.ts`.
 */
interface StoredAppealFile {
	key: string;
	name: string;
	size: number;
	contentType: string;
}

/**
 * The answer to a question of an appeal, with the label the question had, so
 * one that is renamed or deleted still reads. Mirrors `AppealAnswer` in the
 * bot's `settings/appeals/types.ts`; nothing reads it here yet.
 */
type StoredAppealAnswer =
	| { questionId: string; kind: "text"; label: string; value: string }
	| { questionId: string; kind: "choice"; label: string; value: string[] }
	| { questionId: string; kind: "attachment"; label: string; value: StoredAppealFile[] };

/**
 * A message the bot saved in a member's history (`MessageHistory`), as it was
 * when the history was made. Mirrors `MessageHistoryMessage` in the bot's
 * `settings/histories/storage.ts`.
 */
interface StoredMessageHistoryMessage {
	id: string;
	channelId: string;
	content: string;
	/** When it was sent, in milliseconds. */
	createdAt: number;
	attachments: string[];
}

declare global {
	/**
	 * The types the contract's `typed.Json(...)` columns name. The emitter
	 * writes them into `contract.d.ts` as `PrismaJson.<Name>`, so they have to
	 * exist as a global namespace.
	 *
	 * The members carry no `export`: an ambient namespace exports them anyway,
	 * and Nuxt's auto-import scanner would otherwise register each as a type
	 * of its own and shadow the real `AutoModerationRuleOptions`.
	 */
	// oxlint-disable-next-line ts/no-namespace
	namespace PrismaJson {
		type PermissionNodeEntries = PermissionsNode[];
		type UniqueRoleSetEntries = UniqueRoleSet[];
		type AuditEventChanges = StoredAuditEventChanges;
		type AutoModerationRuleOptions = StoredAutoModerationRuleOptions;
		type AutoModerationRuleEscalation = AutoModerationRuleEscalationStep[];
		type MessageHistoryMessages = StoredMessageHistoryMessage[];
		type AppealFormQuestions = StoredAppealQuestion[];
		type AppealAnswers = StoredAppealAnswer[];
	}
}
