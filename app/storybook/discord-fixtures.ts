import type { DiscordChatMessage, DiscordMemberListMember } from "~/types/discord";
import type { StringSelectMenuOption } from "~/types/string-select-menu";
import { Colors, showcaseCommands } from "~/utils/constants";

export {
	discordAppLauncherChillTogether,
	discordAppLauncherListViews,
	discordAppLauncherPromoted,
	discordAppLauncherRecents,
	discordAppLauncherServerApps,
} from "~/utils/discord-app-launcher";

export const discordChatMessages: readonly DiscordChatMessage[] = [
	{
		id: "1",
		author: "stella",
		content: "Can someone mute Baddie? They're spamming again.",
		timestamp: "Today at 15:47",
	},
	{
		id: "2",
		author: "wolfstar",
		content: "✅ Created case 3 | @baddie",
		timestamp: "Today at 15:49",
	},
] as const;

export const discordOnlineMembers = [
	{
		id: "wolfstar",
		name: "WolfStar",
		avatar: "/avatars/wolfstar.png",
		role: "Star Network",
		description: "WolfStar, help",
		app: true,
		verified: true,
		presence: "online",
		pinned: true,
	},
	{
		id: "staryl",
		name: "Staryl",
		avatar: "/avatars/staryl.png",
		role: "Star Network",
		app: true,
		verified: true,
		presence: "online",
		pinned: true,
	},
	{
		id: "redstar",
		name: "RedStar",
		avatar: "/avatars/redstar.png",
		role: "Developers",
		description: "Building WolfStar.rocks",
		presence: "dnd",
		color: "oklch(62% 0.2 25)",
		pinned: true,
	},
	{
		id: "stella",
		name: "Stella",
		avatar: "/avatars/stella.png",
		presence: "online",
	},
] as const satisfies readonly DiscordMemberListMember[];

export const discordOfflineMembers = [
	{
		id: "baddie",
		name: "Baddie",
		presence: "offline",
	},
] as const satisfies readonly DiscordMemberListMember[];

export const confSelectOptions: StringSelectMenuOption[] = [
	{
		value: "permissions",
		label: "Root / Permissions",
		emoji: "ph:folder-fill",
		description: "Currently at: Root / Permissions",
	},
	{
		value: "channels",
		label: "Root / Channels",
		emoji: "ph:folder-fill",
		description: "Currently at: Root / Channels",
		disabled: true,
	},
	{
		value: "prefix",
		label: "Root / Prefix",
		emoji: "ph:gear-six-fill",
		description: "Currently at: Root / Prefix",
	},
];

export const caseEmbedColor = Colors.LightBlue;
export const confAccentColor = Colors.Red;

export const frequentlyUsedShowcaseCommands = showcaseCommands
	.filter((command) => command.frequentlyUsed)
	.slice(0, 5);
