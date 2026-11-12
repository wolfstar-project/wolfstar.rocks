import {
	auditAutoModerationRuleChange,
	authorizeAutoModerationManager,
	throwAutoModerationRuleError,
	useManagedGuild,
} from "#server/utils/automod/route";
import { deleteAutoModerationRule } from "#server/utils/automod/rules";

/** `DELETE /api/guilds/:guild/automod/rules/:rule`: deletes a rule. */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		const ruleId = getRouterParam(event, "rule") ?? "";

		const rule = await deleteAutoModerationRule(guild.id, ruleId).catch(
			throwAutoModerationRuleError,
		);

		auditAutoModerationRuleChange(event, rule, null, rule.name);
		setResponseStatus(event, 204);
		return null;
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
