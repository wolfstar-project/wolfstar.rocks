import type { InjectionKey, Ref } from "vue";
import type {
	HomeAccent,
	HomeDashboardMember,
	HomeFeature,
	HomeStat,
	HomeTestimonial,
	LoggingEventDetail,
	ModerationAction,
	Profile,
	ShowcaseCommand,
	SlashCommandApp,
	SlashCommandAppName,
} from "~/types/constants";
import type {
	DiscordAppLauncherEntry,
	DiscordAppLauncherListView,
	DiscordAppLauncherPromo,
	DiscordAppLauncherSheetSnap,
	ResolveDiscordAppLauncherSheetSnapOptions,
	StringSelectMenuPlacement,
} from "~/types/discord";
import { Colors } from "~/types/constants";

export type {
	HomeAccent,
	HomeDashboardMember,
	HomeFeature,
	HomeStat,
	HomeTestimonial,
	LoggingEventDetail,
	ModerationAction,
	OtherApp,
	Profile,
	ProfileName,
	ShowcaseCommand,
	SlashCommandApp,
	SlashCommandAppName,
	UIColors,
} from "~/types/constants";
export { BrandingColors, Colors } from "~/types/constants";
export type {
	DiscordAppLauncherSheetSnap,
	ResolveDiscordAppLauncherSheetSnapOptions,
	StringSelectMenuOption,
	StringSelectMenuPlacement,
} from "~/types/discord";

export const robotBlockingPageProps =
	"nosnippet,notranslate,noimageindex,noarchive,max-snippet:-1,max-image-preview:none,max-video-preview:-1";

export const colors = [
	"primary",
	"secondary",
	"success",
	"error",
	"info",
	"warning",
	"accent",
	"neutral",
] as const;

export const bentoFeatures: HomeFeature[] = [
	{
		accent: "primary",
		big: true,
		description:
			"Configurable spam, invite, and mass-mention filters catch trouble before your team has to.",
		icon: "ph:shield-check-fill",
		title: "Smart AutoMod",
	},
	{
		big: false,
		description:
			"Moderation actions, message edits, channel and role changes, voice moves — logged straight to your server.",
		icon: "ph:scroll-fill",
		title: "Complete Logging Suite",
	},
	{
		big: false,
		description: "Give staff exactly the access they need, down to the command.",
		icon: "ph:users-three-fill",
		title: "Granular Roles & Permissions",
	},
	{
		big: false,
		description:
			"A fully translated interface and command set, so every member reads WolfStar in their own language.",
		icon: "ph:translate-fill",
		title: "Multilingual by Default",
	},
	{
		big: false,
		description:
			"Search a complete history of every action taken on your server, and who took it.",
		icon: "ph:clock-counter-clockwise-fill",
		title: "Full Audit History",
	},
	{
		big: false,
		description: "Every feature is free forever. The full source is open for anyone to read.",
		icon: "ph:heart-fill",
		title: "No Paywalls, Ever",
	},
];

export const stats: HomeStat[] = [
	{ accent: "spectrum-blue", label: "Free forever", value: "100%" },
	{ accent: "spectrum-green", label: "Paywalled features", value: "0" },
	{ accent: "spectrum-purple", label: "Live logging", value: "24/7" },
	{ accent: "spectrum-red", label: "Source code", value: "OSS" },
];

export const dashboardMembers: HomeDashboardMember[] = [
	{
		avatarClass: "bg-error/15 text-error",
		badgeClass: "badge-error",
		initials: "RF",
		name: "redstar071",
		nameClass: "text-base-content",
		role: "Owner",
		status: "online",
	},
	{
		avatarClass: "bg-primary/15 text-primary",
		badgeClass: "badge-primary",
		initials: "ST",
		name: "staryl",
		nameClass: "text-base-content",
		role: "Admin",
		status: "online",
	},
	{
		avatarClass: "bg-success/15 text-success",
		badgeClass: "badge-success",
		initials: "SD",
		name: "stella.dev",
		nameClass: "text-base-content",
		role: "Moderator",
		status: "idle",
	},
	{
		avatarClass: "bg-secondary/15 text-secondary",
		badgeClass: "badge-secondary",
		initials: "NW",
		name: "nightwolf",
		nameClass: "text-base-content",
		role: "Booster",
		status: "dnd",
	},
	{
		avatarClass: "bg-base-content/10 text-base-content/70",
		badgeClass: "badge-neutral",
		initials: "LC",
		name: "lumacore",
		nameClass: "text-base-content",
		role: "Member",
		status: "online",
	},
	{
		avatarClass: "bg-base-content/10 text-base-content/70",
		badgeClass: "badge-neutral",
		initials: "BD",
		name: "baddie",
		nameClass: "text-base-content",
		role: "Member",
		status: "offline",
	},
];

export const testimonials: HomeTestimonial[] = [
	{
		big: true,
		name: "redstar071",
		quote: "WolfStar replaced three other bots for us — the logging alone is worth it.",
		role: "Owner · WolfStar HQ",
	},
	{
		name: "lumacore",
		quote: "Setup took five minutes. AutoMod has caught every raid since.",
		role: "Moderator · Dev Lab",
	},
	{
		name: "stella.dev",
		quote: "Finally a mod bot that ships in our language.",
		role: "Community Manager · Art Club",
	},
];

