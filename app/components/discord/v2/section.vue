<template>
	<Section>
		<SectionContent><slot></slot></SectionContent>
		<SectionAccessory v-if="$slots.accessory">
			<slot name="accessory"></slot>
		</SectionAccessory>
	</Section>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface SectionSlots {
	/** The text displays, one to three. */
	default?(props?: Record<string, never>): VNode[];
	/** A thumbnail or a button, beside the text. */
	accessory?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
import { Section, SectionAccessory, SectionContent } from "~/components/ui/section";

defineSlots<SectionSlots>();
</script>
