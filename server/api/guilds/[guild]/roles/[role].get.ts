import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { createError, useLogger } from "evlog";

export default defineWrappedResponseHandler(
	async (event) => {
		const api = useApi();
		const log = useLogger(event);

		const guildId = getGuildParam(event);
		log.set({ guild: { id: guildId } });

		const guild = await getGuild(guildId);

		const currentMember = await getCurrentMember(event, guild.id);
		log.set({ member: { id: currentMember.user.id } });

		await canManage(guild, currentMember);

		const roleId = getRouterParam(event, "role");
		if (isNullOrUndefined(roleId)) {
			throw createError({
				message: "Role ID is required",
				status: 400,
				why: "No role ID was provided in the request path",
				fix: "Include a valid role snowflake ID in the URL",
			});
		}
		log.set({ role: { id: roleId } });

		const role = await api.guilds.getRole(guild.id, roleId).catch((error) => {
			log.error(error);
			throw createError({
				message: "Failed to fetch role",
				status: 500,
				why: `Discord API error while fetching role ${roleId} for guild ${guildId}`,
				cause: error,
			});
		});

		return flattenRole(guild.id, role);
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