export const loggingEvents: LoggingEventDetail[] = [
	{
		action: "User Joined",
		color: "#FFA500",
		details: [
			{
				label: "User",
				parts: [
					{ type: "mention", name: "newmember" },
					{ type: "text", content: " (123456789012345678)" },
				],
			},
			{
				label: "Account Created",
				parts: [{ type: "text", content: "2023-01-01 12:00:00 UTC" }],
			},
		],
		icon: "ph:user-plus-fill",
		title: "member joins",
		tooltip: "Member Join",
	},
	{
		action: "User Left",
		color: "#FF6B6B",
		details: [
			{
				label: "User",
				parts: [
					{ type: "mention", name: "oldmember" },
					{ type: "text", content: " (987654321098765432)" },
				],
			},
			{
				label: "Roles",
				parts: [
					{
						type: "roles",
						items: [{ name: "Member" }, { name: "Verified", color: "#57F287" }],
					},
				],
			},
			{ label: "Joined At", parts: [{ type: "text", content: "2023-06-15 08:30:00 UTC" }] },
		],
		icon: "ph:user-minus-fill",
		title: "member leaves",
		tooltip: "Member Leave",
	},
	{
		action: "Message Deleted",
		color: "#E74C3C",
		details: [
			{
				label: "User",
				parts: [
					{ type: "mention", name: "someone" },
					{ type: "text", content: " (456789012345678901)" },
				],
			},
			{ label: "Channel", parts: [{ type: "text", content: "#general" }] },
			{
				label: "Content",
				parts: [{ type: "text", content: "This message has been deleted" }],
			},
		],
		icon: "ph:trash-simple-fill",
		title: "message deletions",
		tooltip: "Message Delete",
	},
	{
		action: "Message Edited",
		color: "#3498DB",
		details: [
			{
				label: "User",
				parts: [
					{ type: "mention", name: "editor" },
					{ type: "text", content: " (234567890123456789)" },
				],
			},
			{ label: "Channel", parts: [{ type: "text", content: "#chat" }] },
			{ label: "Before", parts: [{ type: "text", content: "Original message" }] },
			{ label: "After", parts: [{ type: "text", content: "Edited message" }] },
		],
		icon: "ph:pencil-simple-fill",
		title: "message edits",
		tooltip: "Message Edit",
	},
	{
		action: "Channel Created",
		color: "#2ECC71",
		details: [
			{ label: "Channel", parts: [{ type: "text", content: "#new-channel" }] },
			{ label: "Type", parts: [{ type: "text", content: "Text Channel" }] },
			{
				label: "Created By",
				parts: [
					{ type: "mention", name: "admin" },
					{ type: "text", content: " (112233445566778899)" },
				],
			},
		],
		icon: "ph:hash-fill",
		title: "channel creation",
		tooltip: "Channel Create",
	},
	{
		action: "Channel Deleted",
		color: "#E67E22",
		details: [
			{ label: "Channel", parts: [{ type: "text", content: "#old-channel" }] },
			{ label: "Type", parts: [{ type: "text", content: "Text Channel" }] },
			{
				label: "Deleted By",
				parts: [
					{ type: "mention", name: "admin" },
					{ type: "text", content: " (112233445566778899)" },
				],
			},
		],
		icon: "ph:hash-straight-fill",
		title: "channel deletion",
		tooltip: "Channel Delete",
	},
	{
		action: "Channel Updated",
		color: "#F39C12",
		details: [
			{ label: "Channel", parts: [{ type: "text", content: "#general" }] },
			{
				label: "Changes",
				parts: [{ type: "text", content: "Name changed from #old-general to #general" }],
			},
			{
				label: "Updated By",
				parts: [
					{ type: "mention", name: "admin" },
					{ type: "text", content: " (112233445566778899)" },
				],
			},
		],
		icon: "ph:hash-fill",
		title: "channel updates",
		tooltip: "Channel Update",
	},
	{
		action: "Role Created",
		color: "#9B59B6",
		details: [
			{ label: "Role", parts: [{ type: "role", name: "NewRole", color: "#5865F2" }] },
			{ label: "Color", parts: [{ type: "text", content: "#5865F2" }] },
			{
				label: "Created By",
				parts: [
					{ type: "mention", name: "admin" },
					{ type: "text", content: " (112233445566778899)" },
				],
			},
		],
		icon: "ph:shield-plus-fill",
		title: "role creation",
		tooltip: "Role Create",
	},
	{
		action: "Role Updated",
		color: "#1ABC9C",
		details: [
			{ label: "Role", parts: [{ type: "role", name: "Moderator", color: "#1ABC9C" }] },
			{ label: "Changes", parts: [{ type: "text", content: "Permissions updated" }] },
			{
				label: "Updated By",
				parts: [
					{ type: "mention", name: "admin" },
					{ type: "text", content: " (112233445566778899)" },
				],
			},
		],
		icon: "ph:shield-check-fill",
		title: "role updates",
		tooltip: "Role Update",
	},
	{
		action: "Role Deleted",
		color: "#E91E63",
		details: [
			{ label: "Role", parts: [{ type: "role", name: "OldRole", color: "#99AAB5" }] },
			{ label: "Color", parts: [{ type: "text", content: "#99AAB5" }] },
			{
				label: "Deleted By",
				parts: [
					{ type: "mention", name: "admin" },
					{ type: "text", content: " (112233445566778899)" },
				],
			},
		],
		icon: "ph:shield-slash-fill",
		title: "role deletion",
		tooltip: "Role Delete",
	},
];

