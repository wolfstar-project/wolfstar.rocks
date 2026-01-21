<template>
  <UContainer class="mx-auto max-w-7xl space-y-8 px-4 py-8">
    <!-- Page Header -->
    <header class="space-y-4">
      <h1 class="text-4xl font-bold tracking-tight">
        WolfStar Commands
      </h1>
      <p class="text-lg text-gray-600 dark:text-gray-400">
        Browse and search through all available bot commands. Use the search bar to quickly find specific commands.
      </p>
    </header>

    <!-- Commands content -->
    <div class="space-y-6">
      <!-- Search bar -->
      <section aria-labelledby="search-heading" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <h2 id="search-heading" class="sr-only">
          Search Commands
        </h2>
        <UInput
          v-model="searchValue"
          placeholder="Search a command..."
          icon="i-heroicons-magnifying-glass"
          size="lg"
          class="flex-1"
          aria-label="Search for commands by name or description"
          :aria-describedby="searchValue ? 'search-results-count' : undefined"
        >
          <template v-if="searchValue" #trailing>
            <UButton
              color="neutral"
              variant="link"
              icon="i-heroicons-x-mark-20-solid"
              :padded="false"
              aria-label="Clear search"
              @click="searchValue = ''"
            />
          </template>
        </UInput>

        <!-- Refresh button -->
        <UButton
          icon="i-heroicons-arrow-path"
          color="primary"
          variant="soft"
          :loading="refreshing"
          :disabled="loading"
          aria-label="Refresh commands list"
          @click="fetchCommands()"
        >
          <span class="hidden sm:inline">Refresh</span>
        </UButton>
      </section>

      <!-- Results count for screen readers -->
      <div v-if="searchValue && !loading" id="search-results-count" class="sr-only" role="status" aria-live="polite">
        {{ filteredCommandsCount }} command{{ filteredCommandsCount !== 1 ? 's' : '' }} found
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="space-y-4" role="status" aria-label="Loading commands">
        <div class="text-center py-12">
          <UIcon name="i-heroicons-arrow-path" class="animate-spin h-8 w-8 mx-auto mb-4 text-primary-500" />
          <p class="text-lg font-medium">Loading commands...</p>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">Please wait while we fetch the latest commands</p>
        </div>
      </div>

      <!-- No results message -->
      <div v-else-if="commands.length === 0" class="text-center py-12 space-y-4" role="status">
        <UIcon name="i-heroicons-exclamation-circle" class="h-12 w-12 mx-auto text-gray-400" />
        <h2 class="text-xl font-semibold">No commands available</h2>
        <p class="text-gray-600 dark:text-gray-400">
          Unable to load commands at this time. Please try refreshing.
        </p>
      </div>

      <!-- Categories -->
      <section
        v-else
        aria-labelledby="categories-heading"
        class="space-y-4 overflow-hidden rounded-xl shadow-lg flex flex-col bg-base-100 border border-base-300 p-4 sm:p-6"
      >
        <h2 id="categories-heading" class="sr-only">
          Command Categories
        </h2>
        <CommandCategory
          :commands
          :search-value
          :categories
          :loading="false"
        />
      </section>
    </div>
  </UContainer>
</template>

<script lang="ts" setup>
import type { FlattenedCommand } from "#shared/types/discord";
import { Time } from "@sapphire/time-utilities";
import { isDevelopment } from "std-env";

// SEO
useSeoMetadata({
  title: "Commands",
  description: "Browse all available WolfStar bot commands and their descriptions.",
  shouldSeoImage: true,
  seoImage: {
    title: "WolfStar Commands",
    description: "Explore all bot commands",
  },
});

// State
const searchValue = ref("");
const commands = ref<FlattenedCommand[]>([]);
const loading = ref(false);
const refreshing = ref(false);

const categories = computed(() => {
  const uniqueCategories = new Set<string>();
  for (const command of commands.value) {
    uniqueCategories.add(command.category || "General");
  }
  return [...uniqueCategories].sort();
});

const filteredCommandsCount = computed(() => {
  if (!searchValue.value)
    return commands.value.length;
  const search = searchValue.value.toLowerCase();
  return commands.value.filter(cmd =>
    cmd.name.toLowerCase().includes(search)
    || (cmd.description && cmd.description.toLowerCase().includes(search)),
  ).length;
});

async function fetchCommands() {
  loading.value = true;
  try {
    const commandsStorage = useLocalStorage<ExpirableLocalStorageStructure<FlattenedCommand[]>>(LocalStorageKeys.Commands, {
      expire: 0,
      data: [],
    });
    if (commandsStorage.value && (isDevelopment || commandsStorage.value.expire > Date.now())) {
      commands.value = commandsStorage.value.data;
    }
    else {
      const commandsData = await $fetch<FlattenedCommand[]>("/api/commands", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      commands.value = commandsData;
      commandsStorage.value = {
        expire: Date.now() + Time.Day * 6,
        data: commandsData,
      };
    }
  }
  finally {
    loading.value = false;
  }
}

// Lifecycle
onMounted(fetchCommands);
</script>
