<template>
	<div class="discord-v2-text-display"><slot></slot></div>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface TextDisplaySlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
defineSlots<TextDisplaySlots>();
</script>

<style scoped>
@reference "@/assets/css/main.css";
.discord-v2-text-display {
	@apply font-whitney whitespace-pre-line;
}
</style>
