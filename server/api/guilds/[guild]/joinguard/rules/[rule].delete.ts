import { useManagedGuild } from "#server/utils/guilds/manager";
import {
	auditJoinGuardRuleChange,
	authorizeJoinGuardManager,
	readJoinGuardRowParam,
	throwJoinGuardRuleError,
} from "#server/utils/join-guard/route";
import { deleteJoinGuardRule } from "#server/utils/join-guard/rules";

/**
 * `DELETE /api/guilds/:guild/joinguard/rules/:rule`: deletes a rule. The rows
 * of the queue it stopped keep its name. Answers 204; 404 `{ code: "unknown" }`.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		const ruleId = readJoinGuardRowParam(event, "rule");

		const rule = await deleteJoinGuardRule(guild.id, ruleId).catch(throwJoinGuardRuleError);

		auditJoinGuardRuleChange(event, rule, null, rule.name);
		setResponseStatus(event, 204);
		return null;
	},
	{
		auth: true,
		authorize: authorizeJoinGuardManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(1) },
	},
);
