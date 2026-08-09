<template>
	<div class="gap-3 py-10 flex flex-col items-center justify-center text-center">
		<Icon v-if="icon" :name="icon" class="size-12 text-muted" aria-hidden="true" />
		<h3 v-if="title" class="text-lg font-semibold">{{ title }}</h3>
		<p v-if="description" class="max-w-md text-sm text-muted">{{ description }}</p>
		<slot />
	</div>
</template>

<script setup lang="ts">
defineProps<{
	icon?: string;
	title?: string;
	description?: string;
}>();
</script>