export const ModerationActions: Record<string, ModerationAction> = {
	Ban: {
		color: Colors.Red,
		name: "Ban",
		temporary: Colors.Red300,
		undo: Colors.LightBlue,
	},
	Kick: { color: Colors.Orange, name: "Kick", temporary: null, undo: null },
	Mute: {
		color: Colors.Amber,
		name: "Mute",
		temporary: Colors.Amber300,
		undo: Colors.LightBlue,
	},
	Softban: {
		color: Colors.DeepOrange,
		name: "Softban",
		temporary: null,
		undo: null,
	},
	Timeout: {
		color: Colors.Amber,
		name: "Timeout",
		temporary: Colors.Amber,
		undo: Colors.LightBlue,
	},
	VoiceKick: {
		color: Colors.Orange,
		name: "Voice Kick",
		temporary: null,
		undo: null,
	},
	VoiceMute: {
		color: Colors.Amber,
		name: "Voice Mute",
		temporary: Colors.Amber300,
		undo: Colors.LightBlue,
	},
	Warning: {
		color: Colors.Yellow,
		name: "Warning",
		temporary: Colors.Yellow300,
		undo: Colors.LightBlue,
	},
};

const MODERATION_VARIANT_MAP: Record<string, string> = {
	Ban: "error",
	Kick: "warning",
	Mute: "warning",
	Softban: "error",
	Timeout: "warning",
	VoiceKick: "warning",
	VoiceMute: "warning",
	Warning: "neutral",
	Unban: "success",
	Unmute: "success",
	UnVoiceMute: "success",
	Untimeout: "success",
};

export function moderationActionVariant(typeName: string): string {
	return MODERATION_VARIANT_MAP[typeName] ?? "neutral";
}

export function homeAccentClass(accent: HomeAccent): string {
	const map: Record<HomeAccent, string> = {
		"accent": "bg-accent",
		"error": "bg-error",
		"info": "bg-info",
		"primary": "bg-primary",
		"secondary": "bg-secondary",
		"success": "bg-success",
		"warning": "bg-warning",
		"spectrum-blue": "bg-spectrum-blue",
		"spectrum-green": "bg-spectrum-green",
		"spectrum-orange": "bg-spectrum-orange",
		"spectrum-purple": "bg-spectrum-purple",
		"spectrum-red": "bg-spectrum-red",
		"spectrum-yellow": "bg-spectrum-yellow",
	};
	return map[accent];
}

// oxlint-disable-next-line symbol-description
export const ProviderAppNameKey = Symbol() as InjectionKey<Ref<"wolfstar" | "staryl">>;

export const Profiles = {
	baddie: { app: false, name: "Baddie", verified: false },
	louduser: { app: false, name: "Loud User", verified: false },
	redstar: { app: false, name: "RedStar", verified: false },
	stella: { app: false, name: "Stella", verified: false },
	wolfstar: { app: true, name: "WolfStar", verified: true },
} as const satisfies Record<string, Profile>;

export const SlashCommandApps: Record<SlashCommandAppName, SlashCommandApp> = {
	catbot: { label: "Cat bot", icon: "ph:cat-fill" },
	dyno: { label: "Dyno", icon: "ph:flame-fill" },
	fmbot: { label: ".fmbot", icon: "ph:vinyl-record-fill" },
	utilsbot: { label: "UtilsBot", icon: "ph:terminal-window-fill" },
	staryl: { label: "Staryl", avatar: "/avatars/staryl.png" },
	wolfstar: { label: "WolfStar", avatar: "/avatars/wolfstar.png" },
	ring: { label: "Ring", icon: "ph:planet-fill" },
};

/** Order of the app rail rendered on the left of the suggestion panel. */
export const SlashCommandRailApps: SlashCommandAppName[] = [
	"wolfstar",
	"staryl",
	"ring",
	"fmbot",
	"utilsbot",
	"catbot",
	"dyno",
];

