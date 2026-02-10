defineRouteMeta({
	openAPI: {
		description:
			"Retrieves the currently authenticated user's profile and a list of guilds they are a member of. Returns TransformedLoginData with user info, raw Discord guilds, and transformed guilds with bot-specific information.",
		operationId: "getCurrentUserAndGuilds",
		responses: {
			200: {
				content: {
					"application/json": {
						example: {
							guilds: [
								{
									features: ["COMMUNITY", "NEWS"],
									icon: "a_1234567890abcdef",
									id: "987654321098765432",
									name: "WolfStar Support",
									owner: true,
									permissions: "2199023255551",
								},
							],
							transformedGuilds: [
								{
									acronym: "WS",
									approximateMemberCount: 1500,
									approximatePresenceCount: 350,
									banner: null,
									features: ["COMMUNITY", "NEWS"],
									icon: "a_1234567890abcdef",
									id: "987654321098765432",
									manageable: true,
									name: "WolfStar Support",
									ownerId: "123456789012345678",
									partnered: false,
									permissions: 2_199_023_255_551,
									premiumSubscriptionCount: 14,
									premiumTier: 2,
									splash: null,
									verified: false,
									wolfstarIsIn: true,
								},
							],
							user: {
								avatar: "a_1234567890abcdef",
								bot: false,
								discriminator: "0",
								flags: 0,
								global_name: "WolfStar User",
								id: "123456789012345678",
								locale: "en-US",
								premium_type: 2,
								public_flags: 64,
								username: "wolfstar_user",
								verified: true,
							},
						},
						schema: {
							description: "TransformedLoginData from shared/types/discord.d.ts",
							properties: {
								connections: {
									description: "RESTGetAPICurrentUserConnectionsResult - User's connections (requires connections scope)",
									items: {
										properties: {
											id: { description: "Connection account ID", type: "string" },
											name: { description: "Connection account username", type: "string" },
											type: { description: "Connection service type", example: "twitch", type: "string" },
											verified: { description: "Whether the connection is verified", type: "boolean" },
											visibility: { description: "Visibility of the connection (0 = None, 1 = Everyone)", type: "integer" },
										},
										type: "object",
									},
									nullable: true,
									type: "array",
								},
								guilds: {
									description: "RESTGetAPICurrentUserGuildsResult - Raw guilds from Discord API",
									items: {
										properties: {
											id: { type: "string", description: "Guild snowflake ID", example: "987654321098765432" },
											name: { type: "string", description: "Guild name (2-100 characters)", example: "WolfStar Support" },
											icon: { type: "string", nullable: true, description: "Guild icon hash", example: "a_1234567890abcdef" },
											owner: { type: "boolean", description: "True if the user is the owner of the guild" },
											permissions: {
												type: "string",
												description: "Total permissions for the user (excludes overwrites)",
												example: "2199023255551",
											},
											features: {
												type: "array",
												items: { type: "string" },
												description: "Enabled guild features",
												example: ["COMMUNITY", "NEWS", "ANIMATED_ICON"],
											},
											approximate_member_count: { type: "integer", description: "Approximate number of members" },
											approximate_presence_count: { type: "integer", description: "Approximate number of online members" },
										},
										type: "object",
									},
									nullable: true,
									type: "array",
								},
								transformedGuilds: {
									description: "OauthFlattenedGuild[] - Guilds transformed with bot-specific information",
									items: {
										description: "OauthFlattenedGuild from shared/types/discord.d.ts",
										properties: {
											id: { type: "string", description: "Guild snowflake ID", example: "987654321098765432" },
											name: { type: "string", description: "Guild name", example: "WolfStar Support" },
											acronym: { type: "string", description: "Guild name acronym for icon fallback", example: "WS" },
											icon: { type: "string", nullable: true, description: "Guild icon hash" },
											banner: { type: "string", nullable: true, description: "Guild banner hash" },
											splash: { type: "string", nullable: true, description: "Guild splash hash" },
											afkChannelId: { type: "string", nullable: true, description: "AFK channel ID" },
											afkTimeout: { type: "integer", description: "AFK timeout in seconds", example: 300 },
											applicationId: { type: "string", nullable: true, description: "Application ID if bot-created" },
											approximateMemberCount: { type: "integer", description: "Approximate member count", example: 1500 },
											approximatePresenceCount: { type: "integer", description: "Approximate online count", example: 350 },
											defaultMessageNotifications: { type: "integer", description: "Default message notification level" },
											description: { type: "string", nullable: true, description: "Guild description" },
											widgetEnabled: { type: "boolean", description: "Whether widget is enabled" },
											explicitContentFilter: { type: "integer", description: "Explicit content filter level" },
											features: {
												type: "array",
												items: { type: "string" },
												description: "Enabled guild features",
											},
											joinedTimestamp: { type: "integer", nullable: true, description: "When bot joined (if applicable)" },
											mfaLevel: { type: "integer", description: "Required MFA level for moderation" },
											ownerId: { type: "string", nullable: true, description: "Owner's user snowflake ID" },
											partnered: { type: "boolean", description: "Whether the guild is partnered" },
											preferredLocale: { type: "string", description: "Preferred locale", example: "en-US" },
											premiumSubscriptionCount: { type: "integer", description: "Number of boosts", example: 14 },
											premiumTier: { type: "integer", description: "Premium tier (0-3)", example: 2 },
											systemChannelId: { type: "string", nullable: true, description: "System channel ID" },
											vanityURLCode: { type: "string", nullable: true, description: "Vanity URL code" },
											verificationLevel: { type: "integer", description: "Verification level required" },
											verified: { type: "boolean", description: "Whether the guild is verified" },
											permissions: {
												type: "integer",
												description: "User's computed permissions as integer",
												example: 2_199_023_255_551,
											},
											manageable: {
												type: "boolean",
												description: "Whether the user can manage bot settings (has MANAGE_GUILD)",
												example: true,
											},
											wolfstarIsIn: { type: "boolean", description: "Whether WolfStar bot is in this guild", example: true },
										},
										required: ["id", "name", "acronym", "permissions", "manageable", "wolfstarIsIn"],
										type: "object",
									},
									type: "array",
								},
								user: {
									description: "RESTGetAPICurrentUserResult - The authenticated Discord user",
									nullable: true,
									properties: {
										accent_color: { type: "integer", nullable: true, description: "User's banner color as integer" },
										avatar: {
											type: "string",
											nullable: true,
											description: "User's avatar hash",
											example: "a_1234567890abcdef1234567890abcdef",
										},
										avatar_decoration_data: { type: "object", nullable: true, description: "Avatar decoration data" },
										banner: { type: "string", nullable: true, description: "User's banner hash" },
										bot: { type: "boolean", description: "Whether the user is a bot account" },
										discriminator: {
											type: "string",
											description: "User's 4-digit discriminator (legacy, '0' for new usernames)",
											example: "0",
										},
										email: { type: "string", nullable: true, description: "User's email (requires email scope)" },
										flags: { type: "integer", description: "User's account flags" },
										global_name: {
											type: "string",
											nullable: true,
											description: "User's display name (global)",
											example: "WolfStar User",
										},
										id: { type: "string", description: "User's Discord snowflake ID", example: "123456789012345678" },
										locale: { type: "string", description: "User's chosen language option", example: "en-US" },
										mfa_enabled: { type: "boolean", description: "Whether the user has two factor enabled" },
										premium_type: { type: "integer", description: "Type of Nitro subscription" },
										public_flags: { type: "integer", description: "User's public flags" },
										system: { type: "boolean", description: "Whether the user is an Official Discord System user" },
										username: { type: "string", description: "User's username (not nickname)", example: "wolfstar_user" },
										verified: { type: "boolean", description: "Whether the email has been verified" },
									},
									type: "object",
								},
							},
							required: ["transformedGuilds"],
							type: "object",
						},
					},
				},
				description: "TransformedLoginData - User profile with guild information",
			},
			401: { description: "Authentication required" },
			429: { description: "Rate limit exceeded" },
			500: { description: "Internal server error - failed to fetch or transform data" },
		},
		security: [{ discordOAuth: ["identify", "guilds"] }],
		summary: "Get current user and guilds",
		tags: ["Discord API"],
	},
});

export default defineWrappedResponseHandler(
	async (event) => {
		const { user, guilds } = await getCurrentUser(event);

		// Transform and return data with improved error handling
		const transformedData = await transformOauthGuildsAndUser({
			guilds,
			user,
		}).catch((error) => {
			throw createError({
				message: error.message || "Unknown error",
				status: 500,
				statusText: `Data transformation failed`,
			});
		});

		return { ...transformedData, guilds };
	},
	{
		auth: true,
		onError(logger, error) {
			logger.error("Failed to transform guilds and user data:", error);
		},
		onSuccess(logger, { user }) {
			logger.info(`Successfully transformed guilds and user: ${user?.id}`);
		},
		rateLimit: { enabled: true, limit: 2, window: seconds(5) },
	},
);
