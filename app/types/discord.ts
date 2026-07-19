import type { SlashCommandDisplayInput } from "#shared/utils/format-slash-command-display-name";
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

export interface DiscordMemberListMember {
	id: string;
	name: string;
	avatar?: string;
	icon?: string;
	role?: string;
	description?: string;
	app?: boolean;
	verified?: boolean;
}
// #endregion

// #region String Select Menu
export type { StringSelectMenuOption } from "./string-select-menu";
// #endregion
