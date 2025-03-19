<template>
	<div>
		<commands-palette
			ref="paletteRef"
			:commands="filteredCommandsBySearch"
			:selected-command="selectedCommand"
			:groups="commandGroups"
			@navigate="navigateCommands"
			@search="handleSearch"
			@close="closeModal"
		/>
		<div v-if="loading">
			<div class="container mx-auto flex flex-col gap-6 p-6 md:p-4">
				<div ref="commandsBoxRef" class="flex flex-col">
					<commands-category :loading="loading" />
				</div>
			</div>
		</div>

		<div v-else-if="commands.length === 0" class="hero min-h-[200px]">
			<div class="hero-content text-center">
				<div class="max-w-md">
					<h2 class="text-lg font-bold">No commands found.</h2>
					<p class="py-2 text-sm opacity-75">Please try again later.</p>
					<layout-refresh-commands :commands="commands" :is-loading="loading" :on-refresh="refresh" />
				</div>
				<div class="container mx-auto flex flex-col gap-6 p-6 md:p-4">
					<div ref="commandsBoxRef" class="flex flex-col">
						<commands-category :loading="true" />
					</div>
				</div>
			</div>
		</div>

		<div v-else>
			<layout-refresh-commands :commands="commands" :is-loading="loading" :on-refresh="refresh" />
			<div class="container mx-auto flex flex-col gap-6 p-6 md:p-4">
				<div ref="commandsBoxRef" class="flex flex-col">
					<commands-category
						v-for="category in categories"
						:key="category"
						:category-name="category"
						:commands="filteredCommandsBySearch"
						:search-value="searchValue"
						:loading="loading"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onKeyStroke } from '@vueuse/core';
import type { FlattenedCommand } from '~~/shared/types';

const { commands, loading, fetchCommands } = useCommands();
const searchValue = ref('');
const selectedCommand = ref<FlattenedCommand | null>(null);
const selectedIndex = ref(-1);
const paletteRef = ref<{ modal: HTMLDialogElement } | null>(null);

// Computed properties
const categories = computed<string[]>(() => [...new Set(commands.value.map((cmd) => cmd.category))]);

const commandGroups = computed(() => {
	return categories.value.map((category) => ({
		id: category,
		name: category
	}));
});

const filteredCommandsBySearch = computed(() => {
	if (!searchValue.value) return commands.value;
	const searchTerm = searchValue.value.toLowerCase();
	return commands.value.filter((cmd) => cmd.name.toLowerCase().includes(searchTerm) || cmd.description.toLowerCase().includes(searchTerm));
});

const refresh = async () => await fetchCommands();

// Command palette methods
const openModal = () => {
	paletteRef.value?.modal?.showModal();
};

const closeModal = () => {
	paletteRef.value?.modal?.close();
	searchValue.value = '';
	selectedCommand.value = null;
	selectedIndex.value = -1;
};

const handleSearch = (value: string) => {
	searchValue.value = value;
	const filtered = filteredCommandsBySearch.value;

	if (filtered.length > 0) {
		selectedIndex.value = 0;
		if (filtered[0]) selectedCommand.value = filtered[0];
	}
};

const navigateCommands = (direction: 'next' | 'prev') => {
	const filtered = filteredCommandsBySearch.value;
	if (filtered.length === 0) return;

	if (direction === 'next') {
		selectedIndex.value = (selectedIndex.value + 1) % filtered.length;
	} else {
		selectedIndex.value = selectedIndex.value <= 0 ? filtered.length - 1 : selectedIndex.value - 1;
	}
	const command = filtered[selectedIndex.value];
	if (command) selectedCommand.value = command;
};

// Lifecycle hooks
onMounted(() => {
	fetchCommands();
	onKeyStroke(['Meta+k', 'Control+k'], (e) => {
		e.preventDefault();
		openModal();
	});
});
</script>

<style scoped>
@reference "../../assets/css/main.css";
.modal {
	@apply backdrop-blur-xs;
}

.modal-box {
	@apply max-h-[80vh];
}
</style>
