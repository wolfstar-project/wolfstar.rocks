import type { User } from "#auth-utils";
import type {
	FlattenedEmoji,
	FlattenedGuildChannel,
	FlattenedRole,
	OauthFlattenedGuild,
} from "#shared/types/discord";
import type { APIChannel, APIGuild, APIGuildMember, ChannelType } from "discord-api-types/v10";
import { vi } from "vitest";

/**
 * Creates a mock User for testing
 * @param overrides - Partial overrides for the default mock user
 * @returns A complete User object
 */
export function createMockUser(overrides?: Partial<User>): User {
	const defaultUser: User = {
		avatar: "a1b2c3d4e5f6g7h8i9j0",
		globalName: "Test User",
		id: "123456789012345678",
		name: "Test User",
		username: "testuser",
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
 * Creates a mock FlattenedEmoji for testing
 * @param overrides - Partial overrides for the default mock emoji
 * @returns A complete FlattenedEmoji object
 */
function createMockEmoji(overrides?: Partial<FlattenedEmoji>): FlattenedEmoji {
	const defaultEmoji: FlattenedEmoji = {
		animated: false,
		available: true,
		id: "222222222222222222",
		managed: false,
		name: "test_emoji",
		require_colons: true,
		roles: [],
	};

	return { ...defaultEmoji, ...overrides };
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

/**
 * Creates a complete mock guild with channels, roles, and emojis
 * @param config - Configuration for the mock guild
 * @param config.guildOverrides - Partial overrides for the guild properties
 * @param config.numChannels - Number of channels to create (default: 3)
 * @param config.numRoles - Number of roles to create (default: 2)
 * @param config.numEmojis - Number of emojis to create (default: 1)
 * @returns A complete OauthFlattenedGuild with nested entities
 */
export function createMockCompleteGuild(config?: {
	guildOverrides?: Partial<OauthFlattenedGuild>;
	numChannels?: number;
	numRoles?: number;
	numEmojis?: number;
}): OauthFlattenedGuild {
	const { guildOverrides = {}, numChannels = 3, numRoles = 2, numEmojis = 1 } = config || {};

	const guildId = guildOverrides.id || "123456789012345678";

	// Create channels
	const channels: FlattenedGuildChannel[] = Array.from({ length: numChannels }, (_, i) =>
		createMockChannel({
			guildId,
			id: `33333333333333333${i.toString().padStart(1, "0")}`,
			name: i === 0 ? "general" : `channel-${i}`,
			rawPosition: i,
		}),
	);

	// Create roles
	const roles: FlattenedRole[] = Array.from({ length: numRoles }, (_, i) =>
		createMockRole({
			guildId,
			id: `11111111111111111${i.toString().padStart(1, "0")}`,
			name: i === 0 ? "@everyone" : `Role ${i}`,
			rawPosition: i,
		}),
	);

	// Create emojis
	const emojis: FlattenedEmoji[] = Array.from({ length: numEmojis }, (_, i) =>
		createMockEmoji({
			id: `22222222222222222${i.toString().padStart(1, "0")}`,
			name: `emoji_${i}`,
		}),
	);

	return createMockOauthFlattenedGuild({
		...guildOverrides,
		channels,
		emojis,
		id: guildId,
		roles,
	});
}

/**
 * Creates a vitest spy for getGuild that returns a mock APIGuild.
 * Returns the spy so callers can adjust mockResolvedValue if needed.
 */
export function mockGetGuild(overrides?: Partial<APIGuild>) {
	const defaultGuild = {
		id: "123456789012345678",
		name: "Test Guild",
		owner_id: "987654321098765432",
		roles: [],
		channels: [],
		emojis: [],
		features: [],
		icon: null,
	} as unknown as APIGuild;

	return vi.fn().mockResolvedValue({ ...defaultGuild, ...overrides });
}

/**
 * Creates a vitest spy for getGuildChannels that returns a channel array.
 */
export function mockGetGuildChannels(channels: APIChannel[] = []) {
	return vi.fn().mockResolvedValue(channels);
}

/**
 * Creates a vitest spy for getCurrentMember (or getMember) that returns a mock APIGuildMember.
 */
export function mockGetMember(overrides?: Partial<APIGuildMember>) {
	const defaultMember = {
		user: {
			id: "111111111111111111",
			username: "testmember",
			discriminator: "0",
			global_name: null,
			avatar: null,
		},
		roles: [],
		joined_at: new Date().toISOString(),
		deaf: false,
		mute: false,
		flags: 0,
		permissions: "8",
	} as unknown as APIGuildMember;

	return vi.fn().mockResolvedValue({ ...defaultMember, ...overrides });
}

/**
 * Creates a vitest spy for readSettings that returns minimal guild settings.
 */
export function mockReadSettings(overrides?: Record<string, unknown>) {
	const defaultSettings = {
		id: "123456789012345678",
		rolesAdmin: [],
		permissionsRoles: [],
		permissionsUsers: [],
	};

	return vi.fn().mockResolvedValue({ ...defaultSettings, ...overrides });
}
