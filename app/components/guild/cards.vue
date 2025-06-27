<template>
	<!-- Enhanced Guild Cards Grid - inspired by Dyno.gg -->
	<div class="space-y-6">
		<!-- Filter/Search Section -->
		<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
			<div class="flex items-center space-x-4">
				<div class="relative">
					<Icon name="heroicons:magnifying-glass" class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-base-content/50" />
					<input v-model="searchQuery" type="text" placeholder="Search servers..." class="input-bordered input w-full pl-10 sm:w-64" />
				</div>
				<div class="form-control">
					<label class="label cursor-pointer space-x-2">
						<input v-model="showManageableOnly" type="checkbox" class="checkbox checkbox-sm checkbox-primary" />
						<span class="label-text text-sm">Manageable only</span>
					</label>
				</div>
			</div>
			<div class="text-sm text-base-content/60">{{ filteredGuilds.length }} of {{ guilds?.length || 0 }} servers</div>
		</div>

		<!-- Enhanced Server Grid -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
			<enhanced-guild-card v-for="guild in filteredGuilds" :key="guild.id" :guild="guild" class="h-full" />
		</div>

		<!-- Empty State -->
		<div v-if="filteredGuilds.length === 0" class="flex flex-col items-center justify-center space-y-4 py-16">
			<Icon name="heroicons:server" class="h-16 w-16 text-base-content/30" />
			<h3 class="text-lg font-semibold text-base-content/70">No servers found</h3>
			<p class="max-w-md text-center text-base-content/50">
				{{ searchQuery ? 'Try adjusting your search terms or filters.' : "You don't have any servers yet." }}
			</p>
			<div class="flex gap-2">
				<button v-if="searchQuery" class="btn btn-outline btn-sm" @click="clearSearch">Clear Search</button>
				<button class="btn btn-sm btn-primary">
					<Icon name="heroicons:plus" class="h-4 w-4" />
					Add Bot to Server
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { TransformedLoginData } from '~~/shared/types/discord';

interface EnhancedGuildCardsProps {
	guilds: TransformedLoginData['transformedGuilds'] | null;
}

const props = defineProps<EnhancedGuildCardsProps>();

// Search and filtering
const searchQuery = ref('');
const showManageableOnly = ref(false);

// Computed filtered guilds
const filteredGuilds = computed(() => {
	if (!props.guilds) return [];

	let filtered = [...props.guilds];

	// Apply manageable filter
	if (showManageableOnly.value) {
		filtered = filtered.filter((guild) => guild.manageable);
	}

	// Apply search filter
	if (searchQuery.value.trim()) {
		const query = searchQuery.value.toLowerCase().trim();
		filtered = filtered.filter((guild) => guild.name.toLowerCase().includes(query) || guild.id.includes(query));
	}

	// Sort: manageable servers first, then alphabetically
	return filtered.sort((guildA, guildB) => {
		if (guildA.manageable !== guildB.manageable) {
			return guildA.manageable ? -1 : 1;
		}
		if (guildA.wolfstarIsIn !== guildB.wolfstarIsIn) {
			return guildA.wolfstarIsIn ? -1 : 1;
		}
		return guildA.name.localeCompare(guildB.name, 'en', { sensitivity: 'base' });
	});
});

function clearSearch() {
	searchQuery.value = '';
}
</script>
