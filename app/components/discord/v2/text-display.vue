<template>
	<TextDisplay :size :as><slot></slot></TextDisplay>
</template>

<script lang="ts">
import type { Component, VNode } from "vue";
import type { TextDisplayVariants } from "~/components/ui/text-display";

interface TextDisplayProps {
	/** The markdown size: `heading-1` to `heading-3` for `#` to `###`, `subtext` for `-#`. */
	size?: TextDisplayVariants["size"];
	/** The element to render, such as `h3` when a heading size is also a heading of the page. */
	as?: string | Component;
}

interface TextDisplaySlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
import { TextDisplay } from "~/components/ui/text-display";

defineSlots<TextDisplaySlots>();
defineProps<TextDisplayProps>();
</script>
