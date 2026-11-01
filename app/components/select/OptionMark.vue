<template>
	<UIcon
		v-if="kind === 'channel'"
		name="ic:round-tag"
		class="size-4 shrink-0 text-muted"
		aria-hidden="true"
	/>
	<span
		v-else-if="kind === 'role'"
		class="size-2 shrink-0 rounded-full"
		:class="{ 'bg-(--ink-300)': !color }"
		:style="color ? { backgroundColor: color } : undefined"
		aria-hidden="true"
	></span>
</template>

<script setup lang="ts">
import type { SelectKind } from "./Base.vue";

/** The mark in front of an option: `#` for a channel, the role's colour for a role. */
const { kind, color } = defineProps<{
	kind: SelectKind;
	color?: string;
}>();
</script>
