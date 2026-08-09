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
/* Skyra discord-action-row: display flex; flex-wrap wrap. */
.discord-action-row {
	@apply gap-2 font-whitney flex flex-row flex-wrap items-center;
}
</style>
