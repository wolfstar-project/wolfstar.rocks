import {
	authorizeWarnThresholdManager,
	readWarnThresholds,
	useManagedGuild,
} from "#server/utils/warn-thresholds";

/** `GET /api/guilds/:guild/warn-thresholds`: the server's own warning thresholds, by their number of warnings. */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		return readWarnThresholds(guild.id);
	},
	{
		auth: true,
		authorize: authorizeWarnThresholdManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 10, window: seconds(10) },
	},
);
