import { useLogger, createError } from "evlog";

export default defineWrappedResponseHandler(
	async (event) => {
		const api = useApi();
		const log = useLogger(event);

		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const guild = await getGuild(guildId);
		if (!guild) {
			throw createError({
				message: "Guild not found",
				status: 404,
				why: `The bot is not a member of guild ${guildId}`,
				fix: "check bot is a member of the guild",
			});
		}

		const member = await getCurrentMember(event, guild.id);
		log.set({ member: { id: member.user.id } });
		await canManage(guild, member);

		const members = await api.guilds.getMembers(guildId).catch((error) => {
			throw createError({
				message: "Failed to fetch members from Discord",
				status: 500,
				why: "Discord API returned an error when fetching the guild's member list",
				cause: error,
			});
		});

		log.set({ result: { memberCount: members.length } });
		return members.map((member) => flattenMember(member, guild));
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
