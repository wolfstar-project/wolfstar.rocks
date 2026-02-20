import { useLogger } from "evlog";
defineRouteMeta({
	openAPI: {
		description:
			"Retrieves a list of all channels within a guild. Requires the user to have management permissions for the guild.",
		operationId: "listGuildChannels",
		parameters: [
			{
				description: "The Discord snowflake ID of the guild",
				in: "path",
				name: "guild",
				required: true,
				schema: { example: "123456789012345678", type: "string" },
			},
		],
		responses: {
			200: {
				content: {
					"application/json": {
						schema: {
							items: {
								properties: {
									createdTimestamp: {
										description: "Unix timestamp of channel creation",
										type: "integer",
									},
									guildId: {
										description: "The guild's snowflake ID",
										example: "123456789012345678",
										type: "string",
									},
									id: {
										description: "The channel's snowflake ID",
										example: "987654321098765432",
										type: "string",
									},
									name: {
										description: "The channel name",
										example: "general",
										type: "string",
									},
									nsfw: {
										description: "Whether the channel is NSFW",
										type: "boolean",
									},
									parentId: {
										description: "The parent category ID",
										nullable: true,
										type: "string",
									},
									permissionOverwrites: {
										description: "Permission overwrites for the channel",
										type: "array",
									},
									rawPosition: {
										description: "The channel's position in the channel list",
										example: 1,
										type: "integer",
									},
									topic: {
										description: "The channel topic",
										nullable: true,
										type: "string",
									},
									type: {
										description:
											"The channel type (0 = text, 2 = voice, 4 = category, etc.)",
										example: 0,
										type: "integer",
									},
								},
								type: "object",
							},
							type: "array",
						},
					},
				},
				description: "List of channels retrieved successfully",
			},
			401: { description: "Authentication required" },
			403: { description: "Insufficient permissions to access this guild" },
			429: { description: "Rate limit exceeded" },
			500: { description: "Failed to fetch channels from Discord" },
		},
		security: [{ discordOAuth: ["identify", "guilds"] }],
		summary: "List all channels",
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

		const member = await getCurrentMember(event, guild.id);
		log.set({ member: { id: member.user.id } });
		await canManage(guild, member);

		const channels = await api.guilds.getChannels(guild.id).catch((error) => {
			log.error(error);
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

		log.set({ result: { channelCount: channels.length } });
		return channels.map((channel) => flattenGuildChannel(channel as any));
	},
	{
		auth: true,
		onError(log, error) {
			log.error(error);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
