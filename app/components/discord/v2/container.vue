<template>
	<div
		class="discord-v2-container font-whitney"
		:class="{ 'discord-v2-container-accented': accentColor }"
		:style="accentColor ? { '--discord-v2-container-accent': accentColor } : undefined"
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
	--discord-v2-container-default-accent: oklch(from var(--discord-chrome) calc(l - 0.027) c h);

	@apply mt-1 flex max-w-130 flex-col gap-2 border-l-4 p-3 text-sm leading-relaxed;
	border-color: var(--discord-v2-container-accent, var(--discord-v2-container-default-accent));
	border-radius: 0.25rem;
	background-color: var(--color-base-200);
	background-color: oklch(from var(--color-base-200) calc(l - 0.02) c h);
}
</style>
