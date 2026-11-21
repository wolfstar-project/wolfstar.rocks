import { useManagedGuild } from "#server/utils/guilds/manager";
import {
	auditWarnThresholdChange,
	authorizeWarnThresholdManager,
	readCountParam,
	setWarnThreshold,
	throwInvalidWarnThresholdBody,
	throwWarnThresholdError,
} from "#server/utils/warn-thresholds";
import { parseWarnThresholdData } from "#shared/utils/warn-thresholds";

/**
 * `PUT /api/guilds/:guild/warn-thresholds/:count`: sets what happens at a number of warnings: `action`, `duration`
 * and `period` in seconds. It answers 201 for a number that had none, 200 for one that had it.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		const count = readCountParam(event);

		const parsed = parseWarnThresholdData(await readBody(event));
		if (parsed.errors) throwInvalidWarnThresholdBody(parsed.errors);

		const change = await setWarnThreshold(guild.id, count, parsed.data).catch(
			throwWarnThresholdError,
		);

		auditWarnThresholdChange(event, change, count);
		setResponseStatus(event, change.before === null ? 201 : 200);
		return change.after;
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
