import type { AuditEventChanges, PermissionsNode, UniqueRoleSet } from "#server/database";
import type {
	AutoModerationRuleEscalationStep,
	AutoModerationRuleOptions,
} from "#shared/utils/automod-rules";

type StoredAuditEventChanges = AuditEventChanges;
type StoredAutoModerationRuleOptions = AutoModerationRuleOptions;

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
	}
}
