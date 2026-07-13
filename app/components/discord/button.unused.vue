<template>
	<button class="discord-message-button-primary" type="button" :aria-label="ariaLabel">
		<slot></slot>
	</button>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface ButtonUnusedProps {
	ariaLabel?: string;
}

interface ButtonUnusedSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
defineSlots<ButtonUnusedSlots>();

const { ariaLabel } = defineProps<ButtonUnusedProps>();
</script>

<style scoped>
@reference "@/assets/css/main.css";
.discord-message-button-primary {
	@apply btn mt-1 font-whitney;
	background-color: oklch(57.7% 0.209 273.88);
	color: white;
}

.discord-message-button-primary:hover {
	background-color: oklch(49.62% 0.176 274.09);
}
</style>
