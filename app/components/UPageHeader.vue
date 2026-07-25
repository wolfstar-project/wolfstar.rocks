<template>
	<header class="mb-8 space-y-4">
		<div :class="ui?.headline">
			<slot name="headline" />
		</div>
		<h1 v-if="title" class="text-3xl font-bold tracking-tight sm:text-4xl">{{ title }}</h1>
		<p v-if="description" class="text-lg text-muted">{{ description }}</p>
		<slot />
	</header>
</template>

<script setup lang="ts">
defineProps<{
	title?: string;
	description?: string;
	ui?: Record<string, string>;
}>();
</script>
