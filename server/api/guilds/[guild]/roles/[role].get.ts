import { isNullOrUndefined } from "@sapphire/utilities/isNullish";

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
								color: { type: "integer", description: "The role color as an integer", example: 3447003 },
								guildId: { type: "string", description: "The guild's snowflake ID", example: "123456789012345678" },
								hoist: { type: "boolean", description: "Whether the role is displayed separately", example: true },
								icon: { type: "string", nullable: true, description: "The role icon hash" },
								id: { type: "string", description: "The role's snowflake ID", example: "987654321098765432" },
								managed: { type: "boolean", description: "Whether the role is managed by an integration", example: false },
								mentionable: { type: "boolean", description: "Whether the role can be mentioned", example: true },
								name: { type: "string", description: "The role name", example: "Moderator" },
								permissions: { type: "string", description: "The role permissions as a bitfield string", example: "1071698660929" },
								rawPosition: { type: "integer", description: "The role's position in the role list", example: 5 },
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

		const guildId = getGuildParam(event);

		const guild = await getGuild(guildId);

		const currentMember = await getCurrentMember(event, guild.id);

		await canManage(guild, currentMember);

		const roleId = getRouterParam(event, "role");
		if (isNullOrUndefined(roleId)) {
			throw createError({
				data: {
					error: "role_id_required",
					field: "roleId",
					message: "Role ID is required",
				},
				message: "No role id provided",
				status: 400,
			});
		}

		const role = await api.guilds.getRole(guild.id, roleId).catch((error) => {
			throw createError({
				data: {
					details: error,
					error: "role_fetch_failed",
					message: error.message || "Unknown error",
				},
				message: "Failed to fetch role",
				status: 500,
			});
		});

		// Return flattened guild data
		return flattenRole(guild.id, role);
	},
	{
		auth: true,
		onError(logger, error) {
			logger.error("Failed to retrieve role data:", error);
		},
		onSuccess(logger, data) {
			logger.info(`Successfully retrieved role data for role ID: ${data.id} in guild ID: ${data.guildId}`);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
