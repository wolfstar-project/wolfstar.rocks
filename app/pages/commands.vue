<template>
  <!-- Hero Background Pattern -->
  <div class="hero-pattern" aria-hidden="true"></div>

  <UContainer class="mx-auto max-w-7xl space-y-12 px-4 py-8 relative z-10">
    <!-- Page Header - Hero Style -->
    <header class="mt-16 flex flex-col items-center text-center space-y-6 animate-fade-in-up">
      <h1 class="title pb-4">
        Discover<br />WolfStar Commands
      </h1>
      <p class="max-w-2xl text-lg text-base-content/80 animate-fade-in-up animate-fade-in-delay-1">
        Browse and search through all available bot commands.
        <span class="font-semibold">Powerful moderation</span> at your fingertips.
      </p>
    </header>

    <!-- Commands content -->
    <div class="space-y-8 animate-fade-in-up animate-fade-in-delay-2">
      <!-- Search bar -->
      <section aria-labelledby="search-heading" class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 max-w-3xl mx-auto">
        <h2 id="search-heading" class="sr-only">
          Search Commands
        </h2>
        <UInput
          v-model="searchValue"
          placeholder="Search a command..."
          icon="i-heroicons-magnifying-glass"
          size="xl"
          class="flex-1 card-glass"
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
          size="xl"
          class="card-glass hover-lift"
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
        <div class="card-glass text-center py-20 rounded-2xl">
          <div class="relative inline-block">
            <div class="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse"></div>
            <UIcon name="i-heroicons-arrow-path" class="animate-spin h-12 w-12 mx-auto mb-6 text-primary relative" />
          </div>
          <p class="text-xl font-semibold mb-2">Loading commands...</p>
          <p class="text-sm text-base-content/60">Fetching the latest command data</p>
        </div>
      </div>

      <!-- No results message -->
      <div v-else-if="commands.length === 0" class="card-glass text-center py-20 rounded-2xl space-y-6" role="status">
        <div class="relative inline-block">
          <div class="absolute inset-0 rounded-full bg-error/20 blur-xl"></div>
          <UIcon name="i-heroicons-exclamation-circle" class="h-16 w-16 mx-auto text-error/80 relative" />
        </div>
        <div>
          <h2 class="text-2xl font-bold mb-3">No commands available</h2>
          <p class="text-base-content/70 max-w-md mx-auto">
            Unable to load commands at this time. Please try refreshing.
          </p>
        </div>
        <UButton
          icon="i-heroicons-arrow-path"
          color="primary"
          variant="outline"
          size="lg"
          @click="fetchCommands()"
        >
          Try Again
        </UButton>
      </div>

      <!-- Categories -->
      <section
        v-else
        aria-labelledby="categories-heading"
        class="card-glass hover-border-glow rounded-2xl p-6 sm:p-8 transition-all"
      >
        <h2 id="categories-heading" class="sr-only">
          Command Categories
        </h2>
        <CommandCategory
          :commands="filteredCommands"
          :search-value
          :categories
          :loading
        />
      </section>
    </div>
  </UContainer>
</template>

<script lang="ts" setup>
import type { FlattenedCommand } from "#shared/types/discord";
import { Time } from "@sapphire/time-utilities";
import { useFuse } from "@vueuse/integrations/useFuse";
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

// Fuse.js fuzzy search
const { results } = useFuse(searchValue, commands, {
  fuseOptions: {
    keys: ["name", "description", "category"],
    threshold: 0.3,
  },
  matchAllWhenSearchEmpty: true,
});

const filteredCommands = computed(() => {
  return results.value.map(result => result.item);
});

const categories = computed(() => {
  const uniqueCategories = new Set<string>();
  for (const command of commands.value) {
    uniqueCategories.add(command.category || "General");
  }
  return [...uniqueCategories].sort();
});

const filteredCommandsCount = computed(() => {
  return results.value.length;
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

<style scoped>
@reference "@/assets/css/main.css";

.title {
	@apply text-4xl font-bold leading-[3.05rem] md:text-6xl md:leading-18;
	background: linear-gradient(to bottom right, oklch(100% 0 45) 0%, oklch(75% 0.18 15) 50%, var(--color-branding-wolfstar) 100%);
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

/* Hero background pattern */
.hero-pattern {
	@apply fixed inset-0 -z-10 pointer-events-none;
	mask-image: linear-gradient(to bottom, white 0%, transparent 70%);
	-webkit-mask-image: linear-gradient(to bottom, white 0%, transparent 70%);
	background-image:
		radial-gradient(ellipse at 50% 0%, oklch(from var(--branding-wolfstar) l c h / 0.15) 0%, transparent 60%),
		linear-gradient(to right, oklch(50% 0 0 / 0.03) 1px, transparent 1px), linear-gradient(to bottom, oklch(50% 0 0 / 0.03) 1px, transparent 1px);
	background-size:
		100% 100%,
		4rem 4rem,
		4rem 4rem;
}
</style>
