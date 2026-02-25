import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import { createError, useLogger } from "evlog";
import * as v from "valibot";

const querySchema = v.object({
	shouldSerialize: v.optional(v.boolean()),
});

export default defineWrappedResponseHandler(
	async (event) => {
		const api = useApi();
		const log = useLogger(event);

		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const { shouldSerialize } = await getValidatedQuery(event, (body) =>
			v.parse(querySchema, body),
		);

		const guild = await getGuild(guildId);

		const member = await getCurrentMember(event, guild.id);
		log.set({ member: { id: member.user.id } });
		await canManage(guild, member);

		const channels = await api.guilds.getChannels(guild.id).catch((error) => {
			log.error(error);
			throw createError({
				message: "Failed to fetch channels",
				status: 500,
				why: `Discord API error while fetching channels for guild ${guildId}`,
				cause: error,
			});
		});

		const result = shouldSerialize
			? await transformGuild(member.user.id, guild as RESTAPIPartialCurrentUserGuild)
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
