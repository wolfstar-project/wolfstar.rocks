import {
	auditAutoChannelChange,
	authorizeAutoChannelManager,
	readChannelParam,
	throwAutoChannelError,
	throwInvalidAutoChannelBody,
	useManagedGuild,
} from "#server/utils/auto-channels/route";
import { assertGuildTextChannel, setAutoPurge } from "#server/utils/auto-channels/write";
import { parseAutoPurgeData } from "#shared/utils/auto-channels";

/**
 * `PUT /api/guilds/:guild/autopurge/:channel`: sets the purge of a channel: `interval` in seconds, `filter` and its `value`. It answers
 * 201 for a channel that had none, 200 for one that had it.
 */
export default defineWrappedResponseHandler(
	async (event) => {
		const { guild } = useManagedGuild(event);
		const channelId = readChannelParam(event);

		const parsed = parseAutoPurgeData(await readBody(event));
		if (parsed.errors) throwInvalidAutoChannelBody(parsed.errors);

		await assertGuildTextChannel(guild.id, channelId).catch(throwAutoChannelError);
		const { after, before } = await setAutoPurge(guild.id, channelId, parsed.data).catch(
			throwAutoChannelError,
		);

		auditAutoChannelChange(event, "autoPurge", channelId, before, after);
		setResponseStatus(event, before === null ? 201 : 200);
		return after;
	},
	{
		auth: true,
		authorize: authorizeAutoChannelManager,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(1) },
	},
);
