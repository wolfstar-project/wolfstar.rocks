import type { StringSelectMenuOption } from "~/types/discord";

/**
 * Shared constant-adjacent types for marketing / Discord showcase data.
 * Runtime values live in `app/utils/constants.ts`.
 */

export type UIColors =
	| "primary"
	| "secondary"
	| "success"
	| "error"
	| "info"
	| "warning"
	| "accent"
	| "neutral";

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

export type LoggingEventDetailPart =
	| { type: "mention"; name: string; avatar?: string }
	| { type: "role"; name: string; color?: string }
	| { type: "roles"; items: { name: string; color?: string }[] }
	| { type: "text"; content: string };

export interface LoggingEventLogDetail {
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

export interface Profile {
	name: string;
	app: boolean;
	verified: boolean;
}

export type ProfileName = "baddie" | "louduser" | "redstar" | "stella" | "wolfstar";

/** Applications rendered inside the Discord slash-command suggestion panel. */
export interface SlashCommandApp {
	label: string;
	/** Avatar image served from `public/avatars`. Takes precedence over `icon`. */
	avatar?: string;
	/** Icon fallback for apps without an avatar asset. */
	icon?: string;
}

export type SlashCommandAppName =
	| "catbot"
	| "dyno"
	| "fmbot"
	| "utilsbot"
	| "staryl"
	| "wolfstar"
	| "ring";

export type ShowcaseCommandEmbedPart =
	| { type: "mention"; name: string; avatar?: string }
	| { type: "text"; content: string };

export interface ShowcaseCommandOption {
	name: string;
	value?: string;
	description?: string;
	focused?: boolean;
}

export interface ShowcaseCommandEmbedLine {
	label: string;
	parts: ShowcaseCommandEmbedPart[];
}

export interface ShowcaseCommandBase {
	tooltip: string;
	name: string;
	subcommand?: string;
	description: string;
	invoker: ProfileName;
	frequentlyUsed?: boolean;
	options: ShowcaseCommandOption[];
}

export interface ShowcaseCommandEmbedResponse {
	responseType: "embed";
	embedColor: string;
	embedFooter: string;
	embedLines: ShowcaseCommandEmbedLine[];
}

/** Plain success reply, e.g. "✅ Created case 3 | @baddie". */
export interface ShowcaseCommandTextResponse {
	responseType: "text";
	/** Prefix before the user mention; include trailing " | ". */
	content: string;
	mentionUser: string;
	/** Desktop-only avatar inside the mention pill. */
	mentionAvatar?: string;
}

export interface ShowcaseCommandComponentsResponse {
	responseType: "components";
	accentColor: string;
	lines: string[];
	selectPlaceholder: string;
	selectOptions: StringSelectMenuOption[];
	buttonLabel: string;
}

export type ShowcaseCommand = ShowcaseCommandBase &
	(
		| ShowcaseCommandEmbedResponse
		| ShowcaseCommandTextResponse
		| ShowcaseCommandComponentsResponse
	);

export interface OtherApp {
	name: string;
	explore: `/${string}`;
	avatar: `/avatars/${string}`;
	invite: string;
	purposes: readonly string[];
	description: string;
}
