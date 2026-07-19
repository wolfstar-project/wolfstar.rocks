<template>
	<section class="discord-chat" :aria-label="`${channelName} channel chat`">
		<DiscordScrollbar always-show-track class="discord-chat-scrollbar">
			<DiscordChannelWelcome :channel-name :date :date-time />
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
							{{ message.content }}
						</DiscordMessage>
					</slot>
				</template>
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
	@apply flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden font-whitney;
	background-color: var(--color-base-300);
}

.discord-chat-scrollbar {
	--discord-scrollbar-track: oklch(73.06% 0.0048 264.53 / 0.08);
	--discord-scrollbar-thumb: transparent;

	@apply h-full max-h-full min-h-0 flex-1;
}

/* Outer channel scrollbar: thinner / quieter than the slash-command picker list bar. */
.discord-chat-scrollbar :deep(.discord-scrollbar) {
	grid-template-columns: minmax(0, 1fr) 2px;
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
