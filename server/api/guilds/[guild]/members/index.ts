defineRouteMeta({
	openAPI: {
		description: "Retrieves a list of all members within a guild. Requires the user to have management permissions for the guild.",
		operationId: "listGuildMembers",
		parameters: [
			{
				description: "The Discord snowflake ID of the guild",
				in: "path",
				name: "guild",
				required: true,
				schema: { example: "123456789012345678", type: "string" },
			},
			{
				description: "Whether to serialize the member data for API response",
				in: "query",
				name: "shouldSerialize",
				required: false,
				schema: { type: "boolean" },
			},
		],
		responses: {
			200: {
				content: {
					"application/json": {
						schema: {
							items: {
								properties: {
									id: { type: "string", description: "The member's user snowflake ID" },
									guildId: { type: "string", description: "The guild's snowflake ID" },
									joinedTimestamp: { type: "integer", nullable: true, description: "Unix timestamp when the member joined" },
									premiumSinceTimestamp: {
										type: "integer",
										nullable: true,
										description: "Unix timestamp when the member started boosting",
									},
									roles: { type: "array", description: "List of roles the member has" },
									user: { type: "object", description: "The user object" },
								},
								type: "object",
							},
							type: "array",
						},
					},
				},
				description: "List of members retrieved successfully",
			},
			401: { description: "Authentication required" },
			403: { description: "Insufficient permissions to access this guild" },
			429: { description: "Rate limit exceeded" },
			500: { description: "Failed to fetch members from Discord" },
		},
		security: [{ discordOAuth: ["identify", "guilds"] }],
		summary: "List all members",
		tags: ["Guild Members"],
	},
});

export default defineWrappedResponseHandler(
	async (event) => {
		const api = useApi();

		const guildId = getGuildParam(event);

		const guild = await getGuild(guildId);

		const member = await getCurrentMember(event, guild.id);
		// Check permissions
		await canManage(guild, member);

		const members = await api.guilds.getMembers(guildId).catch((error) => {
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

		return members.map((member) => flattenMember(member, guild));
	},
	{
		auth: true,
		onError(logger, error) {
			logger.error("Failed to retrieve members:", error);
		},
		onSuccess(logger, data) {
			const count = Array.isArray(data) ? data.length : 0;
			const guildId = Array.isArray(data) && data.length > 0 && typeof data[0]?.guildId === "string" ? data[0].guildId : "unknown";
			logger.info(`Successfully retrieved ${count} members for guild ID: ${guildId}`);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
