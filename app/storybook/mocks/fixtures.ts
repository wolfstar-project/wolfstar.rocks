import type { OauthFlattenedGuild, WolfCommand } from "#shared/types/discord";

const MOCK_GUILD_ID = "123456789012345678";
const MOCK_USER_ID = "987654321098765432";

const mockGuild: OauthFlattenedGuild = {
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
	joinedTimestamp: null,
	mfaLevel: 0,
	ownerId: null,
	partnered: false,
	preferredLocale: "en-US" as Locale,
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

const mockGuildNotManaged: OauthFlattenedGuild = {
	...mockGuild,
	id: "111111111111111111",
	name: "Other Server",
	acronym: "OS",
	permissions: 0,
	manageable: false,
	wolfstarIsIn: false,
};

const mockGuildList: OauthFlattenedGuild[] = [mockGuild, mockGuildNotManaged];

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

const emptyPreconditions = { entries: [], mode: 1, runCondition: 1 };

export const mockCommands: WolfCommand[] = [
	{
		name: "ban",
		category: "Moderation",
		description: "Ban a user from the guild",
		aliases: ["b"],
		subCategory: "User Management",
		guarded: false,
		permissionLevel: 6,
		extendedHelp: {
			examples: ["!ban @User Spamming", "!ban @User"],
			usages: ["ban <user> [reason]"],
		},
		preconditions: emptyPreconditions,
	},
	{
		name: "kick",
		category: "Moderation",
		description: "Kick a user from the guild",
		aliases: [],
		subCategory: "User Management",
		guarded: false,
		permissionLevel: 5,
		extendedHelp: {
			examples: ["!kick @User Misbehaving"],
			usages: ["kick <user> [reason]"],
		},
		preconditions: emptyPreconditions,
	},
	{
		name: "mute",
		category: "Moderation",
		description: "Mute a user in the guild",
		aliases: ["m"],
		subCategory: "User Management",
		guarded: false,
		permissionLevel: 5,
		extendedHelp: {
			examples: ["!mute @User Spamming", "!mute @User 10m Spamming"],
			usages: ["mute <user> [duration] [reason]"],
		},
		preconditions: emptyPreconditions,
	},
	{
		name: "help",
		category: "General",
		description: "Display the help menu or get information about a specific command",
		aliases: ["h"],
		subCategory: "",
		guarded: true,
		permissionLevel: 0,
		extendedHelp: {
			examples: ["!help", "!help ban"],
			usages: ["help [command]"],
		},
		preconditions: emptyPreconditions,
	},
	{
		name: "ping",
		category: "General",
		description: "Check the bot's response time",
		aliases: [],
		subCategory: "",
		guarded: true,
		permissionLevel: 0,
		extendedHelp: {
			examples: ["!ping"],
			usages: ["ping"],
		},
		preconditions: emptyPreconditions,
	},
];
