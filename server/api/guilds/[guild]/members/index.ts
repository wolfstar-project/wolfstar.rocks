import { useLogger } from "evlog";

defineRouteMeta({
	openAPI: {
		description:
			"Retrieves a list of all members within a guild. Requires the user to have management permissions for the guild.",
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
									guildId: {
										description: "The guild's snowflake ID",
										type: "string",
									},
									id: {
										description: "The member's user snowflake ID",
										type: "string",
									},
									joinedTimestamp: {
										description: "Unix timestamp when the member joined",
										nullable: true,
										type: "integer",
									},
									premiumSinceTimestamp: {
										description:
											"Unix timestamp when the member started boosting",
										nullable: true,
										type: "integer",
									},
									roles: {
										description: "List of roles the member has",
										type: "array",
									},
									user: { description: "The user object", type: "object" },
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
