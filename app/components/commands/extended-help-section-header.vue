<template>
	<div v-if="!loading" class="header-container mb-2 flex items-center">
		<component :is="icon" class="mr-2" />
		<div class="divider mx-2 h-full border-l border-gray-300"></div>
		<h3 class="header-text text-lg font-semibold">{{ header }}</h3>
	</div>
	<div v-else class="flex items-center gap-2">
		<div class="h-6 w-6 skeleton rounded-full"></div>
		<div class="h-6 w-48 skeleton rounded-lg"></div>
	</div>
</template>

<script lang="ts" setup>
interface ExtendedHelpSectionHeaderProps {
	icon: string;
	header: string;
	loading?: boolean;
}

withDefaults(defineProps<ExtendedHelpSectionHeaderProps>(), {
	loading: false
});
</script>
