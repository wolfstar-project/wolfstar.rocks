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
@reference "@/assets/css/main.css";
.discord-messages {
	@apply flex flex-col rounded-xl font-whitney drop-shadow-md;
	background-color: var(--discord-surface);
}
</style>