export const showcaseCommands: ShowcaseCommand[] = [
	{
		tooltip: "Warn",
		name: "warn",
		description: "Warn a member in the server",
		invoker: "stella",
		frequentlyUsed: true,
		options: [
			{ name: "user", value: "baddie" },
			{ name: "reason", value: "spam", focused: true },
		],
		responseType: "text",
		content: "✅ Created case 3 | ",
		mentionUser: "baddie",
		mentionAvatar: "/avatars/baddie.png",
	},
	{
		tooltip: "Ban",
		name: "ban",
		description: "Ban a member from the server",
		invoker: "stella",
		frequentlyUsed: true,
		options: [
			{ name: "user", value: "baddie" },
			{ name: "reason", value: "repeated infractions", focused: true },
		],
		responseType: "text",
		content: "✅ Created case 4 | ",
		mentionUser: "baddie",
		mentionAvatar: "/avatars/baddie.png",
	},
	{
		tooltip: "Kick",
		name: "kick",
		description: "Kick a member from the server",
		invoker: "stella",
		frequentlyUsed: true,
		options: [
			{ name: "user", value: "baddie" },
			{ name: "reason", value: "rule violation", focused: true },
		],
		responseType: "text",
		content: "✅ Created case 5 | ",
		mentionUser: "baddie",
		mentionAvatar: "/avatars/baddie.png",
	},
	{
		tooltip: "Mute",
		name: "mute",
		description: "Mute a member in the server",
		invoker: "stella",
		frequentlyUsed: true,
		options: [
			{ name: "user", value: "baddie" },
			{ name: "duration", value: "1h" },
			{ name: "reason", value: "excessive noise", focused: true },
		],
		responseType: "text",
		content: "✅ Created case 6 | ",
		mentionUser: "baddie",
		mentionAvatar: "/avatars/baddie.png",
	},
	{
		tooltip: "Case",
		name: "case",
		description: "View or manage moderation cases",
		invoker: "stella",
		options: [{ name: "view", value: "3", focused: true }],
		responseType: "embed",
		embedColor: Colors.LightBlue,
		embedFooter: "Case 3",
		embedLines: [
			{ label: "Type", parts: [{ type: "text", content: "Warning" }] },
			{
				label: "User",
				parts: [
					{ type: "mention", name: "baddie", avatar: "/avatars/baddie.png" },
					{ type: "text", content: " (541738403230777351)" },
				],
			},
			{ label: "Reason", parts: [{ type: "text", content: "spam" }] },
			{
				label: "Moderator",
				parts: [{ type: "mention", name: "stella", avatar: "/avatars/stella.png" }],
			},
		],
	},
	{
		tooltip: "Conf Menu",
		name: "conf",
		subcommand: "menu",
		description: "Browse and edit server configuration",
		invoker: "redstar",
		frequentlyUsed: true,
		options: [],
		responseType: "components",
		accentColor: Colors.Red,
		lines: [
			"Currently at: 📁 Root",
			"Use the menu below to navigate:",
			"",
			"📁 permissions",
			"📁 channels",
			"📁 events",
			"📁 messages",
			"📁 roles",
			"📁 selfmod",
			"📁 no-mention-spam",
			"⚙️ prefix",
			"⚙️ language",
			"⚙️ disable-natural-prefix",
			"⚙️ disabled-commands",
			"⚙️ disabled-channels",
		],
		selectPlaceholder: "Choose an option...",
		selectOptions: [
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
			},
			{
				value: "events",
				label: "Root / Events",
				emoji: "ph:folder-fill",
				description: "Currently at: Root / Events",
			},
			{
				value: "messages",
				label: "Root / Messages",
				emoji: "ph:folder-fill",
				description: "Currently at: Root / Messages",
			},
			{
				value: "roles",
				label: "Root / Roles",
				emoji: "ph:folder-fill",
				description: "Currently at: Root / Roles",
			},
			{
				value: "selfmod",
				label: "Root / Selfmod",
				emoji: "ph:folder-fill",
				description: "Currently at: Root / Selfmod",
			},
			{
				value: "no-mention-spam",
				label: "Root / No-Mention-Spam",
				emoji: "ph:folder-fill",
				description: "Currently at: Root / No-Mention-Spam",
			},
			{
				value: "prefix",
				label: "Root / Prefix",
				emoji: "ph:gear-six-fill",
				description: "Currently at: Root / Prefix",
			},
			{
				value: "language",
				label: "Root / Language",
				emoji: "ph:gear-six-fill",
				description: "Currently at: Root / Language",
			},
			{
				value: "disable-natural-prefix",
				label: "Root / Disable-Natural-Prefix",
				emoji: "ph:gear-six-fill",
				description: "Currently at: Root / Disable-Natural-Prefix",
			},
			{
				value: "disabled-commands",
				label: "Root / Disabled-Commands",
				emoji: "ph:gear-six-fill",
				description: "Currently at: Root / Disabled-Commands",
			},
			{
				value: "disabled-channels",
				label: "Root / Disabled-Channels",
				emoji: "ph:gear-six-fill",
				description: "Currently at: Root / Disabled-Channels",
			},
		],
		buttonLabel: "Stop",
	},
];

export const EmojiRegexExtractName = /<?a?:(\w{2,32}):\d{17,21}>?/gi;

/** Minimum vertical drag (px) before committing to the other snap. */
export const DISCORD_APP_LAUNCHER_SHEET_DRAG_DISTANCE_PX = 56;

/** Flick velocity (px/ms) that commits a snap even below the distance threshold. */
export const DISCORD_APP_LAUNCHER_SHEET_DRAG_VELOCITY_PX_MS = 0.35;

/**
 * Preview row count for category cards on the main launcher scroll.
 * “View More” appears only when a category has more entries than this.
 */
export const DISCORD_APP_LAUNCHER_CATEGORY_PREVIEW_COUNT = 4;

/** Mobile “In This Server” / Recents tile strip length. */
export const DISCORD_APP_LAUNCHER_MOBILE_TILE_COUNT = 2;

/**
 * Resolve the next sheet snap after a handle drag ends.
 * Dragging down from `full` only collapses to `half` — it never dismisses the sheet.
 */
export function resolveDiscordAppLauncherSheetSnap(
	options: ResolveDiscordAppLauncherSheetSnapOptions,
): DiscordAppLauncherSheetSnap {
	const { current, deltaY, velocityY } = options;
	const distance = DISCORD_APP_LAUNCHER_SHEET_DRAG_DISTANCE_PX;
	const velocity = DISCORD_APP_LAUNCHER_SHEET_DRAG_VELOCITY_PX_MS;

	if (current === "half") {
		if (deltaY <= -distance || velocityY <= -velocity) return "full";
		return "half";
	}

	if (deltaY >= distance || velocityY >= velocity) return "half";
	return "full";
}

/** Whether a category/list preview should show its overflow “View More” control. */
export function shouldShowDiscordAppLauncherViewMore(
	totalCount: number,
	visibleCount: number,
): boolean {
	return totalCount > visibleCount;
}

