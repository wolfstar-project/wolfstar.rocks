<template>
	<header class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
		<div class="min-w-0 sm:flex-1">
			<h2 class="text-xl font-bold tracking-[0.01em]">{{ title }}</h2>
			<p v-if="description" class="mt-1 text-[0.8125rem] leading-normal text-muted">
				{{ description }}
			</p>
		</div>
		<div v-if="$slots.default" class="flex shrink-0 flex-wrap items-center gap-2">
			<slot></slot>
		</div>
	</header>
</template>

<script setup lang="ts">
defineProps<{
	title: string;
	description?: string;
}>();
</script>
