<template>
	<div class="flex flex-col items-center justify-center gap-4 py-16 text-center" role="alert">
		<p class="text-6xl font-bold text-muted">{{ statusCode }}</p>
		<h1 class="text-2xl font-semibold">{{ statusMessage }}</h1>
		<p v-if="message" class="max-w-lg text-muted">{{ message }}</p>
		<UButton color="primary" label="Go back home" @click="onClear" />
	</div>
</template>

<script setup lang="ts">
const props = defineProps<{
	error?: {
		statusCode?: number;
		status?: number;
		statusMessage?: string;
		statusText?: string;
		message?: string;
	};
}>();

const statusCode = computed(() => props.error?.statusCode ?? props.error?.status ?? 500);
const statusMessage = computed(
	() => props.error?.statusMessage ?? props.error?.statusText ?? "Something went wrong",
);
const message = computed(() => props.error?.message);

function onClear() {
	clearError({ redirect: "/" });
}
</script>
