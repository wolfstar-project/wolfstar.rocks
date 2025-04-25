<template>
	<div class="rounded-lg bg-base-200 p-6 shadow-lg">
		<div class="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			<guild-card v-for="guild in filteredGuilds" :key="guild.id" :guild="guild" />
		</div>
	</div>
</template>

<script setup lang="ts">
import type { TransformedLoginData } from '~~/shared/types/discord';

interface FilteredGuildCardsProps {
	guilds: TransformedLoginData['transformedGuilds'] | null;
}

const props = defineProps<FilteredGuildCardsProps>();

const filteredGuilds = computed(() => {
	return (props.guilds ?? [])
		.filter((g) => g.manageable)
		.sort((gA, gB) =>
			gA.wolfstarIsIn === gB.wolfstarIsIn ? gA.name.localeCompare(gB.name, 'en', { sensitivity: 'base' }) : gA.wolfstarIsIn ? -1 : 1
		);
});
</script>
