<template>
	<div class="discord-slash-command-input" role="group" :aria-label="ariaLabel">
		<button
			type="button"
			class="discord-slash-command-input-add"
			aria-label="Open attachment menu"
		>
			<UIcon name="ph:plus-bold" class="size-4.5" aria-hidden="true" />
		</button>

		<div class="discord-slash-command-input-field">
			<span class="discord-slash-command-input-value">{{ value }}</span>
			<span class="discord-slash-command-input-cursor" aria-hidden="true" />
		</div>

		<div class="discord-slash-command-input-tools" aria-hidden="true">
			<UIcon name="ph:gift-duotone" class="discord-slash-command-input-tool" />
			<UIcon name="ph:text-aa-bold" class="discord-slash-command-input-tool" />
			<UIcon name="ph:sticker-duotone" class="discord-slash-command-input-tool" />
			<UIcon name="ph:smiley-duotone" class="discord-slash-command-input-tool" />
			<UIcon name="ph:squares-four-duotone" class="discord-slash-command-input-tool" />
		</div>
	</div>
</template>

<script setup lang="ts">
const { value } = defineProps<{
	value: string;
}>();

const ariaLabel = computed(() => `Message input: ${value}`);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-slash-command-input {
	--discord-slash-command-input-bg: hsl(0, 28%, 16%);
	--discord-slash-command-input-text: hsl(0, 0%, 100%, 1);
	--discord-slash-command-input-muted: hsla(0, 0%, 100%, 0.72);
	--discord-slash-command-input-cursor: hsl(0, 0%, 100%, 1);

	@apply flex min-h-11 items-center gap-3 px-3 py-2;
	background-color: var(--discord-slash-command-input-bg);
}

.discord-slash-command-input-add {
	@apply inline-flex shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0;
	color: var(--discord-slash-command-input-muted);
}

.discord-slash-command-input-field {
	@apply flex min-w-0 flex-1 items-center font-whitney text-sm;
	color: var(--discord-slash-command-input-text);
}

.discord-slash-command-input-value {
	@apply truncate;
}

.discord-slash-command-input-cursor {
	@apply ml-px inline-block h-4 w-px;
	background-color: var(--discord-slash-command-input-cursor);
	animation: discord-slash-command-input-cursor-blink 1.1s step-end infinite;
}

.discord-slash-command-input-tools {
	@apply hidden shrink-0 items-center gap-2.5 sm:flex;
	color: var(--discord-slash-command-input-muted);
}

.discord-slash-command-input-tool {
	@apply size-4.5;
}

@keyframes discord-slash-command-input-cursor-blink {
	0%,
	49% {
		opacity: 1;
	}

	50%,
	100% {
		opacity: 0;
	}
}
</style>
