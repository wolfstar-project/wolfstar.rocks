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
@reference "@/assets/css/main.css";
.discord-v2-container {
	--discord-v2-container-default-accent: #1e1f22;

	@apply mt-1 flex max-w-130 flex-col gap-2 border-l-4 p-3 text-sm leading-relaxed;
	border-radius: 0.25rem;
	background-color: var(--color-base-200);
	background-color: oklch(from var(--color-base-200) calc(l - 0.02) c h);
}
</style>
