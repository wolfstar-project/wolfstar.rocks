<template>
	<section class="discord-slash-command-suggestion-group" role="group" :aria-label="label">
		<p class="discord-slash-command-suggestion-group-header" role="presentation">
			<DiscordSlashCommandAppIcon :app size="header" />
			{{ label }}
		</p>
		<slot />
	</section>
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
defineSlots<SlashCommandSuggestionGroupSlots>();

const { app, label: labelOverride } = defineProps<SlashCommandSuggestionGroupProps>();

const label = computed(() => labelOverride ?? SlashCommandApps[app].label);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-slash-command-suggestion-group {
	@apply min-w-0;
}

.discord-slash-command-suggestion-group-header {
	--discord-slash-command-suggestion-group-header: oklch(100% 0 0);

	@apply flex items-center gap-1.5 px-2 py-1.5 font-whitney text-sm font-semibold;
	color: var(--discord-slash-command-suggestion-group-header);
}
</style>
