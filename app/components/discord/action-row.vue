<template>
	<ActionRow><slot></slot></ActionRow>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface ActionRowSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
import { ActionRow } from "~/components/ui/action-row";

defineSlots<ActionRowSlots>();
</script>