/** Matches `.discord-string-select-menu-scroll` max-height — used for flip decisions. */
export const STRING_SELECT_MENU_PANEL_MAX_HEIGHT = 190;

/**
 * Prefer opening above the trigger (Discord action-row / near-composer behavior).
 * Flip below only when there is not enough room above and below has more space.
 * Zero-sized rects (unlaid-out / jsdom) stay above so tests and SSR stay stable.
 */
export function resolveStringSelectMenuPlacement(
	rect: Pick<DOMRectReadOnly, "top" | "bottom" | "height">,
	viewportHeight: number,
	panelMaxHeight = STRING_SELECT_MENU_PANEL_MAX_HEIGHT,
): StringSelectMenuPlacement {
	if (rect.height <= 0) return "above";
	const spaceAbove = rect.top;
	const spaceBelow = viewportHeight - rect.bottom;
	if (spaceAbove >= panelMaxHeight) return "above";
	if (spaceBelow >= panelMaxHeight && spaceBelow > spaceAbove) return "below";
	return "above";
}

/** Default Recents row for the Discord App Launcher demo. */
export const discordAppLauncherRecents: readonly DiscordAppLauncherEntry[] = [
	{
		id: "wolfstar-conf-menu",
		name: "WolfStar Beta",
		description: "> Customizable moderation and more!",
		avatar: "/avatars/wolfstar.png",
		kind: "command",
		commandName: "conf",
		tileTitle: "conf menu",
		tileSubtitle: "WolfStar Beta",
	},
	{
		id: "flamey-commands",
		name: "Flamey",
		description: "Flamey is a highly customizable, interactive all-in-one Discord bot.",
		icon: "ph:flame-fill",
		iconBg: "oklch(58% 0.2 250)",
		tileTitle: "commands",
		tileSubtitle: "Flamey",
	},
	{
		id: "staryl",
		name: "Staryl",
		avatar: "/avatars/staryl.png",
	},
	{
		id: "grid-a",
		name: "Blips",
		icon: "ph:circles-three-fill",
		iconBg: "oklch(55% 0.16 250)",
	},
	{
		id: "grid-b",
		name: "Pulse",
		icon: "ph:squares-four-fill",
		iconBg: "oklch(52% 0.14 255)",
	},
	{
		id: "eightball",
		name: "8 Ball",
		icon: "ph:number-circle-eight-fill",
		iconBg: "oklch(32% 0.06 260)",
	},
	{
		id: "diamond",
		name: "Gem",
		icon: "ph:diamond-fill",
		iconBg: "oklch(58% 0.18 250)",
	},
	{
		id: "wolfy",
		name: "Wolfy",
		icon: "ph:grid-four-fill",
		iconBg: "oklch(68% 0.12 255)",
	},
];

/** Apps listed under “Apps in this Server”. */
export const discordAppLauncherServerApps: readonly DiscordAppLauncherEntry[] = [
	{
		id: "wolfstar",
		name: "WolfStar Beta",
		description: "> Customizable moderation and more!",
		avatar: "/avatars/wolfstar.png",
	},
	{
		id: "flamey",
		name: "Flamey",
		description: "Flamey is a highly customizable, interactive all-in-one Discord bot.",
		icon: "ph:flame-fill",
		iconBg: "oklch(58% 0.2 250)",
	},
	{
		id: "staryl",
		name: "Staryl",
		avatar: "/avatars/staryl.png",
	},
	{
		id: "wolfy",
		name: "Wolfy",
		icon: "ph:grid-four-fill",
		iconBg: "oklch(68% 0.12 255)",
	},
];

/** Promoted activity cards, rendered as local CSS artwork rather than remote assets. */
export const discordAppLauncherPromoted: readonly DiscordAppLauncherPromo[] = [
	{
		id: "wordle",
		title: "Wordle",
		subtitle: "The New York Times Games",
		description: "Play Wordle from New York Times Games.",
		icon: "ph:grid-nine",
		iconBg: "oklch(92% 0.01 95)",
		variant: "wordle",
	},
	{
		id: "magic-garden",
		title: "Magic Garden",
		description: "Garden with friends! Grow magical plants together.",
		icon: "ph:flower-lotus-fill",
		iconBg: "oklch(63% 0.2 345)",
		variant: "garden",
	},
	{
		id: "farm-merge-valley",
		title: "Farm Merge Valley",
		description: "Farm, merge, grow and expand your land.",
		icon: "ph:plant-fill",
		iconBg: "oklch(72% 0.16 145)",
		variant: "farm",
	},
	{
		id: "watch-together",
		title: "Watch Together",
		description: "Create and watch shared playlists with friends.",
		icon: "ph:youtube-logo-fill",
		iconBg: "oklch(94% 0.006 270)",
		variant: "watch",
	},
];

