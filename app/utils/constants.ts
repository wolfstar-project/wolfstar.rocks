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

export interface LoggingEventDetail {
	tooltip: string;
	title: string;
	icon: string;
	color: string;
	action: string;
	details: { label: string; value: string }[];
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
			{ label: "User", value: "@newmember (123456789012345678)" },
			{ label: "Account Created", value: "2023-01-01 12:00:00 UTC" },
		],
		icon: "ph:user-plus-fill",
		title: "member joins",
		tooltip: "Member Join",
	},
	{
		action: "User Left",
		color: "#FF6B6B",
		details: [
			{ label: "User", value: "@oldmember (987654321098765432)" },
			{ label: "Roles", value: "@Member, @Verified" },
			{ label: "Joined At", value: "2023-06-15 08:30:00 UTC" },
		],
		icon: "ph:user-minus-fill",
		title: "member leaves",
		tooltip: "Member Leave",
	},
	{
		action: "Message Deleted",
		color: "#E74C3C",
		details: [
			{ label: "User", value: "@someone (456789012345678901)" },
			{ label: "Channel", value: "#general" },
			{ label: "Content", value: "This message has been deleted" },
		],
		icon: "ph:trash-simple-fill",
		title: "message deletions",
		tooltip: "Message Delete",
	},
	{
		action: "Message Edited",
		color: "#3498DB",
		details: [
			{ label: "User", value: "@editor (234567890123456789)" },
			{ label: "Channel", value: "#chat" },
			{ label: "Before", value: "Original message" },
			{ label: "After", value: "Edited message" },
		],
		icon: "ph:pencil-simple-fill",
		title: "message edits",
		tooltip: "Message Edit",
	},
	{
		action: "Channel Created",
		color: "#2ECC71",
		details: [
			{ label: "Channel", value: "#new-channel" },
			{ label: "Type", value: "Text Channel" },
			{ label: "Created By", value: "@admin (112233445566778899)" },
		],
		icon: "ph:hash-fill",
		title: "channel creation",
		tooltip: "Channel Create",
	},
	{
		action: "Channel Deleted",
		color: "#E67E22",
		details: [
			{ label: "Channel", value: "#old-channel" },
			{ label: "Type", value: "Text Channel" },
			{ label: "Deleted By", value: "@admin (112233445566778899)" },
		],
		icon: "ph:hash-straight-fill",
		title: "channel deletion",
		tooltip: "Channel Delete",
	},
	{
		action: "Channel Updated",
		color: "#F39C12",
		details: [
			{ label: "Channel", value: "#general" },
			{ label: "Changes", value: "Name changed from #old-general to #general" },
			{ label: "Updated By", value: "@admin (112233445566778899)" },
		],
		icon: "ph:hash-fill",
		title: "channel updates",
		tooltip: "Channel Update",
	},
	{
		action: "Role Created",
		color: "#9B59B6",
		details: [
			{ label: "Role", value: "@NewRole" },
			{ label: "Color", value: "#5865F2" },
			{ label: "Created By", value: "@admin (112233445566778899)" },
		],
		icon: "ph:shield-plus-fill",
		title: "role creation",
		tooltip: "Role Create",
	},
	{
		action: "Role Updated",
		color: "#1ABC9C",
		details: [
			{ label: "Role", value: "@Moderator" },
			{ label: "Changes", value: "Permissions updated" },
			{ label: "Updated By", value: "@admin (112233445566778899)" },
		],
		icon: "ph:shield-check-fill",
		title: "role updates",
		tooltip: "Role Update",
	},
	{
		action: "Role Deleted",
		color: "#E91E63",
		details: [
			{ label: "Role", value: "@OldRole" },
			{ label: "Color", value: "#99AAB5" },
			{ label: "Deleted By", value: "@admin (112233445566778899)" },
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

export interface OtherApp {
	name: string;
	explore: `/${string}`;
	avatar: `/avatars/${string}`;
	invite: string;
	purposes: readonly string[];
	description: string;
}

export const EmojiRegexExtractName = /<?a?:(\w{2,32}):\d{17,21}>?/gi;
