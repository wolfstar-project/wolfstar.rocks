<template>
	<component :is="tag" :class="rootClass">
		<slot />
	</component>
</template>

<script setup lang="ts">
import { cn } from "cnfast";
const {
	class: className,
	padding = "md",
	surfaceClass,
	tag = "div",
} = defineProps<{
	class?: string;
	padding?: "none" | "md" | "lg";
	surfaceClass?: string;
	tag?: "article" | "div" | "figure";
}>();

const rootClass = computed(() =>
	cn(
		"home-surface-card relative overflow-hidden rounded-xl",
		padding === "lg" ? "p-8" : padding === "none" ? "p-0" : "p-6",
		className ?? surfaceClass,
	),
);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.home-surface-card {
	background-color: var(--color-base-300);
	border: 1px solid var(--home-border-subtle);
}
</style>
