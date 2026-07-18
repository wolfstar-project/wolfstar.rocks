<template>
	<button class="tag" type="button">
		<span v-if="kind === 'mention'" aria-hidden="true">@</span>
		<LazyIconsApp v-else-if="kind === 'app'" class="icon" aria-hidden="true" />
		<slot></slot>
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
	 * Mentions are inline-flex components, not text nodes. Vue's whitespace:condense
	 * drops spaces between tags, so keep a small leading margin for inline flow.
	 */
	@apply inline-flex items-baseline gap-1 rounded-md px-1 py-0.5 font-whitney font-medium;
	vertical-align: baseline;
	margin: 0;
	margin-inline-start: 0.15em;
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
