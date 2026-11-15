import type { AutoModerationRule } from "#shared/utils/automod-rules";
import { checkAutoModerationLogChannel } from "#server/utils/automod/log-channel";
import {
	auditAutoModerationRuleChange,
	authorizeAutoModerationManager,
	throwAutoModerationRuleError,
	throwInvalidLogChannel,
	throwInvalidRuleBody,
} from "#server/utils/automod/route";
import { updateAutoModerationRule } from "#server/utils/automod/rules";
import { parseAutoModerationRulePatch } from "#server/utils/automod/validation";
import { useManagedGuild } from "#server/utils/guilds/manager";
import { isSnowflake } from "#shared/utils/snowflake";

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

		// Discord is asked before the write queue, which holds a lock while it
		// runs: a log channel the bot cannot post in is refused, as the bot's
		// own route refuses it. Only a channel is checked, `null` puts the logs
		// back in the moderation channel.
		const logChannelId =
			typeof body === "object" && body !== null && "logChannelId" in body
				? body.logChannelId
				: undefined;
		if (typeof logChannelId === "string" && isSnowflake(logChannelId)) {
			const channelError = await checkAutoModerationLogChannel(guild, logChannelId);
			if (channelError !== null) throwInvalidLogChannel(channelError);
		}

		// The body is validated against the rule the database has inside the
		// write queue, so its options merge on current values and not on a
		// copy another request may have changed meanwhile.
		let errors: string[] | undefined;
		const change = await updateAutoModerationRule(guild.id, ruleId, (current) => {
			const parsed = parseAutoModerationRulePatch(current.type, body, current);
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
