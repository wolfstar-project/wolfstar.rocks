<template>
	<div class="discord-reaction" :class="{ self }">
		<span class="mx-0.5 flex items-center"><slot></slot></span>
		<span class="font-bold">{{ count }}</span>
	</div>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface ReactionProps {
	count: number;
	self?: boolean;
}

interface ReactionSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
defineSlots<ReactionSlots>();

const { count, self } = defineProps<ReactionProps>();
</script>

<style>
@reference "@/assets/css/main.css";
.discord-reaction {
	@apply flex w-fit cursor-pointer items-center gap-1 rounded-md border px-1 font-whitney;
	border-color: transparent;
	background-color: oklch(29.64% 0.0077 264.45);
}

.discord-reaction:hover {
	border-color: oklch(100% 0 0 / 0.2);
	background-color: oklch(32.11% 0.0094 268.56);
}

.discord-reaction.self {
	@apply border;
	border-color: oklch(57.7% 0.209 273.88);
	background-color: oklch(57.7% 0.209 273.88 / 0.15);
}

.discord-reaction.self:hover {
	border-color: oklch(57.7% 0.209 273.88);
	background-color: oklch(57.7% 0.209 273.88 / 0.15);
}
</style>