/** Full Recents destination shown by the first View More control. */
export const discordAppLauncherRecentsList: readonly DiscordAppLauncherEntry[] = [
	{
		id: "farm-merge-valley",
		name: "Farm Merge Valley",
		description: "Farm, merge, grow and expand your land! Welcome to the world of farming.",
		icon: "ph:plant-fill",
		iconBg: "oklch(70% 0.16 145)",
	},
	{
		id: "labscore",
		name: "labsCore",
		description: "As of January 1, 2026, labsCore is no longer available.",
		icon: "ph:flask-fill",
		iconBg: "oklch(32% 0.01 270)",
	},
	{
		id: "poker",
		name: "Poker Night",
		description: "A Texas hold 'em style card game where you can prove your poker skills.",
		icon: "ph:spade-fill",
		iconBg: "oklch(52% 0.16 305)",
	},
	{
		id: "putt",
		name: "Putt Party",
		description: "Perfect your putts in this pumped-up version of a mini golf game.",
		icon: "ph:golf-fill",
		iconBg: "oklch(58% 0.16 145)",
	},
	{
		id: "rythm",
		name: "Rythm",
		description: "Listen to music together with your friends anywhere on Discord.",
		icon: "ph:waveform-fill",
		iconBg: "oklch(35% 0.08 255)",
		promoted: true,
	},
	{
		id: "skyra-beta",
		name: "Skyra Beta",
		description: "Beta - She/Her - Moderation management · Dashboard available.",
		icon: "ph:shield-star-fill",
		iconBg: "oklch(61% 0.16 235)",
	},
	{
		id: "whiteboard",
		name: "Whiteboard",
		description: "Draw, upload images, write, and use GIFs to create virtually anything.",
		icon: "ph:hand-pointing-fill",
		iconBg: "oklch(93% 0.01 270)",
	},
	{
		id: "bobble",
		name: "Bobble League",
		description: "In this arcade-style soccer game use Power Plays and formations.",
		icon: "ph:soccer-ball-fill",
		iconBg: "oklch(70% 0.09 80)",
	},
	{
		id: "watch-together",
		name: "Watch Together",
		description: "Create and watch shared playlists of YouTube videos with your friends.",
		icon: "ph:youtube-logo-fill",
		iconBg: "oklch(94% 0.006 270)",
	},
	{
		id: "activities",
		name: "Activities",
		description: "Bot for starting voice channel activities, made by advaith.",
		icon: "ph:rocket-launch-fill",
		iconBg: "oklch(32% 0.01 270)",
	},
	{
		id: "assyst",
		name: "Assyst",
		description: "Image editing and meme bot with additional fun features.",
		icon: "ph:image-square-fill",
		iconBg: "oklch(38% 0.08 65)",
	},
	{
		id: "astro",
		name: "Astro",
		description: "The most unique and complete Discord bot for temporary voice channels.",
		icon: "ph:planet-fill",
		iconBg: "oklch(38% 0.14 300)",
	},
	{
		id: "dsc-bot",
		name: "dsc.bot",
		description: "Your place to discover Discord bots.",
		icon: "ph:discord-logo-fill",
		iconBg: "oklch(18% 0.005 270)",
	},
	{
		id: "emoji-stealer",
		name: "Emoji Stealer",
		description: "Steal emojis, stickers, and reactions from other servers.",
		icon: "ph:cat-fill",
		iconBg: "oklch(94% 0.006 270)",
	},
	{
		id: "green-bot",
		name: "Green-bot",
		description: "A simple and user friendly Discord music bot.",
		icon: "ph:music-notes-fill",
		iconBg: "oklch(60% 0.18 140)",
	},
	{
		id: "tictactoe",
		name: "TicTacToe",
		description: "TicTacToe Bot recreates the popular game on Discord.",
		icon: "ph:grid-four-fill",
		iconBg: "oklch(82% 0.16 170)",
	},
	{
		id: "wordle",
		name: "Wordle",
		description: "Play Wordle from New York Times Games. You have 6 chances to guess.",
		icon: "ph:grid-nine",
		iconBg: "oklch(92% 0.01 95)",
	},
];

/** Secondary list opened via Chill Together → View More. */
export const discordAppLauncherChillTogether: readonly DiscordAppLauncherEntry[] = [
	{
		id: "watch-together",
		name: "Watch Together",
		description: "Create and watch shared playlists of YouTube videos with your friends.",
		icon: "ph:youtube-logo-fill",
		iconBg: "oklch(94% 0.006 270)",
	},
	{
		id: "lofi",
		name: "Lofi",
		description: "Vibe with your friends with lofi music and a curated ambience.",
		icon: "ph:headphones-fill",
		iconBg: "oklch(42% 0.14 295)",
	},
	{
		id: "whiteboard",
		name: "Whiteboard",
		description: "Draw, upload images, write, and use GIFs to create virtually anything.",
		icon: "ph:hand-pointing-fill",
		iconBg: "oklch(94% 0.006 270)",
	},
	{
		id: "karaoke-party-battle",
		name: "Karaoke Party Battle",
		description: "Karaoke Party Battle is the first karaoke Discord music game.",
		icon: "ph:microphone-stage-fill",
		iconBg: "oklch(56% 0.2 330)",
	},
	{
		id: "rythm",
		name: "Rythm",
		description: "Create and listen to shared playlists of music.",
		icon: "ph:music-notes-fill",
		iconBg: "oklch(55% 0.2 300)",
		promoted: true,
	},
	{
		id: "sketch",
		name: "Sketch Heads",
		description: "Draw and guess with friends.",
		icon: "ph:pencil-simple-fill",
		iconBg: "oklch(65% 0.16 55)",
	},
	{
		id: "checkers",
		name: "Checkers In The Park",
		description: "Play checkers against bots or friends.",
		icon: "ph:checkerboard-fill",
		iconBg: "oklch(55% 0.14 250)",
	},
	{
		id: "land-io",
		name: "Land-io",
		description: "Claim as much land as you can!",
		icon: "ph:map-trifold-fill",
		iconBg: "oklch(60% 0.14 145)",
	},
	{
		id: "putt",
		name: "Putt Party",
		description: "Compete in a mini-golf tournament!",
		icon: "ph:golf-fill",
		iconBg: "oklch(58% 0.16 145)",
	},
	{
		id: "gartic",
		name: "Gartic Phone",
		description: "Draw and write with friends.",
		icon: "ph:phone-fill",
		iconBg: "oklch(62% 0.18 55)",
	},
	{
		id: "know-what",
		name: "Know What I Meme",
		description: "Guess the meme with friends.",
		icon: "ph:smiley-sticker-fill",
		iconBg: "oklch(70% 0.16 85)",
	},
	{
		id: "bobble",
		name: "Bobble League",
		description: "Compete in a fun bobble soccer game.",
		icon: "ph:soccer-ball-fill",
		iconBg: "oklch(55% 0.14 250)",
	},
	{
		id: "ask-away",
		name: "Ask Away",
		description: "Get to know your friends better.",
		icon: "ph:chat-teardrop-dots-fill",
		iconBg: "oklch(58% 0.18 300)",
	},
	{
		id: "color-together",
		name: "Color Together",
		description: "Draw and color with friends.",
		icon: "ph:palette-fill",
		iconBg: "oklch(65% 0.18 25)",
	},
	{
		id: "nitro-control",
		name: "Nitro Control",
		description: "Control Nitro animations together.",
		icon: "ph:lightning-fill",
		iconBg: "oklch(55% 0.2 300)",
		promoted: true,
	},
	{
		id: "valorant",
		name: "VALORANT - Sage's Quarters",
		description: "Discover VALORANT'S new map, through the eyes of Sage.",
		icon: "ph:crosshair-fill",
		iconBg: "oklch(45% 0.18 25)",
		promoted: true,
	},
	{
		id: "masters-of-the-universe",
		name: "Masters of the Universe",
		description: "Eternia is calling you home.",
		icon: "ph:sword-fill",
		iconBg: "oklch(28% 0.04 260)",
		promoted: true,
	},
];

