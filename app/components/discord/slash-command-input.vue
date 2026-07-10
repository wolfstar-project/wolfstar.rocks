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
			<DiscordSlashCommand v-if="name" :name="name" :options="options" />
			<span v-else class="discord-slash-command-input-value">{{ value }}</span>
			<span class="discord-slash-command-input-cursor" aria-hidden="true" />
		</div>

		<div class="discord-slash-command-input-tools" aria-hidden="true">
			<UIcon name="discord:gift" class="discord-slash-command-input-tool size-4.5" />
			<UIcon name="discord:gif" class="discord-slash-command-input-tool size-4.5" />
			<UIcon name="discord:sticker" class="discord-slash-command-input-tool size-4.5" />
			<UIcon name="discord:emoji" class="discord-slash-command-input-tool size-4.5" />
			<UIcon name="discord:apps" class="discord-slash-command-input-tool size-4.5" />
		</div>
	</div>
</template>

<script lang="ts">
import type { SlashCommandOption } from "./slash-command.vue";

interface SlashCommandInputProps {
	name?: string;
	options?: SlashCommandOption[];
	value?: string;
}
</script>

<script setup lang="ts">
const { name, options = [], value = "" } = defineProps<SlashCommandInputProps>();

const ariaLabel = computed(() => {
	if (name) {
		const optionText = options
			.map((option) => {
				const valueText = option.value ?? option.description ?? option.name;
				return `${option.name}: ${valueText}`;
			})
			.join(" ");
		return `Message input: /${name}${optionText ? ` ${optionText}` : ""}`;
	}

	return `Message input: ${value}`;
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-slash-command-input {
	--discord-slash-command-input-bg: hsla(223, 6.7%, 20.6%, 1);
	--discord-slash-command-input-text: hsl(0, 0%, 100%, 1);
	--discord-slash-command-input-muted: hsla(220, 2.7%, 66.1%, 1);
	--discord-slash-command-input-cursor: hsl(0, 0%, 100%, 1);

	@apply flex min-h-11 items-center gap-3 px-3 py-2;
	background-color: var(--discord-slash-command-input-bg);
}

.discord-slash-command-input-add {
	@apply inline-flex shrink-0 items-center justify-center rounded-full border-0 bg-transparent p-0;
	color: var(--discord-slash-command-input-muted);
}

.discord-slash-command-input-field {
	@apply flex min-w-0 flex-1 items-center overflow-x-auto font-whitney text-sm;
	color: var(--discord-slash-command-input-text);
}

.discord-slash-command-input-value {
	@apply truncate;
}

.discord-slash-command-input-cursor {
	@apply ml-px inline-block h-4 w-px shrink-0;
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
