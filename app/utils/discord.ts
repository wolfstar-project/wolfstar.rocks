import type { MessageReply, MessageReplyProps } from "~/types/discord";

// #region Message Reply
export function isCommandReply(reply: MessageReply): reply is MessageReplyProps<"command"> {
	return reply.kind === "command";
}

export function isMessageReply(reply: MessageReply): reply is MessageReplyProps<"message"> {
	return reply.kind === "message";
}
// #endregion
