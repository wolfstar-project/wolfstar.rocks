import type { Announcement } from "#shared/types/announcement";
import type { API } from "@discordjs/core/http-only";
import type { APIRole } from "discord-api-types/v10";
import {
	ANNOUNCEMENT_LIMIT,
	appInvites,
	isApplicationProfile,
	toAnnouncements,
	type ApplicationProfile,
} from "#server/utils/announcements";
import { runtimeConfig } from "#server/utils/runtimeConfig";
import { useLogger } from "evlog";

/**
 * An app's public profile, with its bot user's banner for the card's cover
 * when the app has none; `undefined` when Discord does not answer with one.
 */
async function readAppProfile(api: API, id: string): Promise<ApplicationProfile | undefined> {
	const profile = await api.rest
		.get(`/applications/${id}/rpc`, { auth: false })
		.catch(() => undefined);
	if (!isApplicationProfile(profile)) return undefined;
	if (profile.cover_image) return profile;
	// An app's bot user shares its id. A bot without a banner, or none at all,
	// leaves the card without a cover.
	const bot = await api.users.get(id).catch(() => undefined);
	return { ...profile, bot_banner: bot?.banner };
}

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

		// The apps the posts invite to, read once each from their public
		// profile; a link whose app cannot be read stays a plain link.
		const appIds = new Set(
			messages.flatMap((message) => appInvites(message.content).map(({ id }) => id)),
		);
		const profiles = await Promise.all(Array.from(appIds, (id) => readAppProfile(api, id)));

		return toAnnouncements(
			messages,
			guildId,
			{
				channels: new Map(channels.map((entry) => [entry.id, entry.name ?? ""])),
				roles: new Map(roles.map((role) => [role.id, role.name])),
				users: new Map(),
			},
			new Map(profiles.flatMap((profile) => (profile ? [[profile.id, profile]] : []))),
		);
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
