import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { createError, useLogger } from "evlog";

export default defineWrappedResponseHandler(
	async (event) => {
		const log = useLogger(event);

		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const guild = await getGuild(guildId);

		const currentMember = await getCurrentMember(event, guild.id);
		log.set({ member: { id: currentMember.user.id } });

		await canManage(guild, currentMember);

		const channelId = getRouterParam(event, "channel");
		if (isNullOrUndefined(channelId)) {
			throw createError({
				message: "Channel ID is required",
				status: 400,
				why: "No channel ID was provided in the request path",
				fix: "Include a valid channel snowflake ID in the URL",
			});
		}
		log.set({ channel: { id: channelId } });

		const channels = await $fetch<ReturnType<typeof flattenGuildChannel>[]>(
			`/api/guilds/${guildId}/channels`,
			{
				headers: event.headers,
			},
		).catch((error) => {
			log.error(error);
			throw createError({
				message: "Failed to fetch channels",
				status: 500,
				why: `Discord API error while fetching channels for guild ${guildId}`,
				cause: error,
			});
		});

		const channel = channels.find((channel: any) => channel.id === channelId) ?? null;

		if (isNullOrUndefined(channel)) {
			throw createError({
				message: "Channel not found",
				status: 404,
				why: `No channel with ID "${channelId}" exists in guild ${guildId}`,
				fix: "Verify the channel ID is correct and belongs to this guild",
			});
		}

		return channel;
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