export const discordAppLauncherPuzzleGames: readonly DiscordAppLauncherEntry[] = [
	{
		id: "daily-sudoku",
		name: "Daily Sudoku Together",
		description: "Dive into Daily Sudoku Together on Discord—your ultimate Sudoku break.",
		icon: "ph:number-square-one-fill",
		iconBg: "oklch(92% 0.01 270)",
	},
	{
		id: "daily-word-wheel",
		name: "Daily Word Wheel",
		description: "From the makers of Words with Friends, enjoy a daily word puzzle.",
		icon: "ph:circles-four-fill",
		iconBg: "oklch(83% 0.15 115)",
	},
	{
		id: "blockbuster",
		name: "BlockBuster",
		description: "Welcome to BlockBuster: Adventures Puzzle! Immerse yourself in puzzles.",
		icon: "ph:squares-four-fill",
		iconBg: "oklch(46% 0.16 255)",
	},
	{
		id: "hex-puzzle",
		name: "Hex Puzzle Adventure",
		description: "A hex stacking puzzle game. Use strategic thinking to solve the board.",
		icon: "ph:hexagon-fill",
		iconBg: "oklch(62% 0.2 40)",
	},
	{
		id: "letter-league",
		name: "Letter League",
		description: "Use letter tiles from your rack to compete with friends.",
		icon: "ph:squares-four-fill",
		iconBg: "oklch(75% 0.15 305)",
	},
];

export const discordAppLauncherCardGames: readonly DiscordAppLauncherEntry[] = [
	discordAppLauncherRecentsList[2]!,
	{
		id: "blazing-eights",
		name: "Blazing 8s",
		description: "Be the first to zero cards by swapping hands and skipping players.",
		icon: "ph:number-eight-fill",
		iconBg: "oklch(72% 0.16 155)",
	},
	{
		id: "blackjack",
		name: "Blackjack",
		description: "The first visual Blackjack game on Discord.",
		icon: "ph:cards-three-fill",
		iconBg: "oklch(35% 0.05 250)",
	},
	{
		id: "erth-poker",
		name: "ERTH Poker",
		description: "The ultimate party poker game on Discord.",
		icon: "ph:spade-fill",
		iconBg: "oklch(48% 0.18 330)",
	},
];

export const discordAppLauncherStrategyGames: readonly DiscordAppLauncherEntry[] = [
	{
		id: "roll20",
		name: "Roll20",
		description: "Bring your story to life on the powerful, easy-to-use virtual tabletop.",
		icon: "ph:dice-five-fill",
		iconBg: "oklch(54% 0.2 335)",
	},
	{
		id: "chess-in-the-park",
		name: "Chess In The Park",
		description: "Unleash your inner Grandmaster by playing multiple games of Chess.",
		icon: "ph:horse-fill",
		iconBg: "oklch(76% 0.16 135)",
	},
	{
		id: "battle-tabs",
		name: "BattleTabs",
		description: "Viking Ship Battles! BattleTabs is a turn-based PVP strategy game.",
		icon: "ph:sword-fill",
		iconBg: "oklch(68% 0.17 170)",
	},
	{
		id: "stratego-online",
		name: "Stratego Online",
		description: "The beloved strategy game, known for its tactical depth.",
		icon: "ph:shield-chevron-fill",
		iconBg: "oklch(52% 0.19 25)",
	},
];

