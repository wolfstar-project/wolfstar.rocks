<template>
	<div class="discord-messages">
		<slot></slot>
	</div>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface MessagesSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
defineSlots<MessagesSlots>();
</script>

<style scoped>
.discord-messages {
	@apply rounded-xl font-whitney drop-shadow-md flex flex-col;
	background-color: var(--discord-surface);
}
</style>
