<template>
	<Chat class="discord-chat font-whitney" :aria-label="`${channelName} channel chat`">
		<!--
			ScrollArea has no auto-hide and no inset focus ring: the classes below
			hide the thumb until the log is hovered or focused, and keep the ring
			inside the chat, which clips its overflow.
		-->
		<ChatBody
			focusable
			:viewport-label="`${channelName} channel messages`"
			class="discord-chat-scrollbar [scrollbar-color:transparent_transparent] focus-within:[scrollbar-color:var(--newt-bg-active)_transparent] hover:[scrollbar-color:var(--newt-bg-active)_transparent] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary [&::-webkit-scrollbar-thumb]:bg-transparent focus-within:[&::-webkit-scrollbar-thumb]:bg-newt-bg-active hover:[&::-webkit-scrollbar-thumb]:bg-newt-bg-active"
		>
			<DiscordChannelWelcome :channel-name :date :date-time :topic />
			<MessageList
				class="discord-chat-messages"
				:label="ts('discord.chat.messages_in', { channel: channelName })"
			>
				<template v-for="(message, index) of messages" :key="message.id">
					<slot name="message" :message :index>
						<DiscordMessage :name="message.author" :timestamp="message.timestamp">
							<DiscordChatInputCommand
								v-if="message.command"
								:name="message.command.name"
								:subcommand="message.command.subcommand"
								:subcommand-group="message.command.subcommandGroup"
								:options="message.command.options"
							/>
							<template v-else>{{ message.content }}</template>
						</DiscordMessage>
					</slot>
				</template>
			</MessageList>
		</ChatBody>
	</Chat>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface ChatProps {
	channelName: string;
	date: string;
	dateTime?: string;
	/** Forwarded to the channel welcome block (Discord topic after the start sentence). */
	topic?: string;
	messages: readonly DiscordChatMessage[];
}

interface ChatSlots {
	message?(props: { message: DiscordChatMessage; index: number }): VNode[];
}
</script>

<script setup lang="ts">
import type { DiscordChatMessage } from "~/types/discord";
import { Chat, ChatBody } from "~/components/ui/chat";
import { MessageList } from "~/components/ui/message-list";

const { ts } = useI18n();
defineProps<ChatProps>();
defineSlots<ChatSlots>();
</script>

<style scoped>
@reference "@/assets/css/main.css";

/*
 * MessageList pads only its direct rows. A `message` slot may wrap a row
 * (`display: contents` in the commands showcase), so pad nested rows too.
 */
.discord-chat-messages :deep([data-slot="message-row"]) {
	@apply rounded-sm px-2 py-1.5;
}
</style>