export const discordAppLauncherSocialActivities: readonly DiscordAppLauncherEntry[] = [
	{
		id: "codenames",
		name: "Codenames Online",
		description: "A hit party game for 4+ players, designed by Vlaada Chvátil.",
		icon: "ph:detective-fill",
		iconBg: "oklch(53% 0.12 200)",
	},
	{
		id: "goober-dash",
		name: "Goober Dash",
		description: "A 2D battle royale where Goobers run, jump and dash to victory.",
		icon: "ph:person-simple-run-fill",
		iconBg: "oklch(67% 0.2 345)",
	},
	{
		id: "colonist",
		name: "Colonist",
		description: "A Settlers of Catan alternative with strategy game features.",
		icon: "ph:hexagon-fill",
		iconBg: "oklch(69% 0.16 190)",
	},
	{
		id: "know-what-social",
		name: "Know What I Meme",
		description: "The feeling when memes and inside jokes become a game.",
		icon: "ph:smiley-sticker-fill",
		iconBg: "oklch(32% 0.04 250)",
	},
];

export const discordAppLauncherActionGames: readonly DiscordAppLauncherEntry[] = [
	{
		id: "poxel",
		name: "Poxel.io",
		description: "The ultimate FPS action game. Play Poxel.io online with friends.",
		icon: "ph:crosshair-simple-fill",
		iconBg: "oklch(69% 0.17 190)",
	},
	{
		id: "smash-karts",
		name: "Smash Karts",
		description: "Smash Karts is a MOKBA (Multiplayer Online Kart Battle Arena).",
		icon: "ph:car-profile-fill",
		iconBg: "oklch(70% 0.16 305)",
	},
	{
		id: "krunker",
		name: "Krunker Strike FRVR",
		description: "Enter the Krunker Strike FRVR universe and compete.",
		icon: "ph:target-fill",
		iconBg: "oklch(61% 0.16 190)",
	},
	{
		id: "kour",
		name: "Kour.io",
		description: "A multiplayer IO FPS game that plunges you into intense action.",
		icon: "ph:person-simple-run-fill",
		iconBg: "oklch(72% 0.16 105)",
	},
	{
		id: "shellshock",
		name: "Shell Shockers",
		description: "First-person shooter with eggs. Join a match and crack some shells.",
		icon: "ph:egg-crack-fill",
		iconBg: "oklch(78% 0.14 85)",
	},
	{
		id: "tanki",
		name: "Tanki IO",
		description: "Drive tanks, collect power-ups, and battle friends in arenas.",
		icon: "ph:truck-fill",
		iconBg: "oklch(55% 0.14 145)",
	},
];

export const discordAppLauncherBotGames: readonly DiscordAppLauncherEntry[] = [
	{
		id: "owo",
		name: "OwO",
		description: "OwO What's this? Type 'owo help' for a list of commands!",
		icon: "ph:cat-fill",
		iconBg: "oklch(73% 0.15 210)",
	},
	{
		id: "dank-memer",
		name: "Dank Memer",
		description: "Grind, fight, wager, gamble, fish, collect, and more.",
		icon: "ph:smiley-melting-fill",
		iconBg: "oklch(45% 0.14 145)",
	},
	{
		id: "epic-rpg",
		name: "EPIC RPG",
		description: "An RPG bot! Start playing with rpg start or /start.",
		icon: "ph:sword-fill",
		iconBg: "oklch(76% 0.14 200)",
	},
	{
		id: "virtual-fisher",
		name: "VirtualFisher",
		description: "A game you can play in your server focused on fishing.",
		icon: "ph:fish-simple-fill",
		iconBg: "oklch(92% 0.01 270)",
	},
];

/** Main-scroll category previews, in the same order as Discord's launcher. */
export const discordAppLauncherCategories: readonly DiscordAppLauncherListView[] = [
	{ id: "puzzle-games", title: "Puzzle Games", entries: discordAppLauncherPuzzleGames },
	{ id: "card-games", title: "Card Games", entries: discordAppLauncherCardGames },
	{
		id: "strategy-games",
		title: "Strategy and Board Games",
		entries: discordAppLauncherStrategyGames,
	},
	{
		id: "chill-together",
		title: "Chill Together",
		entries: discordAppLauncherChillTogether,
	},
	{
		id: "social-activities",
		title: "Social Activities",
		entries: discordAppLauncherSocialActivities,
	},
	{ id: "action-games", title: "Action Games", entries: discordAppLauncherActionGames },
	{ id: "bot-games", title: "Bot Games", entries: discordAppLauncherBotGames },
];

export const discordAppLauncherListViews: readonly DiscordAppLauncherListView[] = [
	{
		id: "recents",
		title: "Recents",
		entries: discordAppLauncherRecentsList,
	},
	{
		id: "server-apps",
		title: "Apps in this Server",
		entries: discordAppLauncherServerApps,
	},
	{
		id: "chill-together",
		title: "Chill Together",
		entries: discordAppLauncherChillTogether,
	},
	...discordAppLauncherCategories.filter((view) => view.id !== "chill-together"),
];

/**
 * Splits a promoted-card title into ~2 lines for stylized garden/farm artwork.
 * First word on line 1; remaining words on line 2 (e.g. "Farm Merge Valley" →
 * "Farm" / "Merge Valley"). Single-word titles stay on one line.
 */
export function splitDiscordAppLauncherPromoTitle(title: string): readonly string[] {
	const words = title.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return [];
	const first = words[0];
	if (first === undefined) return [];
	if (words.length === 1) return [first];
	return [first, words.slice(1).join(" ")];
}
