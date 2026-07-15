<template>
	<div class="discord-v2-action-row"><slot></slot></div>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface ActionRowSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
defineSlots<ActionRowSlots>();
</script>

<style scoped>
@reference "@/assets/css/main.css";
.discord-v2-action-row {
	@apply flex flex-row flex-wrap items-center gap-2 font-whitney;
}
</style>
