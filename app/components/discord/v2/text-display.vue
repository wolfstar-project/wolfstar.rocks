<template>
	<!-- newt/ui has no Text Display part: the text of a Components V2 message keeps its line breaks. -->
	<div class="whitespace-pre-line"><slot></slot></div>
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
