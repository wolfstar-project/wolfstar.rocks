<template>
	<Chat class="discord-chat font-whitney" :aria-label="`${channelName} channel chat`">
		<!--
			ChatBody passes `auto-hide` on to its ScrollArea. The thumb then shows
			on hover, on keyboard focus and while the log scrolls.
		-->
		<ChatBody focusable auto-hide :viewport-label="`${channelName} channel messages`">
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
