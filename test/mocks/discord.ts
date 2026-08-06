import type { AuthUser } from "#nuxt-better-auth";
import type { ChannelType } from "discord-api-types/v10";

/**
 * Creates a mock AuthUser (Better Auth session user) for testing
 * @param overrides - Partial overrides for the default mock user
 * @returns A complete AuthUser object
 */
export function createMockUser(overrides?: Partial<AuthUser>): AuthUser {
	const defaultUser: AuthUser = {
		createdAt: new Date("2024-01-01T00:00:00.000Z"),
		email: "test-user@example.com",
		emailVerified: true,
		id: "123456789012345678",
		image: "https://cdn.discordapp.com/avatars/123456789012345678/a1b2c3d4e5f6g7h8i9j0.png",
		name: "Test User",
		updatedAt: new Date("2024-01-01T00:00:00.000Z"),
	};

	return { ...defaultUser, ...overrides };
}

/**
 * Creates a mock OauthFlattenedGuild for testing
 * @param overrides - Partial overrides for the default mock guild
 * @returns A complete OauthFlattenedGuild object
 */
export function createMockOauthFlattenedGuild(
	overrides?: Partial<OauthFlattenedGuild>,
): OauthFlattenedGuild {
	const defaultGuild: OauthFlattenedGuild = {
		// Core guild properties
		id: "123456789012345678",
		name: "Test Guild",
		icon: "a1b2c3d4e5f6g7h8i9j0",
		acronym: "TG",
		banner: null,
		description: "A test guild for unit testing",
		splash: null,

		// Owner and permissions
		ownerId: "987654321098765432",
		permissions: 2_147_483_647, // All permissions
		manageable: true,
		wolfstarIsIn: true,

		// Channel and status
		afkChannelId: null,
		afkTimeout: 300,
		systemChannelId: null,
		defaultMessageNotifications: 0,
		explicitContentFilter: 0,
		mfaLevel: 0,
		verificationLevel: 0,

		// Features and stats
		preferredLocale: "en-US" as any, // Cast to avoid type mismatch
		premiumTier: 0,
		premiumSubscriptionCount: 0,
		approximateMemberCount: 100,
		approximatePresenceCount: 50,
		widgetEnabled: false,

		// Timestamps
		joinedTimestamp: Date.now() - 86_400_000, // 1 day ago

		// App/vanity
		applicationId: null,
		vanityURLCode: null,

		// Status flags
		partnered: false,
		verified: false,

		// Related entities (empty arrays by default)
		channels: [],
		emojis: [],
		roles: [],
	};

	return { ...defaultGuild, ...overrides };
}

/**
 * Creates a mock FlattenedRole for testing
 * @param overrides - Partial overrides for the default mock role
 * @returns A complete FlattenedRole object
 */
export function createMockRole(overrides?: Partial<FlattenedRole>): FlattenedRole {
	const defaultRole: FlattenedRole = {
		color: 0,
		guildId: "123456789012345678",
		hoist: false,
		icon: null,
		id: "111111111111111111",
		managed: false,
		mentionable: false,
		name: "@everyone",
		permissions: "0",
		rawPosition: 0,
	};

	return { ...defaultRole, ...overrides };
}

/**
 * Creates a mock FlattenedGuildChannel for testing
 * @param overrides - Partial overrides for the default mock channel
 * @returns A complete FlattenedGuildChannel object
 */
export function createMockChannel(
	overrides?: Partial<FlattenedGuildChannel>,
): FlattenedGuildChannel {
	const defaultChannel: FlattenedGuildChannel = {
		createdTimestamp: Date.now() - 86_400_000,
		guildId: "123456789012345678",
		id: "333333333333333333",
		name: "general",
		parentId: null,
		permissionOverwrites: [],
		rawPosition: 0,
		type: 0 as ChannelType.GuildText,
	};

	return { ...defaultChannel, ...overrides };
}
