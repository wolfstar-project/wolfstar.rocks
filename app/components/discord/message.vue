<template>
	<article
		class="discord-message"
		:class="{
			'discord-message-ephemeral': ephemeral,
			'discord-message-with-reply': reply,
		}"
		:aria-label="`Message from ${profile.name}`"
	>
		<DiscordAvatar :user="name" size="medium" class="discord-message-avatar" />
		<DiscordMessageReply v-if="reply" v-bind="reply" class="discord-message-reply-slot" />
		<div class="discord-message-content">
			<div class="mb-0.5 flex flex-row items-center">
				<div class="font-bold">{{ profile.name }}</div>
				<span
					v-if="profile.app"
					class="app-badge"
					role="img"
					aria-label="Verified application badge"
				>
					<UIcon
						v-if="profile.verified"
						name="ph:check-fat-fill"
						class="mr-0.5 h-2 w-2 sm:h-3 sm:w-3"
						aria-hidden="true"
					/>
					<span>APP</span>
				</span>
			</div>
			<div class="message-content"><slot></slot></div>
			<div
				v-if="ephemeral"
				class="discord-message-ephemeral-footer"
				role="status"
				aria-label="Ephemeral message notice"
			>
				<UIcon name="ph:eye-duotone" aria-hidden="true" /> Only you can see this •
				<button
					class="discord-message-link"
					type="button"
					aria-label="Dismiss ephemeral message"
				>
					Dismiss message
				</button>
			</div>
		</div>
	</article>
</template>

<script lang="ts">
import type { VNode } from "vue";

type MessageReply =
	| {
			kind: "command";
			user: ProfileName;
			commandName: string;
	  }
	| {
			kind: "message";
			user: ProfileName;
			content: string;
	  };

interface MessageProps {
	name: ProfileName;
	ephemeral?: boolean;
	reply?: MessageReply;
}

interface MessageSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
defineSlots<MessageSlots>();

const props = defineProps<MessageProps>();
const { name, ephemeral, reply } = toRefs(props);
const profile = computed(() => Profiles[name.value]);
</script>

<style scoped>
@reference "@/assets/css/main.css";
.app-badge {
	--blurple: #5865f2;

	@apply ml-1 flex flex-row items-center rounded-md px-1 py-0.5 font-bold text-white;
	background-color: var(--blurple);
	font-size: 0.625rem;
	line-height: 0.625rem;
}

@media (width >= 48rem) {
	.app-badge {
		font-size: 0.75rem;
		line-height: 0.75rem;
	}
}

.discord-message {
	@apply flex w-full flex-row gap-2 rounded-xl p-2 align-top font-whitney sm:gap-4 sm:p-4;
	background-color: var(--discord-surface);
}

.discord-message-with-reply {
	--message-reply-avatar-size: 32px;
	--message-reply-gutter: 8px;

	@apply grid items-start;
	grid-template-columns: auto minmax(0, 1fr);
	grid-template-rows: auto auto;
}

@media (width >= 48rem) {
	.discord-message-with-reply {
		--message-reply-avatar-size: 48px;
		--message-reply-gutter: 16px;
	}
}

.discord-message-with-reply > .discord-message-avatar {
	@apply col-start-1 row-start-2 self-start;
}

.discord-message-reply-slot {
	@apply col-start-2 row-start-1 min-w-0;
}

.discord-message-with-reply > .discord-message-content {
	@apply col-start-2 row-start-2 min-w-0;
}

.discord-message:not(.discord-message-ephemeral):hover {
	background-color: var(--discord-surface);
	background-color: oklch(from var(--discord-surface) calc(l + 0.04) c h);
}

.discord-message-ephemeral {
	@apply border-l-2 border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/15;
}

.discord-message-ephemeral-footer {
	@apply mt-1.5 flex items-center gap-1 text-sm text-base-content/60;
}

.discord-message-ephemeral-footer > .discord-message-link {
	@apply cursor-pointer border-0 bg-transparent p-0 text-info hover:underline hover:underline-offset-1;
}
</style>
