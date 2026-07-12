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
