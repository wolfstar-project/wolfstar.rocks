<template>
	<section class="discord-channel-welcome">
		<div class="discord-channel-welcome-icon" aria-hidden="true">
			<UIcon name="discord:text-channel" class="size-10" />
		</div>
		<h2 class="discord-channel-welcome-title">Welcome to #{{ channelName }}!</h2>
		<p class="discord-channel-welcome-description">
			This is the start of the #{{ channelName }} channel.
		</p>
		<div class="discord-channel-welcome-edit" aria-hidden="true">
			<UIcon name="ph:pencil-simple" class="size-4 shrink-0" />
			<span>Edit Channel</span>
		</div>
		<div class="discord-channel-welcome-date">
			<span aria-hidden="true" />
			<time :datetime="dateTime">{{ date }}</time>
			<span aria-hidden="true" />
		</div>
	</section>
</template>

<script lang="ts">
interface ChannelWelcomeProps {
	channelName: string;
	date: string;
	dateTime?: string;
}
</script>

<script setup lang="ts">
defineProps<ChannelWelcomeProps>();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-channel-welcome {
	@apply px-4 pt-10 font-whitney sm:px-6 sm:pt-12;
}

.discord-channel-welcome-icon {
	@apply mb-4 flex size-[68px] items-center justify-center rounded-full text-base-content;
	background-color: oklch(from var(--color-base-content) l c h / 0.12);
}

.discord-channel-welcome-title {
	@apply text-[28px] leading-tight font-bold text-base-content sm:text-[32px];
}

.discord-channel-welcome-description {
	@apply mt-2 text-base text-muted;
}

.discord-channel-welcome-edit {
	@apply mt-3 inline-flex items-center gap-2 rounded px-4 py-1.5 text-sm font-medium text-base-content;
	background-color: oklch(from var(--color-base-content) l c h / 0.1);
}

.discord-channel-welcome-date {
	@apply mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-[12px] font-semibold tracking-wide text-muted uppercase;
}

.discord-channel-welcome-date > span {
	@apply h-px;
	background-color: oklch(from var(--color-base-content) l c h / 0.1);
}
</style>
