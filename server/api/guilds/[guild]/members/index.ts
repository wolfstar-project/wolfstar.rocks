import { useLogger } from "evlog";

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

		const members = await api.guilds.getMembers(guildId).catch((error) => {
			log.error(error);
			throw createError({
				data: {
					details: error,
					error: "members_fetch_failed",
					message: error.message || "Unknown error",
				},
				status: 500,
				statusText: "Failed to fetch members",
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
