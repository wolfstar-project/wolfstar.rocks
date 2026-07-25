<template>
	<div class="navbar min-h-14 gap-2 border-b border-base-200 bg-base-100 px-4">
		<div class="flex items-center gap-2">
			<slot name="leading" />
			<h1 v-if="title || $slots.title" class="text-lg font-semibold">
				<slot name="title">{{ title }}</slot>
			</h1>
		</div>
		<div class="flex-1">
			<slot />
		</div>
		<div :class="cn('flex items-center', ui?.right)">
			<slot name="right" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { cn } from "cnfast";

defineProps<{
	title?: string;
	ui?: Record<string, string>;
}>();
</script>
