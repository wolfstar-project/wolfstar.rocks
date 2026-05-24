import type { OauthFlattenedGuild } from "#shared/types/discord";

export const MOCK_GUILD_ID = "123456789012345678";
export const MOCK_USER_ID = "987654321098765432";

export const mockGuild: OauthFlattenedGuild = {
	id: MOCK_GUILD_ID,
	name: "WolfStar Dev",
	acronym: "WD",
	icon: null,
	banner: null,
	description: "A test Discord server for WolfStar stories",
	afkChannelId: null,
	afkTimeout: 300,
	applicationId: null,
	approximateMemberCount: 42,
	approximatePresenceCount: 7,
	defaultMessageNotifications: 0,
	explicitContentFilter: 0,
	features: [],
	joinedTimestamp: null,
	mfaLevel: 0,
	ownerId: null,
	partnered: false,
	preferredLocale: "en-US",
	premiumSubscriptionCount: 0,
	premiumTier: 0,
	splash: null,
	systemChannelId: null,
	vanityURLCode: null,
	verificationLevel: 0,
	verified: false,
	channels: [],
	emojis: [],
	roles: [],
	permissions: 8,
	manageable: true,
	wolfstarIsIn: true,
	widgetEnabled: false,
};

export const mockGuildNotManaged: OauthFlattenedGuild = {
	...mockGuild,
	id: "111111111111111111",
	name: "Other Server",
	acronym: "OS",
	permissions: 0,
	manageable: false,
	wolfstarIsIn: false,
};

export const mockGuildList: OauthFlattenedGuild[] = [mockGuild, mockGuildNotManaged];

export const mockUser = {
	id: MOCK_USER_ID,
	username: "redstar",
	discriminator: "0",
	globalName: "RedStar",
	avatar: null,
	bot: false,
	mfaEnabled: false,
	locale: "en-US",
	verified: true,
	email: null,
	flags: 0,
	premiumType: 0,
	publicFlags: 0,
};
