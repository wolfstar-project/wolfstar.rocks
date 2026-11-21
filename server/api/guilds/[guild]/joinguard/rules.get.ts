import type { JoinGuardRulesResponse } from "#shared/utils/join-guard";
import { useManagedGuild } from "#server/utils/guilds/manager";
import { authorizeJoinGuardManager } from "#server/utils/join-guard/route";
import { readJoinGuardRules } from "#server/utils/join-guard/rules";

/** `GET /api/guilds/:guild/joinguard/rules`: the rules of the join guard of a guild, oldest first. */
export default defineWrappedResponseHandler(
	async (event): Promise<JoinGuardRulesResponse> => {
		const { guild } = useManagedGuild(event);
		return { rules: await readJoinGuardRules(guild.id) };
	},
	{
		auth: true,
		authorize: authorizeJoinGuardManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 10, window: seconds(10) },
	},
);
