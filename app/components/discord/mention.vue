<template>
	<!-- Single-line children: newlines between tags become text nodes inside the pill. -->
	<button class="tag" type="button">
		<span v-if="kind === 'mention'" aria-hidden="true">@</span
		><LazyIconsApp v-else-if="kind === 'app'" class="icon" aria-hidden="true" /><slot></slot>
	</button>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface MentionProps {
	kind?: "mention" | "app";
}

interface MentionSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
defineSlots<MentionSlots>();

const { kind = "mention" } = defineProps<MentionProps>();
</script>

<style scoped>
@reference "@/assets/css/main.css";
.tag {
	/*
	 * Mentions are inline-flex chips. Do not add margin-inline-start here:
	 * callers already space with text / {{ " " }}, and DiscordEmbed restores
	 * gaps after bold labels via strong::after. A leading margin double-spaces
	 * showcase copy like "Dear @Baddie" and "❯ User: @baddie".
	 */
	@apply inline-flex items-baseline gap-0 rounded-md px-1 py-0.5 font-whitney font-medium;
	vertical-align: baseline;
	margin: 0;
	background-color: oklch(57.7% 0.209 273.88 / 0.5);
	color: oklch(93.89% 0.027 281.72);

	@media (prefers-color-scheme: light) {
		background-color: oklch(57.7% 0.209 273.88 / 0.25);
		color: oklch(45.08% 0.281 265.53);
	}
}

.tag > .icon {
	@apply mr-0.5 inline-block h-3 w-3 -translate-y-0.5;
}

.tag:hover,
.tag:focus-visible {
	background-color: oklch(57.7% 0.209 273.88);
	color: oklch(100% 0 0);
	@apply transition-colors duration-150;

	@media (prefers-color-scheme: light) {
		background-color: oklch(48.43% 0.261 268.3);
		color: oklch(100% 0 0);
	}
}
</style>
