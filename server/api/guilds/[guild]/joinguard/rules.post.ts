import { useManagedGuild } from "#server/utils/guilds/manager";
import {
	auditJoinGuardRuleChange,
	authorizeJoinGuardManager,
	parseJoinGuardInput,
	throwJoinGuardRuleError,
} from "#server/utils/join-guard/route";
import { createJoinGuardRule } from "#server/utils/join-guard/rules";
import { JoinGuardRuleFieldsSchema } from "#shared/schemas/join-guard";

/**
 * `POST /api/guilds/:guild/joinguard/rules`: creates a rule. The body is a
 * `JoinGuardRuleInput`; the fields it leaves out take the bot's defaults.
 * Answers 201 with the rule; 400 `{ code: <problem>, problem }` for a rule the
 * bot could not run (a `JoinGuardRuleProblem`) or `{ code: "invalid", errors }`
 * for a field of the wrong type, 400 `{ code: "limit" }` past 10 rules, 409
 * `{ code: "nameTaken" }` for a name another rule has, whatever its case.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		const input = parseJoinGuardInput(JoinGuardRuleFieldsSchema, await readBody(event));

		const rule = await createJoinGuardRule(guild.id, input).catch(throwJoinGuardRuleError);

		auditJoinGuardRuleChange(event, null, rule, rule.name);
		setResponseStatus(event, 201);
		return rule;
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
