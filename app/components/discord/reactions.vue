<template>
	<div class="discord-reactions mt-1 gap-1 flex">
		<slot></slot>
	</div>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface ReactionsSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
defineSlots<ReactionsSlots>();
</script>

<style scoped>
.discord-reactions {
	@apply font-whitney;
}
</style>
