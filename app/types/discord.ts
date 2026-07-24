import type { ProfileName } from "~/types/constants";

// #region Message Reply
type MessageReplyKind = "command" | "message";

type MessageReplyProps<K extends MessageReplyKind> = K extends "command"
	? SlashCommandDisplayInput & {
			kind: "command";
			user: ProfileName;
		}
	: {
			kind: "message";
			user: ProfileName;
			content: string;
		};

export type MessageReply = MessageReplyProps<"command"> | MessageReplyProps<"message">;

export interface MessageReplyComponentProps {
	kind: MessageReplyKind;
	user: ProfileName;
	commandName?: string;
	subcommand?: string;
	subcommandGroup?: string;
	content?: string;
}
// #endregion

// #region Channel preview
export interface DiscordChatMessage {
	id: string;
	author: ProfileName;
	content?: string;
	timestamp?: string;
	/**
	 * When set, this row is the user's typed/sent slash-command invocation
	 * (e.g. `/warn user:baddie reason:spam`) rather than plain text content.
	 */
	command?: SlashCommandInvocation;
}

export type DiscordMemberPresence = "online" | "idle" | "dnd" | "offline";

export interface DiscordMemberListMember {
	id: string;
	name: string;
	avatar?: string;
	icon?: string;
	role?: string;
	/** Custom status / activity line under the display name. */
	description?: string;
	app?: boolean;
	verified?: boolean;
	/** Presence indicator on the avatar (defaults to online for non-offline sections). */
	presence?: DiscordMemberPresence;
	/**
	 * HTTP-only / serverless application — Discord does not show a gateway
	 * presence badge on these avatars (no online/DND/idle pip).
	 */
	http?: boolean;
	/**
	 * Highest role color as an `oklch(...)` CSS color.
	 * Colors the member display name (Discord role-colored members).
	 */
	color?: string;
	/**
	 * When true with a `role`, the member is listed under a hoisted role
	 * section above Online (Discord “Display role members separately”).
	 */
	pinned?: boolean;
	/**
	 * Optional row background (CSS `background-image` value) for Discord
	 * profile decorations — e.g. nebula layers for Developers.
	 */
	rowBackground?: string;
}
// #endregion

// #region App Launcher
/** Entry shown in Recents, server apps, category lists, or search hits. */
export interface DiscordAppLauncherEntry {
	id: string;
	name: string;
	description?: string;
	/** Image served from `public/` (takes precedence over `icon`). */
	avatar?: string;
	/** Iconify / local icon name when no avatar is set. */
	icon?: string;
	/** Optional squircle background color (`oklch(...)`). */
	iconBg?: string;
	/** Shows the Discord PROMOTED pill in list views. */
	promoted?: boolean;
	/**
	 * Distinguishes apps/activities from slash commands in search results.
	 * Defaults to `"app"`. Commands are executed by the parent (no `/commands` page).
	 */
	kind?: "app" | "command";
	/**
	 * Showcase / bot slash-command name when `kind` is `"command"`.
	 * Parent handlers should call the interactive execute flow with this name.
	 */
	commandName?: string;
	/** Mobile tile primary label; falls back to `name`. */
	tileTitle?: string;
	/** Mobile tile secondary label (e.g. app name under a recent command). */
	tileSubtitle?: string;
}

/** Promotional card in the launcher’s Promoted grid. */
export interface DiscordAppLauncherPromo {
	id: string;
	title: string;
	subtitle?: string;
	description?: string;
	icon?: string;
	iconBg?: string;
	/** Visual preset for mock promo art. */
	variant: "wordle" | "garden" | "farm" | "watch";
}

/** Secondary “View More” destination with a titled scrollable list. */
export interface DiscordAppLauncherListView {
	id: string;
	title: string;
	entries: readonly DiscordAppLauncherEntry[];
}

/** Mobile App Launcher bottom-sheet snap points. */
export type DiscordAppLauncherSheetSnap = "half" | "full";

export interface ResolveDiscordAppLauncherSheetSnapOptions {
	current: DiscordAppLauncherSheetSnap;
	/** Pointer delta: positive = dragged down, negative = dragged up. */
	deltaY: number;
	/** Pointer velocity: positive = downward, negative = upward (px/ms). */
	velocityY: number;
}
// #endregion

// #region String Select Menu
export interface StringSelectMenuOption {
	value: string;
	label: string;
	description?: string;
	/** Unicode emoji, Iconify name (`ph:folder-fill`, `twemoji:gear`), or image URL/path (`http…`, `/…`, `./…`). */
	emoji?: string;
	emojiName?: string;
	disabled?: boolean;
}

export type StringSelectMenuPlacement = "above" | "below";
// #endregion
