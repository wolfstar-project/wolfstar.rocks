<template>
	<div class="mt-1 flex gap-1">
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
