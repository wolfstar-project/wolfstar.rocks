import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import * as yup from "yup";

const querySchema = yup.object({
	shouldSerialize: yup.boolean().optional(),
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
								acronym: { type: "string", description: "The guild name acronym", example: "MDS" },
								approximateMemberCount: { type: "integer", description: "Approximate number of members" },
								banner: { type: "string", nullable: true, description: "The guild banner hash" },
								channels: { type: "array", description: "List of guild channels" },
								description: { type: "string", nullable: true, description: "The guild description" },
								features: { type: "array", items: { type: "string" }, description: "Enabled guild features" },
								icon: { type: "string", nullable: true, description: "The guild icon hash" },
								id: { type: "string", description: "The guild's snowflake ID", example: "123456789012345678" },
								name: { type: "string", description: "The guild name", example: "My Discord Server" },
								ownerId: { type: "string", description: "The owner's user ID" },
								permissions: { type: "integer", description: "User's permissions in the guild" },
								premiumSubscriptionCount: { type: "integer", description: "Number of server boosts" },
								premiumTier: { type: "integer", description: "Server boost level (0-3)" },
								roles: { type: "array", description: "List of guild roles" },
								verificationLevel: { type: "integer", description: "Verification level required" },
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

		const { shouldSerialize } = await getValidatedQuery(event, (body) => querySchema.validate(body));

		const guild = await getGuild(guildId);

		const member = await getCurrentMember(event, guild.id);
		// Check permissions
		await canManage(guild, member);

		const channels = await api.guilds.getChannels(guild.id).catch(() => {
			throw createError({
				message: "Failed to fetch channels",
				status: 500,
			});
		});

		// Return flattened guild data
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
