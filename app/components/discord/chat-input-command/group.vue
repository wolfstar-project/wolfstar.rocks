<template>
	<SlashCommandSuggestionGroup class="discord-slash-command-suggestion-group" :aria-label="label">
		<SlashCommandSuggestionsHeader>
			<DiscordChatInputCommandAppIcon :app size="header" />
			{{ label }}
		</SlashCommandSuggestionsHeader>
		<slot />
	</SlashCommandSuggestionGroup>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface SlashCommandSuggestionGroupProps {
	app: SlashCommandAppName;
	/** Overrides the registry label, e.g. for a beta build of the same app. */
	label?: string;
}

interface SlashCommandSuggestionGroupSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
import {
	SlashCommandSuggestionGroup,
	SlashCommandSuggestionsHeader,
} from "~/components/ui/slash-command-suggestions";

defineSlots<SlashCommandSuggestionGroupSlots>();

const { app, label: labelOverride } = defineProps<SlashCommandSuggestionGroupProps>();

const label = computed(() => labelOverride ?? SlashCommandApps[app].label);
</script>
