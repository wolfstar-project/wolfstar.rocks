<template>
	<AppProviders :toaster="toaster">
		<slot />
	</AppProviders>
</template>

<script setup lang="ts">
defineProps<{
	toaster?: {
		expand?: boolean;
		duration?: number;
		position?: string;
	};
}>();
</script>
