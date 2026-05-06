<template>
	<div
		v-if="filteredCommands.length > 0"
		role="region"
		:aria-labelledby="`category-${categoryName.replace(/\s+/g, '-').toLowerCase()}`"
	>
		<UAccordion
			:items="categoryItems"
			:ui="{
				root: 'space-y-3',
				item: '',
				content:
					'rounded-2xl rounded-t-none overflow-hidden transition-all border border-t-0 border-base-content/10 bg-base-200/30',
			}"
			class="animate-fade-in"
		>
			<template #default="{ item, open }">
				<UButton
					color="neutral"
					variant="ghost"
					class="w-full justify-between rounded-2xl border border-base-content/10 bg-base-200/50 px-6 py-4 transition-all hover:bg-base-200/80"
					:class="{ 'rounded-b-none': open }"
					:aria-expanded="open"
					:aria-controls="`category-content-${item.value.replace(/\s+/g, '-').toLowerCase()}`"
				>
					<span
						:id="`category-${item.value.replace(/\s+/g, '-').toLowerCase()}`"
						class="truncate text-xl font-bold"
					>
						{{ item.label }}
					</span>

					<template #trailing>
						<UIcon
							name="i-heroicons-chevron-down-20-solid"
							class="size-5 shrink-0 transform transition-transform duration-200"
							:class="[open && 'rotate-180']"
							aria-hidden="true"
						/>
					</template>
				</UButton>
			</template>

			<template #body="{ item }">
				<div
					:id="`category-content-${item.value.replace(/\s+/g, '-').toLowerCase()}`"
					class="space-y-3 p-4"
				>
					<UAccordion
						:items="
							getCommandsByCategory(item.label).map((command) => ({
								label: command.name,
								value: command.name,
								description: command.description,
							}))
						"
						trailing-icon="i-heroicons-chevron-down-20-solid"
						:ui="{
							item: 'border-0',
							content: 'border-0 pt-4',
							trigger:
								'bg-base-content/10 hover:bg-base-content/15 px-5 py-4 rounded-xl hover-lift transition-all w-full border border-base-content/10',
							trailingIcon: 'text-base-content/60 size-5 shrink-0',
							label: 'flex items-center gap-4 flex-1 min-w-0',
						}"
					>
						<template #default="{ item: commandItem }">
							<div class="min-w-fit font-mono text-base font-bold">
								{{ commandItem.label }}
							</div>

							<div class="ml-4 flex-1 truncate text-sm text-base-content/70">
								{{ commandItem.description || "No description yet" }}
							</div>
						</template>

						<template #body="{ item: commandItem }">
							<CommandBase
								:command="
									getCommandsByCategory(item.label).find(
										(cmd) => cmd.name === commandItem.label,
									)!
								"
								:loading
							/>
						</template>
					</UAccordion>
				</div>
			</template>
		</UAccordion>
	</div>
	<div
		v-else-if="searchValue"
		class="rounded-2xl bg-base-200/30 px-6 py-12 text-center"
		role="status"
	>
		<UIcon
			name="i-heroicons-magnifying-glass"
			class="mx-auto mb-4 h-12 w-12 text-base-content/30"
			aria-hidden="true"
		/>
		<h3 class="mb-2 text-lg font-bold">No commands found in {{ categoryName }}</h3>
		<p class="text-base-content/70">Try adjusting your search or browse other categories.</p>
	</div>
</template>

<script lang="ts" setup>
interface Props {
	categoryName: string;
	searchValue?: string;
	commands: FlattenedCommand[];
	loading?: boolean;
}

const { commands, searchValue = " ", categoryName } = defineProps<Props>();

const filteredCommands = computed(() => {
	const search = searchValue.toLowerCase();

	const filteredCategory = commands.filter((command) => command.category === categoryName);

	return filteredCategory.filter(
		(command) =>
			command.name.toLowerCase().includes(search) ||
			(command.description && command.description.toLowerCase().includes(search)),
	);
});

const categories = computed(() => {
	const uniqueCategories = new Set<string>();
	for (const command of filteredCommands.value) {
		uniqueCategories.add(command.category || "General");
	}
	return [...uniqueCategories].toSorted();
});

const categoryItems = computed(() =>
	categories.value.map((category) => ({
		label: category,
		value: category,
	})),
);

function getCommandsByCategory(category: string): FlattenedCommand[] {
	return commands.filter((cmd) => (cmd.category || "General") === category);
}
</script>
