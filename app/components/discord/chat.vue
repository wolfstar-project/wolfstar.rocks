<template>
	<section class="discord-chat" :aria-label="`${channelName} channel chat`">
		<DiscordScrollbar auto-hide class="discord-chat-scrollbar">
			<!-- Short channels: pin welcome + messages as one block above the composer. -->
			<div class="discord-chat-scroller-inner mt-auto">
				<DiscordChannelWelcome :channel-name :date :date-time :topic />
				<div
					class="discord-chat-messages"
					role="log"
					aria-live="polite"
					aria-relevant="additions text"
					:aria-label="`Messages in ${channelName}`"
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
				</div>
			</div>
		</DiscordScrollbar>
	</section>
</template>

<script lang="ts">
import type { VNode } from "vue";
import type { DiscordChatMessage } from "~/types/discord";

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
defineProps<ChatProps>();
defineSlots<ChatSlots>();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-chat {
	/* Discord-true channel chrome (oklch); showcase may override via --showcase tokens. */
	--discord-chat-bg: oklch(26.65% 0.006 272.93);

	@apply flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden font-whitney;
	background-color: var(--discord-chat-bg);
}

.discord-chat-scrollbar {
	@apply h-full max-h-full min-h-0 flex-1;
}

/* Fill the scrollport so mt-auto on the inner block can pin short channels. */
.discord-chat-scrollbar :deep(.discord-scrollbar-content) {
	@apply flex min-h-full flex-col;
}

.discord-chat-scroller-inner {
	@apply flex w-full min-w-0 flex-col;
}

.discord-chat-messages {
	@apply flex flex-col gap-0 px-2 pt-1 pb-4 sm:px-4;
}

.discord-chat-messages :deep(.discord-message) {
	@apply rounded-none px-2 py-1.5 sm:px-2 sm:py-1.5;
	background-color: transparent;
}

.discord-chat-messages :deep(.discord-message:hover) {
	background-color: oklch(from var(--color-base-content) l c h / 0.03);
}

.discord-chat-messages :deep(.discord-message-avatar) {
	@apply mt-0.5;
}
</style>
