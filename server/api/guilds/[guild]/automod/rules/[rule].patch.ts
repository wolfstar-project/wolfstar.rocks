import type { AutoModerationRule } from "#shared/utils/automod-rules";
import {
	auditAutoModerationRuleChange,
	authorizeAutoModerationManager,
	throwAutoModerationRuleError,
	throwInvalidRuleBody,
	useManagedGuild,
} from "#server/utils/automod/route";
import { updateAutoModerationRule } from "#server/utils/automod/rules";
import { parseAutoModerationRulePatch } from "#server/utils/automod/validation";

/**
 * `PATCH /api/guilds/:guild/automod/rules/:rule`: edits a rule. The body has
 * what changes; the options that are not given keep their value, and the type
 * of a rule cannot change.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		const ruleId = getRouterParam(event, "rule") ?? "";
		const body: unknown = await readBody(event);

		// The body is validated against the rule the database has inside the
		// write queue, so its options merge on current values and not on a
		// copy another request may have changed meanwhile.
		let errors: string[] | undefined;
		const change = await updateAutoModerationRule(guild.id, ruleId, (current) => {
			const parsed = parseAutoModerationRulePatch(current.type, body, current.options);
			errors = parsed.errors;
			return parsed.data ?? null;
		}).catch(throwAutoModerationRuleError);
		if (errors) throwInvalidRuleBody(errors);

		const changedKeys = Object.keys(change.patch) as (keyof AutoModerationRule)[];
		if (changedKeys.length > 0) {
			const pick = (rule: AutoModerationRule) =>
				Object.fromEntries(changedKeys.map((key) => [key, rule[key]]));
			auditAutoModerationRuleChange(
				event,
				pick(change.before),
				pick(change.after),
				change.before.name,
			);
		}

		return change.after;
	},
	{
		auth: true,
		authorize: authorizeAutoModerationManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(1) },
	},
);
