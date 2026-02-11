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
								guildId: { description: "The guild's snowflake ID", example: "123456789012345678", type: "string" },
								id: { description: "The member's user snowflake ID", example: "987654321098765432", type: "string" },
								joinedTimestamp: {
									description: "Unix timestamp when the member joined",
									example: 1_609_459_200_000,
									nullable: true,
									type: "integer",
								},
								premiumSinceTimestamp: {
									description: "Unix timestamp when the member started boosting",
									nullable: true,
									type: "integer",
								},
								roles: {
									description: "List of roles the member has",
									items: {
										properties: {
											color: { description: "Role color as integer", type: "integer" },
											id: { description: "Role snowflake ID", type: "string" },
											name: { description: "Role name", type: "string" },
											position: { description: "Role position", type: "integer" },
										},
										type: "object",
									},
									type: "array",
								},
								user: {
									description: "The user object",
									properties: {
										avatar: { description: "Avatar hash", nullable: true, type: "string" },
										bot: { description: "Whether the user is a bot", type: "boolean" },
										discriminator: { description: "User discriminator", type: "string" },
										globalName: { description: "Display name", nullable: true, type: "string" },
										id: { description: "User snowflake ID", type: "string" },
										username: { description: "Username", type: "string" },
									},
									type: "object",
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
