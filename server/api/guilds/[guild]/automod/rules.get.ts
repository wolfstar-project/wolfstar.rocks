import { authorizeAutoModerationManager, useManagedGuild } from "#server/utils/automod/route";
import { readAutoModerationRules } from "#server/utils/automod/rules";

/** `GET /api/guilds/:guild/automod/rules`: the auto-moderation rules of a guild, oldest first. */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		return readAutoModerationRules(guild.id);
	},
	{
		auth: true,
		authorize: authorizeAutoModerationManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 10, window: seconds(10) },
	},
);
