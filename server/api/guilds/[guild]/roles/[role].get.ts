import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { createError, useLogger } from "evlog";

defineRouteMeta({
	openAPI: {
		description:
			"Retrieves detailed information about a specific role within a guild, including its permissions and color. Requires the user to have management permissions for the guild.",
		operationId: "getGuildRole",
		parameters: [
			{
				description: "The Discord snowflake ID of the guild",
				in: "path",
				name: "guild",
				required: true,
				schema: { example: "123456789012345678", type: "string" },
			},
			{
				description: "The Discord snowflake ID of the role to retrieve",
				in: "path",
				name: "role",
				required: true,
				schema: { example: "987654321098765432", type: "string" },
			},
		],
		responses: {
			200: {
				content: {
					"application/json": {
						schema: {
							properties: {
								color: { description: "The role color as an integer", example: 3_447_003, type: "integer" },
								guildId: { description: "The guild's snowflake ID", example: "123456789012345678", type: "string" },
								hoist: { description: "Whether the role is displayed separately", example: true, type: "boolean" },
								icon: { description: "The role icon hash", nullable: true, type: "string" },
								id: { description: "The role's snowflake ID", example: "987654321098765432", type: "string" },
								managed: { description: "Whether the role is managed by an integration", example: false, type: "boolean" },
								mentionable: { description: "Whether the role can be mentioned", example: true, type: "boolean" },
								name: { description: "The role name", example: "Moderator", type: "string" },
								permissions: { description: "The role permissions as a bitfield string", example: "1071698660929", type: "string" },
								rawPosition: { description: "The role's position in the role list", example: 5, type: "integer" },
							},
							type: "object",
						},
					},
				},
				description: "Role data retrieved successfully",
			},
			400: { description: "Role ID is required or invalid" },
			401: { description: "Authentication required" },
			403: { description: "Insufficient permissions to access this guild" },
			404: { description: "Role not found in the guild" },
			429: { description: "Rate limit exceeded" },
			500: { description: "Failed to fetch role data from Discord" },
		},
		security: [{ discordOAuth: ["identify", "guilds"] }],
		summary: "Get role by ID",
		tags: ["Discord API"],
	},
});

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
