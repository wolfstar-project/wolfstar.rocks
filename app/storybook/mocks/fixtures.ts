import type { OauthFlattenedGuild, WolfCommand } from "#shared/types/discord";
import type { Locale } from "discord-api-types/v10";

const MOCK_GUILD_ID = "123456789012345678";
const MOCK_USER_ID = "987654321098765432";

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

export const mockCommands: WolfCommand[] = [
	{
		category: "Admin",
		alias: ["rs"],
		description: "Manage unique role sets.",
		extendedHelp: {
			usages: [
				"set RoleSetName Role1 Role2 Role3...",
				"remove RoleSetName Role1 Role2 Role3...",
				"reset",
				"reset RoleSetName",
				"list",
				"RoleSetName Role1 Role2 Role3",
			],
			extendedHelp:
				'A role set is a group of roles WolfStar identifies as unique for all members in the server, i.e. a roleset named `region` could have the roles `Africa`, `America`, `Asia`, and `Europe`, and members will only be able to have one of them. This is like a kind of "rule" that is applied in the three following situations:\n\n- When somebody claims a role via the `roles` command.\n- When somebody claims a role via reaction roles.\n- When somebody receives a role either manually or from another bot.',
			explainedUsage: [
				["add", "Create a new roleset or add a role to an existing one."],
				["remove", "Remove a role from an existing roleset."],
				[
					"reset",
					"Removes all roles from a roleset or, if not specified, all existing rolesets.",
				],
				["list", "Lists all rolesets."],
				["auto", "Adds or removes a roleset."],
				["RoleSetName", "The name of the roleset"],
				["Role1 Role2 Role3", "The roles to add to the roleset"],
			],
			examples: [
				"add regions America",
				"add regions Africa America Asia Europe",
				"remove regions America",
				"reset",
				"reset regions",
				"list",
				"regions America",
				"regions Africa America Asia Europe",
			],
			reminder: "This command can add and/or remove multiple roles at the same time.",
		},
		guarded: false,
		name: "roleset",
		permissionLevel: 6,
		preconditions: {
			entries: [
				{
					// @ts-expect-error - The actual type of context is unknown, but it has at least these properties.
					context: {
						types: [0, 2, 4, 5, 10, 11, 12, 13, 14, 15, 16, 5, 10, 11, 12],
					},
					name: "RunIn",
				},
				{
					// @ts-expect-error - The actual type of context is unknown, but it has at least these properties.
					context: {
						scope: 3,
						limit: 2,
						delay: 10000,
						filteredUsers: ["605162125027049472"],
					},
					name: "Cooldown",
				},
				{
					entries: [
						{
							context: {},
							name: "BotOwner",
						},
						{
							context: {},
							name: "Administrator",
						},
					],
					runCondition: 1,
					mode: 0,
				},
			],
			runCondition: 0,
			mode: 0,
		},
	},
];
