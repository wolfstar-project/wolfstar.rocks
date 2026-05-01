import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import { readSettings } from "#server/database";
import { GuildQuerySchema } from "#shared/schemas";
import { createError, useLogger } from "evlog";
import { parse } from "valibot";

export default defineWrappedResponseHandler(
	async (event) => {
		const log = useLogger(event);

		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const { shouldSerialize } = await getValidatedQuery(event, (body) =>
			parse(GuildQuerySchema, body),
		);

		const guild = await getGuild(guildId);
		if (!guild) {
			throw createError({
				message: "Guild not found",
				status: 404,
				why: `The bot is not a member of guild ${guildId}`,
			});
		}

		const member = await getCurrentMember(event, guild.id);
		log.set({ member: { id: member.user.id } });

		const settings = await readSettings(guild.id);
		await canManage(guild, member, settings);

		const channels = await getGuildChannels(guild.id).catch((error) => {
			log.error(error);
			throw createError({
				message: "Failed to fetch channels",
				status: 500,
				why: `Discord API error while fetching channels for guild ${guildId}`,
				cause: error,
			});
		});

		const result = shouldSerialize
			? {
					...(await transformGuild(
						member.user.id,
						guild as RESTAPIPartialCurrentUserGuild,
						{
							includeChannels: false,
							prefetchedGuild: guild,
							prefetchedMember: member,
							prefetchedSettings: settings,
						},
					)),
					channels,
				}
			: flattenGuild({ ...guild, channels });
		log.set({
			result: { channelCount: channels.length, serialized: Boolean(shouldSerialize) },
		});
		return result;
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
