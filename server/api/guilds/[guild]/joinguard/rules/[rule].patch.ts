import type { JoinGuardRule } from "#shared/utils/join-guard";
import { useManagedGuild } from "#server/utils/guilds/manager";
import {
	auditJoinGuardRuleChange,
	authorizeJoinGuardManager,
	parseJoinGuardInput,
	readJoinGuardRowParam,
	throwJoinGuardRuleError,
} from "#server/utils/join-guard/route";
import { updateJoinGuardRule } from "#server/utils/join-guard/rules";
import { JoinGuardRulePatchSchema } from "#shared/schemas/join-guard";

/**
 * `PATCH /api/guilds/:guild/joinguard/rules/:rule`: edits a rule. The body has
 * the fields that change; the rule they make with the others is checked whole.
 * Answers the rule; 404 `{ code: "unknown" }`, and the refusals of `POST`.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		const ruleId = readJoinGuardRowParam(event, "rule");
		const patch = parseJoinGuardInput(JoinGuardRulePatchSchema, await readBody(event));

		const change = await updateJoinGuardRule(guild.id, ruleId, patch).catch(
			throwJoinGuardRuleError,
		);

		if (change.changed.length > 0) {
			const pick = (rule: JoinGuardRule) =>
				Object.fromEntries(change.changed.map((key) => [key, rule[key]]));
			auditJoinGuardRuleChange(
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
		authorize: authorizeJoinGuardManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(1) },
	},
);
