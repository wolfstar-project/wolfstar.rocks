import type { AutoModerationRule } from "#shared/utils/automod-rules";
import type { H3Event } from "h3";
import { compactSettingsChanges } from "#server/utils/audit/patch-to-changes";
import { AutoModerationRuleError } from "#server/utils/automod/rules";
import { authorizeGuildManager, useManagedGuild } from "#server/utils/guilds/manager";
import { guildSettingsUpdate } from "#shared/audit/actions";
import { useLogger, withAuditMethods } from "evlog";
import { createError as createH3Error } from "h3";

/**
 * `authorize` hook of the auto-moderation rule routes: resolves the guild of
 * the path and checks that who asks can manage it. A refusal is audited, as it
 * is for the settings routes.
 */
export const authorizeAutoModerationManager = authorizeGuildManager(
	"Insufficient permissions to manage auto-moderation rules",
);

export { useManagedGuild };

/**
 * A refusal the rule editor can act on. Thrown with h3's `createError` rather
 * than evlog's: its `data` reaches the client in the response body, which is
 * where `useAutomodRules()` reads the code from.
 */
function ruleError(statusCode: number, statusMessage: string, data: Record<string, unknown>) {
	return createH3Error({ statusCode, statusMessage, message: statusMessage, data });
}

const RULE_ERROR_RESPONSES = {
	limit: [400, "Too many rules"],
	nameInvalid: [400, "Rule name invalid"],
	nameTaken: [409, "Rule name taken"],
	unknown: [404, "Rule not found"],
} as const satisfies Record<AutoModerationRuleError["code"], readonly [number, string]>;

/**
 * Answers a request with what went wrong when a rule was created, edited or
 * deleted. Anything that is not an {@linkcode AutoModerationRuleError} is
 * thrown again as it is.
 */
export function throwAutoModerationRuleError(error: unknown): never {
	if (!(error instanceof AutoModerationRuleError)) throw error;

	const [status, message] = RULE_ERROR_RESPONSES[error.code];
	throw ruleError(status, message, { code: error.code });
}

/** Answers a request whose body the rule validator refused. */
export function throwInvalidRuleBody(errors: readonly string[]): never {
	throw ruleError(400, "Invalid rule", { code: "invalid", errors });
}

/**
 * Records a change to the rules of a guild in the audit chain. A rule has no
 * settings key of its own, so its fields are filed under `automodRule.<name>`.
 */
export function auditAutoModerationRuleChange(
	event: H3Event,
	before: Partial<AutoModerationRule> | null,
	after: Partial<AutoModerationRule> | null,
	name: string,
): void {
	const { guild, member } = useManagedGuild(event);
	// The audit diff addresses a field by a `/`-separated path, so a `/` in the
	// name would split the key and lose the old values. `∕` reads the same.
	const key = `automodRule.${name.replaceAll("/", "∕")}`;

	withAuditMethods(useLogger(event)).audit(
		guildSettingsUpdate({
			actor: { type: "user", id: member.user.id, displayName: member.user.username },
			target: { type: "guild", id: guild.id },
			outcome: "success",
			changes: compactSettingsChanges(
				before === null ? {} : { [key]: before },
				after === null ? {} : { [key]: after },
			),
		}),
	);
}
