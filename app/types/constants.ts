import type { ActivityType } from "discord-api-types/v10";
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

export enum BrandingColors {
	Secondary = "#fd171b",
}

export enum Colors {
	Amber = "#ffc107",
	Amber300 = "#ffd54f",
	/** The settings menu's container accent (Discord blurple). */
	Blurple = "#5865f2",
	DeepOrange = "#ff5722",
	/** A moderation action that went through. */
	Green = "#4caf50",
	LightBlue = "#03a9f4",
	Orange = "#ff9800",
	Red = "#f44336",
	Red300 = "#e57373",
	Yellow = "#ffeb3b",
	Yellow300 = "#fff176",
}

export interface ModerationAction {
	color: Colors;
	name: string;
	temporary: Colors | null;
	undo: Colors | null;
}

type LoggingEventDetailPart =
	| { type: "mention"; name: string; avatar?: string }
	| { type: "role"; name: string; color?: string }
	| { type: "roles"; items: { name: string; color?: string }[] }
	| { type: "text"; content: string };

interface LoggingEventLogDetail {
	label: string;
	parts: LoggingEventDetailPart[];
}

export interface LoggingEventDetail {
	/** Stable key for translated copy; see `useMarketingFixtures`. */
	id: string;
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

export type ProfileName = "baddie" | "louduser" | "redstar" | "staryl" | "stella" | "wolfstar";

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

export type ShowcaseCommandPart =
	| { type: "mention"; name: string; avatar?: string }
	| { type: "text"; content: string };

interface ShowcaseCommandOption {
	name: string;
	value?: string;
	description?: string;
	focused?: boolean;
}

interface ShowcaseCommandEmbedLine {
	label: string;
	parts: ShowcaseCommandPart[];
}

interface ShowcaseCommandBase {
	/** Stable key for translated copy; see `useMarketingFixtures`. */
	id: string;
	tooltip: string;
	name: string;
	subcommand?: string;
	description: string;
	invoker: ProfileName;
	frequentlyUsed?: boolean;
	ephemeral?: boolean;
	options: ShowcaseCommandOption[];
}

/** A case as `/case view` shows it: the moderator in the author line, then ❯ lines. */
interface ShowcaseCommandEmbedResponse {
	responseType: "embed";
	embedColor: string;
	embedAuthor: { name: string; icon: string };
	embedFooter: string;
	embedLines: ShowcaseCommandEmbedLine[];
}

/** A plain reply, e.g. "Successfully archived case 3." */
interface ShowcaseCommandTextResponse {
	responseType: "text";
	content: string;
}

/**
 * The green embed a moderation action answers with:
 * "✅ Created case 3 | `baddie`." then "With the reason of: spam".
 */
interface ShowcaseCommandModerationResponse {
	responseType: "moderation";
	caseId: number;
	/** The target's tag, shown as inline code rather than a mention. */
	target: string;
	reason: string;
}

/**
 * A row of the settings menu: a key, its value, and its edit button. Plain
 * text values and codes are shown as inline code, after the readable name:
 * "English (United States) (`en-US`)", "`UTC`".
 */
export interface ShowcaseSettingsRow {
	label: string;
	value?: string;
	code?: string;
}

/** The settings menu `/settings server menu` opens (Components V2). */
interface ShowcaseCommandComponentsResponse {
	responseType: "components";
	accentColor: string;
	heading: string;
	intro: string;
	selectPlaceholder: string;
	selectOptions: StringSelectMenuOption[];
	rows: ShowcaseSettingsRow[];
	resetTitle: string;
	resetDescription: string;
	resetLabel: string;
	expires: string;
	/** The relative time inside `expires`, drawn as Discord's timestamp chip. */
	expiresTime: string;
}

export type ShowcaseCommand = ShowcaseCommandBase &
	(
		| ShowcaseCommandEmbedResponse
		| ShowcaseCommandTextResponse
		| ShowcaseCommandModerationResponse
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

/**
 * Discord Role fields used for member-list grouping/color.
 * @see https://docs.discord.com/developers/topics/permissions#role-object
 */
export interface DiscordMemberListRoleFixture {
	id: string;
	name: string;
	/** Deprecated Discord `Role.color` integer; `0` means no tint. */
	color: number;
	/** Discord “Display role members separately”. */
	hoist: boolean;
	position: number;
	/**
	 * Showcase CSS color for the member display name.
	 * Discord clients derive name tint from Role.colors; marketing fixtures use
	 * semantic oklch tokens instead of RGB integers.
	 */
	uiColor?: string;
}

/**
 * Nested User fields from the Guild Member / User objects.
 * @see https://docs.discord.com/developers/resources/user#user-object
 * @see https://docs.discord.com/developers/resources/guild#guild-member-object
 */
interface DiscordMemberListUserFixture {
	id: string;
	username: string;
	discriminator: string;
	global_name: string | null;
	/** Avatar hash when known; marketing mocks usually leave this null and set `showcase.avatarUrl`. */
	avatar: string | null;
	bot?: boolean;
	/**
	 * Public user flags bitfield (`UserFlags`).
	 * Use `VerifiedBot` / `BotHTTPInteractions` — not `user.verified` (email verification).
	 */
	public_flags?: number;
}

/**
 * Activity fields used for the member-list secondary line.
 * @see https://docs.discord.com/developers/events/gateway-events#activity-object
 */
interface DiscordMemberListActivityFixture {
	name: string;
	type: ActivityType;
	state?: string | null;
	details?: string | null;
	emoji?: { name: string } | null;
}

/**
 * Presence Update fields attached for the member list.
 * @see https://docs.discord.com/developers/events/gateway-events#presence-update
 */
interface DiscordMemberListPresenceFixture {
	status: "online" | "idle" | "dnd" | "offline";
	activities?: readonly DiscordMemberListActivityFixture[];
}

/**
 * Guild Member–shaped fixture (+ optional Presence Update) for marketing mocks.
 * @see https://docs.discord.com/developers/resources/guild#guild-member-object
 */
export interface DiscordMemberListApiFixture {
	user: DiscordMemberListUserFixture;
	nick?: string | null;
	/** Guild avatar hash (unused when `showcase.avatarUrl` is set). */
	avatar?: string | null;
	roles: readonly string[];
	joined_at: string;
	deaf: boolean;
	mute: boolean;
	flags: number;
	presence?: DiscordMemberListPresenceFixture;
	/**
	 * Showcase-only presentation. Not part of Discord’s REST/Gateway payloads —
	 * resolves local assets, Iconify icons, and CSS row decorations.
	 */
	showcase?: {
		avatarUrl?: string;
		icon?: string;
		rowBackground?: string;
		/** Overrides the highest-role `uiColor` when set. */
		nameColor?: string;
	};
}
