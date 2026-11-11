import type { Announcement } from "#shared/types/announcement";
import type { APIRole } from "discord-api-types/v10";
import { ANNOUNCEMENT_LIMIT, toAnnouncements } from "#server/utils/announcements";
import { runtimeConfig } from "#server/utils/runtimeConfig";
import { useLogger } from "evlog";

/**
 * `GET /api/announcements/wolfstar`: the newest posts of WolfStar's
 * announcement channel, oldest first, for the WolfStar thread of the Home.
 * They are public, so every reader shares one cached copy, read from Discord
 * at most every ten minutes.
 */
export default defineWrappedCachedResponseHandler(
	async (event): Promise<Announcement[]> => {
		const channelId = runtimeConfig.discord.announcementsChannelId;
		useLogger(event).set({ channel: { id: channelId } });
		const api = useApi();

		const channel = await api.channels.get(channelId);
		const guildId = "guild_id" in channel && channel.guild_id ? channel.guild_id : "@me";
		const [messages, roles, channels] = await Promise.all([
			api.channels.getMessages(channelId, { limit: ANNOUNCEMENT_LIMIT }),
			// The names of mentioned roles and channels; a post still shows without them.
			guildId === "@me" ? [] : api.guilds.getRoles(guildId).catch((): APIRole[] => []),
			guildId === "@me"
				? []
				: api.guilds
						.getChannels(guildId)
						.catch((): { id: string; name: string | null }[] => []),
		]);

		return toAnnouncements(messages, guildId, {
			channels: new Map(channels.map((entry) => [entry.id, entry.name ?? ""])),
			roles: new Map(roles.map((role) => [role.id, role.name])),
			users: new Map(),
		});
	},
	{
		auth: true,
		getKey: () => "announcements:wolfstar",
		maxAge: 60 * 10,
		swr: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 30, window: seconds(60) },
	},
);
