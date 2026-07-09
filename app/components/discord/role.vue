<template>
	<button class="tag" type="button" :style="tagStyle">
		<span aria-hidden="true">@</span>
		<slot></slot>
	</button>
</template>

<script setup lang="ts">
const { color = "#99AAB5" } = defineProps<{ color?: string }>();

const tagStyle = computed(() => ({
	"--role-color": color,
}));
</script>

<style scoped>
@reference "@/assets/css/main.css";

.tag {
	@apply inline-flex items-baseline gap-1 rounded-[2px] px-1 py-0.5 font-medium transition-colors duration-150;
	vertical-align: baseline;
	margin: 0;
	background-color: oklch(from var(--role-color) l c h / 0.15);
	color: var(--role-color);
}

.tag:hover,
.tag:focus-visible {
	background-color: var(--role-color);
	color: hsl(0, 0%, 100%, 1);
}
</style>
