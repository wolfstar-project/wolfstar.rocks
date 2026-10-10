import type { AuditEventChanges, PermissionsNode, UniqueRoleSet } from "#server/database";
import type {
	AutoModerationRuleEscalationStep,
	AutoModerationRuleOptions,
} from "#shared/utils/automod-rules";

type StoredAuditEventChanges = AuditEventChanges;
type StoredAutoModerationRuleOptions = AutoModerationRuleOptions;

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
	}
}
