import type { InjectionKey, Ref } from "vue";

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

export type UIColors = (typeof colors)[number];

export type HomeAccent =
	| "primary"
	| "secondary"
	| "success"
	| "error"
	| "info"
	| "warning"
	| "accent"
	| "spectrum-red"
	| "spectrum-orange"
	| "spectrum-yellow"
	| "spectrum-green"
	| "spectrum-blue"
	| "spectrum-purple";

export enum BrandingColors {
	Secondary = "#fd171b",
}

export enum Colors {
	Amber = "#ffc107",
	Amber300 = "#ffd54f",
	DeepOrange = "#ff5722",
	LightBlue = "#03a9f4",
	Orange = "#ff9800",
	Red = "#f44336",
	Red300 = "#e57373",
	Yellow = "#ffeb3b",
	Yellow300 = "#fff176",
}

export interface HomeStat {
	accent: HomeAccent;
	label: string;
	value: string;
}

export interface HomeFeature {
	accent?: HomeAccent;
	big: boolean;
	description: string;
	icon: string;
	title: string;
}

export interface HomeDashboardMember {
	avatarClass: string;
	badgeClass: string;
	initials: string;
	name: string;
	nameClass: string;
	role: string;
	status: string;
}

export interface HomeTestimonial {
	big?: boolean;
	name: string;
	quote: string;
	role: string;
}

export interface ModerationAction {
	color: Colors;
	name: string;
	temporary: Colors | null;
	undo: Colors | null;
}

type LoggingEventDetailPart =
	| { type: "mention"; name: string }
	| { type: "role"; name: string; color?: string }
	| { type: "roles"; items: { name: string; color?: string }[] }
	| { type: "text"; content: string };

interface LoggingEventLogDetail {
	label: string;
	parts: LoggingEventDetailPart[];
}

export interface LoggingEventDetail {
	tooltip: string;
	title: string;
	icon: string;
	color: string;
	action: string;
	details: LoggingEventLogDetail[];
}

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
	louduser: { app: false, name: "loud-user", verified: false },
	redstar: { app: false, name: "redstar071", verified: false },
	stella: { app: false, name: "Stella", verified: false },
	wolfstar: { app: true, name: "WolfStar", verified: true },
} as const satisfies Record<string, Profile>;

export interface Profile {
	name: string;
	app: boolean;
	verified: boolean;
}

export type ProfileName = keyof typeof Profiles;

type ShowcaseCommandEmbedPart =
	| { type: "mention"; name: string }
	| { type: "text"; content: string };

interface ShowcaseCommandOption {
	name: string;
	value?: string;
	description?: string;
	focused?: boolean;
}

interface ShowcaseCommandEmbedLine {
	label: string;
	parts: ShowcaseCommandEmbedPart[];
}

interface ShowcaseCommand {
	tooltip: string;
	name: string;
	description: string;
	invoker: ProfileName;
	options: ShowcaseCommandOption[];
	embedColor: string;
	embedFooter: string;
	embedLines: ShowcaseCommandEmbedLine[];
}

export const showcaseCommands: ShowcaseCommand[] = [
	{
		tooltip: "Warn",
		name: "warn",
		description: "Warn a member in the server",
		invoker: "stella",
		options: [
			{ name: "user", value: "baddie" },
			{ name: "reason", value: "spam", focused: true },
		],
		embedColor: Colors.Yellow,
		embedFooter: "Case 3",
		embedLines: [
			{ label: "Type", parts: [{ type: "text", content: "Warning" }] },
			{
				label: "User",
				parts: [
					{ type: "mention", name: "baddie" },
					{ type: "text", content: " (541738403230777351)" },
				],
			},
			{ label: "Reason", parts: [{ type: "text", content: "spam" }] },
		],
	},
	{
		tooltip: "Ban",
		name: "ban",
		description: "Ban a member from the server",
		invoker: "stella",
		options: [
			{ name: "user", value: "baddie" },
			{ name: "reason", value: "repeated infractions", focused: true },
		],
		embedColor: Colors.Red,
		embedFooter: "Case 4",
		embedLines: [
			{ label: "Type", parts: [{ type: "text", content: "Ban" }] },
			{
				label: "User",
				parts: [
					{ type: "mention", name: "baddie" },
					{ type: "text", content: " (541738403230777351)" },
				],
			},
			{ label: "Reason", parts: [{ type: "text", content: "repeated infractions" }] },
		],
	},
	{
		tooltip: "Kick",
		name: "kick",
		description: "Kick a member from the server",
		invoker: "stella",
		options: [
			{ name: "user", value: "baddie" },
			{ name: "reason", value: "rule violation", focused: true },
		],
		embedColor: Colors.Orange,
		embedFooter: "Case 5",
		embedLines: [
			{ label: "Type", parts: [{ type: "text", content: "Kick" }] },
			{
				label: "User",
				parts: [
					{ type: "mention", name: "baddie" },
					{ type: "text", content: " (541738403230777351)" },
				],
			},
			{ label: "Reason", parts: [{ type: "text", content: "rule violation" }] },
		],
	},
	{
		tooltip: "Mute",
		name: "mute",
		description: "Mute a member in the server",
		invoker: "stella",
		options: [
			{ name: "user", value: "baddie" },
			{ name: "duration", value: "1h" },
			{ name: "reason", value: "excessive noise", focused: true },
		],
		embedColor: Colors.Amber,
		embedFooter: "Case 6",
		embedLines: [
			{ label: "Type", parts: [{ type: "text", content: "Mute" }] },
			{
				label: "User",
				parts: [
					{ type: "mention", name: "baddie" },
					{ type: "text", content: " (541738403230777351)" },
				],
			},
			{ label: "Duration", parts: [{ type: "text", content: "1 hour" }] },
			{ label: "Reason", parts: [{ type: "text", content: "excessive noise" }] },
		],
	},
	{
		tooltip: "Case",
		name: "case",
		description: "View or manage moderation cases",
		invoker: "stella",
		options: [{ name: "view", value: "3", focused: true }],
		embedColor: Colors.LightBlue,
		embedFooter: "Case 3",
		embedLines: [
			{ label: "Type", parts: [{ type: "text", content: "Warning" }] },
			{
				label: "User",
				parts: [
					{ type: "mention", name: "baddie" },
					{ type: "text", content: " (541738403230777351)" },
				],
			},
			{ label: "Reason", parts: [{ type: "text", content: "spam" }] },
			{ label: "Moderator", parts: [{ type: "mention", name: "stella" }] },
		],
	},
];

export interface OtherApp {
	name: string;
	explore: `/${string}`;
	avatar: `/avatars/${string}`;
	invite: string;
	purposes: readonly string[];
	description: string;
}

export const EmojiRegexExtractName = /<?a?:(\w{2,32}):\d{17,21}>?/gi;
