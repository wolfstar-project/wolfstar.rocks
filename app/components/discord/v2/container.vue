<template>
	<div
		class="discord-v2-container font-whitney"
		:style="{ 'border-color': accentColor ?? 'var(--discord-v2-container-default-accent)' }"
	>
		<slot></slot>
	</div>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface ContainerProps {
	accentColor?: string;
}

interface ContainerSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
defineSlots<ContainerSlots>();
defineProps<ContainerProps>();
</script>

<style scoped>
.discord-v2-container {
	--discord-v2-container-default-accent: oklch(23.95% 0.0059 271.17);

	@apply mt-1 max-w-130 gap-2 p-3 text-sm leading-relaxed flex flex-col border-l-4;
	border-radius: 0.25rem;
	background-color: var(--color-base-200);
	background-color: oklch(from var(--color-base-200) calc(l - 0.02) c h);
}
</style>
