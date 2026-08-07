<template>
	<button class="tag" type="button" :style="tagStyle">
		<span aria-hidden="true">@</span>
		<slot></slot>
	</button>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface RoleProps {
	color?: string;
}

interface RoleSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
defineSlots<RoleSlots>();

const { color = "#99AAB5" } = defineProps<RoleProps>();

const tagStyle = computed(() => ({
	"--role-color": color,
}));
</script>

<style scoped>
@reference "@/assets/css/main.css";

.tag {
	@apply inline-flex items-baseline gap-1 rounded-md px-1 py-0.5 font-whitney font-medium transition-colors duration-150;
	/* Roles are components, not text nodes — restore the gap Vue strips between tags. */
	vertical-align: baseline;
	margin: 0;
	margin-inline-start: 0.15em;
	background-color: oklch(from var(--role-color) l c h / 0.15);
	color: var(--role-color);
}

.tag:hover,
.tag:focus-visible {
	background-color: var(--role-color);
	color: oklch(100% 0 0);
}
</style>
