<template>
	<component :is="tag" :class="rootClass">
		<span
			v-if="accent"
			:class="cn('absolute inset-x-0 top-0 h-0.75', homeAccentClass(accent))"
			aria-hidden="true"
		></span>
		<slot />
	</component>
</template>

<script setup lang="ts">
import { cn } from "cnfast";
const {
	accent,
	class: className,
	padding = "md",
	surfaceClass,
	tag = "div",
} = defineProps<{
	accent?: HomeAccent;
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
