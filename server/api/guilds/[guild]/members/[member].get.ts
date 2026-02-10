import { isNullOrUndefined } from "@sapphire/utilities/isNullish";

defineRouteMeta({
	openAPI: {
		description: "Retrieves detailed information about a specific member within a guild, including their roles and permissions.",
		operationId: "getGuildMember",
		parameters: [
			{
				description: "The Discord snowflake ID of the guild",
				in: "path",
				name: "guild",
				required: true,
				schema: { example: "123456789012345678", type: "string" },
			},
			{
				description: "The Discord snowflake ID of the member to retrieve",
				in: "path",
				name: "member",
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
								guildId: { type: "string", description: "The guild's snowflake ID", example: "123456789012345678" },
								id: { type: "string", description: "The member's user snowflake ID", example: "987654321098765432" },
								joinedTimestamp: {
									type: "integer",
									nullable: true,
									description: "Unix timestamp when the member joined",
									example: 1609459200000,
								},
								premiumSinceTimestamp: {
									type: "integer",
									nullable: true,
									description: "Unix timestamp when the member started boosting",
								},
								roles: {
									type: "array",
									description: "List of roles the member has",
									items: {
										type: "object",
										properties: {
											id: { type: "string", description: "Role snowflake ID" },
											name: { type: "string", description: "Role name" },
											color: { type: "integer", description: "Role color as integer" },
											position: { type: "integer", description: "Role position" },
										},
									},
								},
								user: {
									type: "object",
									description: "The user object",
									properties: {
										id: { type: "string", description: "User snowflake ID" },
										username: { type: "string", description: "Username" },
										discriminator: { type: "string", description: "User discriminator" },
										globalName: { type: "string", nullable: true, description: "Display name" },
										avatar: { type: "string", nullable: true, description: "Avatar hash" },
										bot: { type: "boolean", description: "Whether the user is a bot" },
									},
								},
							},
							type: "object",
						},
					},
				},
				description: "Member data retrieved successfully",
			},
			400: { description: "Member ID is required or invalid" },
			401: { description: "Authentication required" },
			404: { description: "Member not found in the guild" },
			429: { description: "Rate limit exceeded" },
			500: { description: "Failed to fetch member data from Discord" },
		},
		security: [{ discordOAuth: ["identify", "guilds"] }],
		summary: "Get member by ID",
		tags: ["Discord API"],
	},
});

export default defineWrappedResponseHandler(
	async (event) => {
		const guildId = getGuildParam(event);

		const guild = await getGuild(guildId);

		const currentMember = await getCurrentMember(event, guild.id);

		await canManage(guild, currentMember);

		const memberId = getRouterParam(event, "member");
		if (isNullOrUndefined(memberId)) {
			throw createError({
				message: "Member ID is required",
				status: 400,
			});
		}

		// Fetch member data
		const member = await getMember(guild.id, memberId);

		return flattenMember(member, guild);
	},
	{
		auth: true,
		onError(logger, error) {
			logger.error("Failed to retrieve member data:", error);
		},
		onSuccess(logger, data) {
			logger.info(`Successfully retrieved member data for member ID: ${data.id} in guild ID: ${data.guildId}`);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
