import {
	auditAutoModerationRuleChange,
	authorizeAutoModerationManager,
	throwAutoModerationRuleError,
	throwInvalidRuleBody,
	useManagedGuild,
} from "#server/utils/automod/route";
import { createAutoModerationRule } from "#server/utils/automod/rules";
import { parseAutoModerationRulePatch } from "#server/utils/automod/validation";
import { isAutoModerationRuleType } from "#shared/utils/automod-rules";

/**
 * `POST /api/guilds/:guild/automod/rules`: creates a rule. The body has the
 * `name` and the `type` of the rule, and whatever else it does not take the
 * default of.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);

		const body: unknown = await readBody(event);
		const { name, type } = (typeof body === "object" && body !== null ? body : {}) as {
			name?: unknown;
			type?: unknown;
		};
		if (typeof name !== "string") throwInvalidRuleBody(["name: Expected a string."]);
		if (!isAutoModerationRuleType(type)) throwInvalidRuleBody(["type: Unknown type of rule."]);

		const parsed = parseAutoModerationRulePatch(type, body);
		if (parsed.errors) throwInvalidRuleBody(parsed.errors);

		const { name: _name, ...data } = parsed.data;
		const rule = await createAutoModerationRule(guild.id, name, type, data).catch(
			throwAutoModerationRuleError,
		);

		auditAutoModerationRuleChange(event, null, rule, rule.name);
		setResponseStatus(event, 201);
		return rule;
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
