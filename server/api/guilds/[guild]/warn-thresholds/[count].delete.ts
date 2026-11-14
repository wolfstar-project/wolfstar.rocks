import { useManagedGuild } from "#server/utils/guilds/manager";
import {
	auditWarnThresholdChange,
	authorizeWarnThresholdManager,
	clearWarnThreshold,
	readCountParam,
	throwWarnThresholdError,
} from "#server/utils/warn-thresholds";

/** `DELETE /api/guilds/:guild/warn-thresholds/:count`: removes what happens at a number of warnings. */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		const count = readCountParam(event);

		const before = await clearWarnThreshold(guild.id, count).catch(throwWarnThresholdError);

		auditWarnThresholdChange(event, { after: null, before }, count);
		setResponseStatus(event, 204);
		return null;
	},
	{
		auth: true,
		authorize: authorizeWarnThresholdManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(1) },
	},
);
