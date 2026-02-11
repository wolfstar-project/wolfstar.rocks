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
											approximate_member_count: { description: "Approximate number of members", type: "integer" },
											approximate_presence_count: { description: "Approximate number of online members", type: "integer" },
											features: {
												description: "Enabled guild features",
												example: ["COMMUNITY", "NEWS", "ANIMATED_ICON"],
												items: { type: "string" },
												type: "array",
											},
											icon: { description: "Guild icon hash", example: "a_1234567890abcdef", nullable: true, type: "string" },
											id: { description: "Guild snowflake ID", example: "987654321098765432", type: "string" },
											name: { description: "Guild name (2-100 characters)", example: "WolfStar Support", type: "string" },
											owner: { description: "True if the user is the owner of the guild", type: "boolean" },
											permissions: {
												description: "Total permissions for the user (excludes overwrites)",
												example: "2199023255551",
												type: "string",
											},
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
											acronym: { description: "Guild name acronym for icon fallback", example: "WS", type: "string" },
											afkChannelId: { description: "AFK channel ID", nullable: true, type: "string" },
											afkTimeout: { description: "AFK timeout in seconds", example: 300, type: "integer" },
											applicationId: { description: "Application ID if bot-created", nullable: true, type: "string" },
											approximateMemberCount: { description: "Approximate member count", example: 1500, type: "integer" },
											approximatePresenceCount: { description: "Approximate online count", example: 350, type: "integer" },
											banner: { description: "Guild banner hash", nullable: true, type: "string" },
											defaultMessageNotifications: { description: "Default message notification level", type: "integer" },
											description: { description: "Guild description", nullable: true, type: "string" },
											explicitContentFilter: { description: "Explicit content filter level", type: "integer" },
											features: {
												description: "Enabled guild features",
												items: { type: "string" },
												type: "array",
											},
											icon: { description: "Guild icon hash", nullable: true, type: "string" },
											id: { description: "Guild snowflake ID", example: "987654321098765432", type: "string" },
											joinedTimestamp: { description: "When bot joined (if applicable)", nullable: true, type: "integer" },
											manageable: {
												description: "Whether the user can manage bot settings (has MANAGE_GUILD)",
												example: true,
												type: "boolean",
											},
											mfaLevel: { description: "Required MFA level for moderation", type: "integer" },
											name: { description: "Guild name", example: "WolfStar Support", type: "string" },
											ownerId: { description: "Owner's user snowflake ID", nullable: true, type: "string" },
											partnered: { description: "Whether the guild is partnered", type: "boolean" },
											permissions: {
												description: "User's computed permissions as integer",
												example: 2_199_023_255_551,
												type: "integer",
											},
											preferredLocale: { description: "Preferred locale", example: "en-US", type: "string" },
											premiumSubscriptionCount: { description: "Number of boosts", example: 14, type: "integer" },
											premiumTier: { description: "Premium tier (0-3)", example: 2, type: "integer" },
											splash: { description: "Guild splash hash", nullable: true, type: "string" },
											systemChannelId: { description: "System channel ID", nullable: true, type: "string" },
											vanityURLCode: { description: "Vanity URL code", nullable: true, type: "string" },
											verificationLevel: { description: "Verification level required", type: "integer" },
											verified: { description: "Whether the guild is verified", type: "boolean" },
											widgetEnabled: { description: "Whether widget is enabled", type: "boolean" },
											wolfstarIsIn: { description: "Whether WolfStar bot is in this guild", example: true, type: "boolean" },
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
										accent_color: { description: "User's banner color as integer", nullable: true, type: "integer" },
										avatar: {
											description: "User's avatar hash",
											example: "a_1234567890abcdef1234567890abcdef",
											nullable: true,
											type: "string",
										},
										avatar_decoration_data: { description: "Avatar decoration data", nullable: true, type: "object" },
										banner: { description: "User's banner hash", nullable: true, type: "string" },
										bot: { description: "Whether the user is a bot account", type: "boolean" },
										discriminator: {
											description: "User's 4-digit discriminator (legacy, '0' for new usernames)",
											example: "0",
											type: "string",
										},
										email: { description: "User's email (requires email scope)", nullable: true, type: "string" },
										flags: { description: "User's account flags", type: "integer" },
										global_name: {
											description: "User's display name (global)",
											example: "WolfStar User",
											nullable: true,
											type: "string",
										},
										id: { description: "User's Discord snowflake ID", example: "123456789012345678", type: "string" },
										locale: { description: "User's chosen language option", example: "en-US", type: "string" },
										mfa_enabled: { description: "Whether the user has two factor enabled", type: "boolean" },
										premium_type: { description: "Type of Nitro subscription", type: "integer" },
										public_flags: { description: "User's public flags", type: "integer" },
										system: { description: "Whether the user is an Official Discord System user", type: "boolean" },
										username: { description: "User's username (not nickname)", example: "wolfstar_user", type: "string" },
										verified: { description: "Whether the email has been verified", type: "boolean" },
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
