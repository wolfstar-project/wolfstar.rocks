import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import * as v from "valibot";

const querySchema = v.object({
	shouldSerialize: v.optional(v.boolean()),
});

defineRouteMeta({
	openAPI: {
		description:
			"Retrieves detailed information about a specific guild, including its settings and configuration. Requires the user to have management permissions for the guild.",
		operationId: "getGuild",
		parameters: [
			{
				description: "The Discord snowflake ID of the guild",
				in: "path",
				name: "guild",
				required: true,
				schema: { example: "123456789012345678", type: "string" },
			},
			{
				description: "Whether to serialize the guild data for API response",
				in: "query",
				name: "shouldSerialize",
				required: false,
				schema: { default: false, type: "boolean" },
			},
		],
		responses: {
			200: {
				content: {
					"application/json": {
						schema: {
							properties: {
								acronym: { description: "The guild name acronym", example: "MDS", type: "string" },
								approximateMemberCount: { description: "Approximate number of members", type: "integer" },
								banner: { description: "The guild banner hash", nullable: true, type: "string" },
								channels: { description: "List of guild channels", type: "array" },
								description: { description: "The guild description", nullable: true, type: "string" },
								features: { description: "Enabled guild features", items: { type: "string" }, type: "array" },
								icon: { description: "The guild icon hash", nullable: true, type: "string" },
								id: { description: "The guild's snowflake ID", example: "123456789012345678", type: "string" },
								name: { description: "The guild name", example: "My Discord Server", type: "string" },
								ownerId: { description: "The owner's user ID", type: "string" },
								permissions: { description: "User's permissions in the guild", type: "integer" },
								premiumSubscriptionCount: { description: "Number of server boosts", type: "integer" },
								premiumTier: { description: "Server boost level (0-3)", type: "integer" },
								roles: { description: "List of guild roles", type: "array" },
								verificationLevel: { description: "Verification level required", type: "integer" },
							},
							type: "object",
						},
					},
				},
				description: "Guild data retrieved successfully",
			},
			401: { description: "Authentication required" },
			403: { description: "Insufficient permissions to access this guild" },
			404: { description: "Guild not found or bot is not in the guild" },
			429: { description: "Rate limit exceeded" },
			500: { description: "Failed to fetch guild data from Discord" },
		},
		security: [{ discordOAuth: ["identify", "guilds"] }],
		summary: "Get guild by ID",
		tags: ["Discord API"],
	},
});

export default defineWrappedResponseHandler(
	async (event) => {
		const api = useApi();

		const guildId = getGuildParam(event);

		const { shouldSerialize } = await getValidatedQuery(event, (body) => v.parse(querySchema, body));

		const guild = await getGuild(guildId);

		const member = await getCurrentMember(event, guild.id);
		await canManage(guild, member);

		const channels = await api.guilds.getChannels(guild.id).catch(() => {
			throw createError({
				message: "Failed to fetch channels",
				status: 500,
			});
		});

		const result = shouldSerialize
			? await transformGuild(member.user.id, guild as RESTAPIPartialCurrentUserGuild)
			: flattenGuild({ ...guild, channels });
		return result;
	},
	{
		auth: true,
		onError(logger, error) {
			logger.error("Failed to retrieve guild data:", error);
		},
		onSuccess(logger, data) {
			logger.info(`Successfully retrieved guild data for guild ID: ${data.id}`);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
