<template>
	<div class="flex min-h-0 min-w-0 flex-1 flex-col">
		<header v-if="$slots.header" class="shrink-0">
			<slot name="header" />
		</header>
		<div v-if="$slots.body" class="min-h-0 flex-1 overflow-auto">
			<slot name="body" />
		</div>
		<slot v-else />
	</div>
</template>

<script setup lang="ts">
defineProps<{
	id?: string;
}>();
</script>
