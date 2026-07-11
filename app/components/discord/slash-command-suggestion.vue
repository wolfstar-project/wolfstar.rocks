<template>
	<div
		class="discord-slash-command-suggestion"
		:class="{ 'discord-slash-command-suggestion-active': active }"
		role="option"
		:aria-selected="active"
		:aria-label="ariaLabel"
		tabindex="0"
		@click="emit('select')"
		@keydown.enter.prevent="emit('select')"
		@keydown.space.prevent="emit('select')"
	>
		<DiscordAvatar :user="bot" size="tiny" class="discord-slash-command-suggestion-avatar" />
		<div class="discord-slash-command-suggestion-content">
			<span class="discord-slash-command-suggestion-name">/{{ name }}</span>
			<span v-if="description" class="discord-slash-command-suggestion-description">{{
				description
			}}</span>
		</div>
		<span class="discord-slash-command-suggestion-app">{{ resolvedAppLabel }}</span>
	</div>
</template>

<script lang="ts">
interface SlashCommandSuggestionProps {
	active?: boolean;
	appLabel?: string;
	bot?: ProfileName;
	description?: string;
	name: string;
}

interface SlashCommandSuggestionEmits {
	select: [];
}
</script>

<script setup lang="ts">
const {
	active = false,
	appLabel,
	bot = "wolfstar",
	description,
	name,
} = defineProps<SlashCommandSuggestionProps>();

const resolvedAppLabel = computed(() => appLabel ?? Profiles[bot].name);

const emit = defineEmits<SlashCommandSuggestionEmits>();

const ariaLabel = computed(() => {
	const parts = [`${resolvedAppLabel.value} slash command: /${name}`];
	if (description) parts.push(description);
	return parts.join(". ");
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-slash-command-suggestion {
	--discord-slash-command-suggestion-hover: hsla(223, 6.7%, 20.6%, 1);
	--discord-slash-command-suggestion-active: hsla(220, 6.5%, 24%, 1);
	--discord-slash-command-suggestion-name: hsl(0, 0%, 100%, 1);
	--discord-slash-command-suggestion-description: hsla(220, 2.7%, 66.1%, 1);
	--discord-slash-command-suggestion-app: hsla(220, 2.7%, 66.1%, 1);

	@apply grid min-h-11 cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-md px-2 py-1.5;
}

.discord-slash-command-suggestion:hover,
.discord-slash-command-suggestion-active {
	background-color: var(--discord-slash-command-suggestion-hover);
}

.discord-slash-command-suggestion-active {
	background-color: var(--discord-slash-command-suggestion-active);
}

.discord-slash-command-suggestion-avatar {
	@apply shrink-0 self-start;
}

.discord-slash-command-suggestion-content {
	@apply flex min-w-0 flex-col gap-0.5;
}

.discord-slash-command-suggestion-name {
	@apply font-whitney text-sm font-semibold;
	color: var(--discord-slash-command-suggestion-name);
}

.discord-slash-command-suggestion-description {
	@apply truncate font-whitney text-xs leading-snug;
	color: var(--discord-slash-command-suggestion-description);
}

.discord-slash-command-suggestion-app {
	@apply shrink-0 self-start pt-0.5 text-xs;
	color: var(--discord-slash-command-suggestion-app);
}
</style>
