<template>
	<div
		class="discord-slash-command-suggestion-matched"
		:class="{ 'discord-slash-command-suggestion-matched-active': active }"
		role="option"
		:aria-selected="active"
		:aria-label="ariaLabel"
		tabindex="0"
		@click="emit('select')"
		@keydown.enter.prevent="emit('select')"
		@keydown.space.prevent="emit('select')"
	>
		<DiscordSlashCommand :name="name" :options="options" />
	</div>
</template>

<script lang="ts">
import type { SlashCommandOption } from "./slash-command.vue";

interface SlashCommandSuggestionMatchedProps {
	active?: boolean;
	name: string;
	options?: SlashCommandOption[];
}

interface SlashCommandSuggestionMatchedEmits {
	select: [];
}
</script>

<script setup lang="ts">
const { active = false, name, options = [] } = defineProps<SlashCommandSuggestionMatchedProps>();

const emit = defineEmits<SlashCommandSuggestionMatchedEmits>();

const ariaLabel = computed(() => {
	const optionText = options
		.map((option) => {
			const valueText = option.value ?? option.description ?? option.name;
			return `${option.name}: ${valueText}`;
		})
		.join(" ");
	return `Slash command: /${name}${optionText ? ` ${optionText}` : ""}`;
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-slash-command-suggestion-matched {
	--discord-slash-command-suggestion-matched-hover: hsla(223, 6.7%, 20.6%, 1);
	--discord-slash-command-suggestion-matched-active: hsla(220, 6.5%, 24%, 1);

	@apply min-h-11 cursor-pointer rounded-md px-3 py-2;
}

.discord-slash-command-suggestion-matched:hover,
.discord-slash-command-suggestion-matched-active {
	background-color: var(--discord-slash-command-suggestion-matched-hover);
}

.discord-slash-command-suggestion-matched-active {
	background-color: var(--discord-slash-command-suggestion-matched-active);
}
</style>
