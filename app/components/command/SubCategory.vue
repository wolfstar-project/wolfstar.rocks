<template>
  <div v-if="filteredCommands.length > 0" role="region" :aria-labelledby="`category-${categoryName.replace(/\s+/g, '-').toLowerCase()}`">
    <UAccordion
      :items="categoryItems"
      :ui="{
        root: 'base-100 border border-base-300 rounded-xl shadow-lg overflow-hidden',
        item: 'mb-4'
      }"
      class=""
    >
      <template #default="{ item, open }">
        <UButton
          color="neutral"
          variant="ghost"
          class="w-full justify-between border-b border-base-200 hover:bg-base-200/50 transition-colors"
          :aria-expanded="open"
          :aria-controls="`category-content-${item.value.replace(/\s+/g, '-').toLowerCase()}`"
        >
          <span :id="`category-${item.value.replace(/\s+/g, '-').toLowerCase()}`" class="truncate text-xl font-medium">
            {{ item.label }}
          </span>

          <template #trailing>
            <UIcon
              name="i-heroicons-chevron-down-20-solid"
              class="ms-auto size-5 transform transition-transform duration-200"
              :class="[open && 'rotate-180']"
              aria-hidden="true"
            />
          </template>
        </UButton>
      </template>

      <template #body="{ item }">
        <div :id="`category-content-${item.value.replace(/\s+/g, '-').toLowerCase()}`" class="py-2">
          <UAccordion
            :items="getCommandsByCategory(item.label).map(command => ({ label: command.name, value: command.name, description: command.description }))"
            trailing-icon="i-heroicons-chevron-down-20-solid"
            :ui="{
              item: 'mb-3',
              trigger: 'bg-gray-700 dark:bg-gray-800 hover:bg-gray-600 dark:hover:bg-gray-700 text-white px-4 py-4 rounded-lg',
              trailingIcon: 'text-gray-400',
              label: 'flex items-center gap-4 flex-1 min-w-0'
            }"
          >
            <template #default="{ item: commandItem }">
              <!-- Command name -->
              <div class="font-mono font-semibold text-base text-white min-w-fit pl-2">
                {{ commandItem.label }}
              </div>

              <!-- Command description -->
              <div class="flex-1 text-gray-300 text-sm truncate pl-4">
                {{ commandItem.description || 'No description available' }}
              </div>
            </template>

            <template #body="{ item: commandItem }">
              <CommandBase
                :command="getCommandsByCategory(item.label).find(cmd => cmd.name === commandItem.label)!"
                :loading
              />
            </template>
          </UAccordion>
        </div>
      </template>
    </UAccordion>
  </div>
  <div v-else-if="searchValue" class="text-center py-8 px-4" role="status">
    <UIcon name="i-heroicons-magnifying-glass" class="h-10 w-10 mx-auto mb-3 text-gray-400" aria-hidden="true" />
    <h3 class="text-lg font-semibold mb-2">No commands found in {{ categoryName }}</h3>
    <p class="text-gray-600 dark:text-gray-400">
      Try adjusting your search or browse other categories.
    </p>
  </div>
</template>

<script lang="ts" setup>
import type { FlattenedCommand } from "#shared/types/discord";

interface Props {
  categoryName: string;
  searchValue?: string;
  commands: FlattenedCommand[];
  loading?: boolean;

}

const { commands, searchValue = " ", categoryName } = defineProps<Props>();

// Computed
const filteredCommands = computed(() => {
  const search = searchValue.toLowerCase();

  const filteredCategory = commands.filter((command) => command.category === categoryName);

  return filteredCategory.filter((command) =>
    command.name.toLowerCase().includes(search)
    || (command.description && command.description.toLowerCase().includes(search)),
  );
});

// Computed categories from available commands
const categories = computed(() => {
  const uniqueCategories = new Set<string>();
  for (const command of filteredCommands.value) {
    uniqueCategories.add(command.category || "General");
  }
  return [...uniqueCategories].sort();
});

const categoryItems = computed(() => {
  return categories.value.map(category => ({
    label: category,
    value: category,
  }));
});

// Functions
function getCommandsByCategory(category: string): FlattenedCommand[] {
  return commands.filter(
    cmd => (cmd.category || "General") === category,
  );
}
</script>
