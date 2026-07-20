import type { ProfileName } from "@/utils/constants";

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

// #region String Select Menu
export type { StringSelectMenuOption } from "./string-select-menu";
// #endregion
