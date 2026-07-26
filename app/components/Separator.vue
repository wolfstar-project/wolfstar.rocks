<template>
	<div v-if="orientation === 'horizontal'">
		<StarSeparator :ui="{ border: 'border-[1px] border-base-100' }" />
		<StarSeparator :ui="{ border: 'border-[1px] border-base-200' }" />
	</div>
	<div v-else class="flex h-full">
		<StarSeparator
			orientation="vertical"
			class="h-auto"
			:ui="{ border: 'border-[4px] border-base-100' }"
		/>
		<StarSeparator
			orientation="vertical"
			class="h-auto"
			:ui="{ border: 'border-[4px] border-base-200' }"
		/>
	</div>
</template>

<script setup lang="ts">
const { orientation = "horizontal" } = defineProps<{
	orientation?: "horizontal" | "vertical";
}>();
</script>
