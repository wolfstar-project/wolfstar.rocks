<template>
	<div class="flex flex-col items-center justify-center gap-3 py-10 text-center">
		<Icon v-if="icon" :name="icon" class="size-12 text-base-content/60" aria-hidden="true" />
		<h3 v-if="title" class="text-lg font-semibold">{{ title }}</h3>
		<p v-if="description" class="max-w-md text-sm text-base-content/60">{{ description }}</p>
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
