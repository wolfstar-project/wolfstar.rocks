import { readAppealForms } from "#server/utils/appeals/forms";
import { authorizeAppealFormManager } from "#server/utils/appeals/route";
import { useManagedGuild } from "#server/utils/guilds/manager";

/** `GET /api/guilds/:guild/appeals/forms`: the appeal forms of a guild, in their order. */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		return readAppealForms(guild.id);
	},
	{
		auth: true,
		authorize: authorizeAppealFormManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 10, window: seconds(10) },
	},
);
