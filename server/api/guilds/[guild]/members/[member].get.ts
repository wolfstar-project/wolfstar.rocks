import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { createError, useLogger } from "evlog";

export default defineWrappedResponseHandler(
	async (event) => {
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

		const currentMember = await getCurrentMember(event, guild.id);
		log.set({ member: { id: currentMember.user.id } });

		await canManage(guild, currentMember);

		const memberId = getRouterParam(event, "member");
		if (isNullOrUndefined(memberId)) {
			throw createError({
				message: "Member ID is required",
				status: 400,
				why: "No member ID was provided in the request path",
				fix: "Include a valid member snowflake ID in the URL",
			});
		}
		log.set({ targetMember: { id: memberId } });

		const member = await getMember(guild.id, memberId);

		return flattenMember(member, guild);
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
