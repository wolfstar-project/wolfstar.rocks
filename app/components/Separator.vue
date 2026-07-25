<template>
	<div v-if="orientation === 'horizontal'">
		<StarSeparator :ui="{ border: 'border-[1px] border-(--ui-bg)' }" />
		<StarSeparator :ui="{ border: 'border-[1px] border-(--ui-bg-elevated)' }" />
	</div>
	<div v-else class="flex h-full">
		<StarSeparator
			orientation="vertical"
			class="h-auto"
			:ui="{ border: 'border-[4px] border-(--ui-bg)' }"
		/>
		<StarSeparator
			orientation="vertical"
			class="h-auto"
			:ui="{ border: 'border-[4px] border-(--ui-bg-elevated)' }"
		/>
	</div>
</template>

<script setup lang="ts">
const { orientation = "horizontal" } = defineProps<{
	orientation?: "horizontal" | "vertical";
}>();
</script>
