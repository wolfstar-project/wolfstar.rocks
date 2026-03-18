import { createError, useLogger } from "evlog";

export default defineWrappedResponseHandler(
	async (event) => {
		const api = useApi();
		const log = useLogger(event);

		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const guild = await getGuild(guildId);

		const member = await getCurrentMember(event, guild.id);
		log.set({ member: { id: member.user.id } });
		await canManage(guild, member);

		const channels = await api.guilds.getChannels(guild.id).catch((error) => {
			log.error(error);
			throw createError({
				message: "Failed to fetch channels",
				status: 500,
				why: "Discord API returned an error when fetching the guild's channel list",
				cause: error,
			});
		});

		log.set({ result: { channelCount: channels.length } });
		return channels.map((channel) => flattenGuildChannel(channel as any));
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
