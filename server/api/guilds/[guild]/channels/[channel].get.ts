import { isNullOrUndefined } from "@sapphire/utilities/isNullish";

defineRouteMeta({
	openAPI: {
		description:
			"Retrieves detailed information about a specific channel within a guild. Requires the user to have management permissions for the guild.",
		operationId: "getGuildChannel",
		parameters: [
			{
				description: "The Discord snowflake ID of the guild",
				in: "path",
				name: "guild",
				required: true,
				schema: { example: "123456789012345678", type: "string" },
			},
			{
				description: "The Discord snowflake ID of the channel to retrieve",
				in: "path",
				name: "channel",
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
								createdTimestamp: { type: "integer", description: "Unix timestamp of channel creation", example: 1609459200000 },
								guildId: { type: "string", description: "The guild's snowflake ID", example: "123456789012345678" },
								id: { type: "string", description: "The channel's snowflake ID", example: "987654321098765432" },
								name: { type: "string", description: "The channel name", example: "general" },
								nsfw: { type: "boolean", description: "Whether the channel is NSFW", example: false },
								parentId: { type: "string", nullable: true, description: "The parent category ID", example: "123456789012345679" },
								permissionOverwrites: { type: "array", description: "Permission overwrites for the channel" },
								rawPosition: { type: "integer", description: "The channel's position in the channel list", example: 1 },
								topic: { type: "string", nullable: true, description: "The channel topic", example: "Welcome to the general chat!" },
								type: { type: "integer", description: "The channel type (0 = text, 2 = voice, 4 = category, etc.)", example: 0 },
							},
							type: "object",
						},
					},
				},
				description: "Channel data retrieved successfully",
			},
			400: { description: "Channel ID is required or invalid" },
			401: { description: "Authentication required" },
			403: { description: "Insufficient permissions to access this guild" },
			404: { description: "Channel not found in the guild" },
			429: { description: "Rate limit exceeded" },
			500: { description: "Failed to fetch channel data from Discord" },
		},
		security: [{ discordOAuth: ["identify", "guilds"] }],
		summary: "Get channel by ID",
		tags: ["Discord API"],
	},
});

export default defineWrappedResponseHandler(
	async (event) => {
		const guildId = getGuildParam(event);

		const guild = await getGuild(guildId);

		const currentMember = await getCurrentMember(event, guild.id);

		await canManage(guild, currentMember);

		const channelId = getRouterParam(event, "channel");
		if (isNullOrUndefined(channelId)) {
			throw createError({
				data: {
					error: "channel_id_required",
					message: "Channel ID is required",
				},
				message: "Channel ID is required",
				status: 400,
			});
		}

		const channels = await $fetch<ReturnType<typeof flattenGuildChannel>[]>(`/api/guilds/${guildId}/channels`, {
			headers: event.headers,
		}).catch((error) => {
			throw createError({
				data: {
					details: error,
					error: "channels_fetch_failed",
					message: error.message || "Unknown error",
				},
				message: "Failed to fetch channels",
				status: 500,
			});
		});

		const channel = channels.find((channel: any) => channel.id === channelId) ?? null;

		if (isNullOrUndefined(channel)) {
			throw createError({
				data: {
					error: "channel_not_found",
					message: "Channel not found",
				},
				message: "Channel not found",
				status: 404,
			});
		}

		return channel;
	},
	{
		auth: true,
		onError(logger, error) {
			logger.error("Failed to retrieve channel data:", error);
		},
		onSuccess(logger, data) {
			logger.info(`Successfully retrieved channel data for channel ID: ${data.id} in guild ID: ${data.guildId}`);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
