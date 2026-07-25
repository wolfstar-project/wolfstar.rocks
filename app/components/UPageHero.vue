<template>
	<section :class="cn('py-8 text-center', ui?.container)">
		<slot name="headline" />
		<h1 v-if="title" class="text-3xl font-bold tracking-tight sm:text-4xl">{{ title }}</h1>
		<div v-if="description || $slots.description" class="mx-auto mt-4 max-w-2xl text-muted">
			<slot name="description">{{ description }}</slot>
		</div>
		<div v-if="$slots.default" class="mt-6">
			<slot />
		</div>
	</section>
</template>

<script setup lang="ts">
import { cn } from "cnfast";

defineProps<{
	title?: string;
	description?: string;
	ui?: Record<string, string>;
}>();
</script>
