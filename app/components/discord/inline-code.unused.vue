<template>
	<span class="discord-message-inline-code"><slot></slot></span>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface InlineCodeUnusedSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
defineSlots<InlineCodeUnusedSlots>();
</script>

<style scoped>
.discord-message-inline-code {
	@apply rounded-md bg-base-200 px-1 font-mono border;
	border-color: var(--colors-base-300);
	border-color: oklch(from var(--colors-base-300) calc(l - 0.05) c h);
}
</style>
