<template>
	<div class="discord-v2-section">
		<div class="discord-v2-section-content"><slot></slot></div>
		<div v-if="$slots.accessory" class="discord-v2-section-accessory">
			<slot name="accessory"></slot>
		</div>
	</div>
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
defineSlots<SectionSlots>();
</script>

<style scoped>
@reference "@/assets/css/main.css";
/* Discord's section: the text, then its accessory at the top right. */
.discord-v2-section {
	@apply flex items-start gap-3;
}

.discord-v2-section-content {
	@apply flex min-w-0 flex-1 flex-col gap-2;
}

.discord-v2-section-accessory {
	@apply shrink-0;
}
</style>
