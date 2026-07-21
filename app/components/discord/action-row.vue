<template>
	<div class="discord-action-row"><slot></slot></div>
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
/* Skyra discord-action-row: display flex; flex-wrap wrap. */
.discord-action-row {
	@apply flex flex-row flex-wrap items-center gap-2 font-whitney;
}
</style>
