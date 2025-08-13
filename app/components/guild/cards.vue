<template>
  <!-- Enhanced Guild Cards Grid - inspired by Dyno.gg -->
  <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-base-content space-y-6">
    <template v-if="!loading">
      <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div class="w-full flex-col space-x-2 sm:w-auto">
          <!-- Search Input for Desktop -->
          <div class="relative flex-grow">
            <ShadInput
              v-model="searchQuery"
              type="text"
              placeholder="Search servers..."
              :disabled="loading"
              icon="heroicons:magnifying-glass-circle"
              :loading="loading"
              loading-icon="i-lucide-loader"
            >
              <template #trailing>
                <ShadKbd
                  value="k"
                  class="absolute top-1/2 right-2 -translate-y-1/2"
                />
              </template>
            </ShadInput>
          </div>
        </div>

        <!-- Manageable Only Toggle Button -->
        <div class="form-control">
          <ShadButton
            variant="ghost"
            size="sm"
            :class="{ 'btn-active': showManageableOnly }"
            :disabled="loading"
            @click="showManageableOnly = !showManageableOnly"
          >
            <template #leading>
              <ShadIcon name="heroicons:shield-check" class="h-4 w-4" />
            </template>
            <span class="hidden sm:inline">Manageable</span>
          </ShadButton>
        </div>

        <div v-if="loading && !error && (!guilds || guilds.length === 0)">
          <ShadButton variant="outline" size="sm" @click="refreshGuilds()">
            <template #leading>
              <ShadIcon name="heroicons:arrow-path" class="h-4 w-4" />
            </template>
            Refresh
          </ShadButton>
        </div>
      </div>
      <div class="hidden text-sm text-base-content/60 sm:block">
        <span> {{ filteredGuilds.length }} of {{ guilds?.length || 0 }} servers </span>
      </div>
    </template>

    <div v-else class="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div class="flex items-center space-x-4">
        <div class="skeleton h-12 w-64 rounded-lg"></div>
        <div class="skeleton h-6 w-32 rounded"></div>
      </div>
      <div class="skeleton h-4 w-24 rounded"></div>
    </div>

    <!-- Loading Skeleton Grid -->
    <div v-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <guild-card-skeleton v-for="i in 14" :key="`skeleton-${i}`" class="h-full" />
    </div>

    <div ref="scrollComponent">
      <!-- Guild Cards Grid -->
      <div
        v-if="!loading && paginatedGuilds.length > 0"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      >
        <guild-card v-for="guild in paginatedGuilds" :key="guild.id" :guild="guild" class="h-full" />
      </div>

      <!-- Loading Indicator for Infinite Scroll -->
      <div v-if="!loading && loadingMore" class="flex justify-center py-4">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!loading && filteredGuilds.length === 0"
      class="flex flex-col items-center justify-center space-y-6 py-16"
    >
      <div class="relative">
        <ShadIcon
          :name="searchQuery ? 'heroicons:magnifying-glass-circle' : 'heroicons:server-stack'"
          class="h-20 w-20 text-base-content/30 transition-all duration-300"
        />
        <div v-if="!searchQuery" class="absolute -top-2 -right-2">
          <ShadIcon name="heroicons:plus-circle" class="h-8 w-8 text-primary/50" />
        </div>
      </div>

      <div class="text-center space-y-2">
        <ShadAlert
          v-if="error"
          color="error"
          variant="soft"
          title="Error Occurred"
          :description="error.toString()"
          icon="heroicons:exclamation-triangle"
        />
        <div v-else>
          <h3 class="text-xl font-bold text-base-content/80">
            {{ searchQuery ? 'No matching servers' : 'No servers found' }}
          </h3>
          <p class="max-w-md text-center text-base-content/60">
            {{ searchQuery ? 'Try adjusting your search terms or filters.' : "Start by inviting WolfStar to your Discord servers." }}
          </p>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          v-if="searchQuery"
          class="btn btn-outline btn-sm gap-2 transition-all duration-200 hover:scale-105"
          @click="undoSearch"
        >
          <ShadIcon name="heroicons:x-mark" class="h-4 w-4" />
          Clear Search
        </button>
        <button class="btn btn-primary btn-sm gap-2 transition-all duration-200 hover:scale-105 shadow-lg">
          <ShadIcon name="heroicons:rocket-launch" class="h-4 w-4" />
          Invite WolfStar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TransformedLoginData } from "~~/shared/types/discord";
import { isNullOrUndefined } from "@sapphire/utilities";
import { useInfiniteScroll, useRefHistory } from "@vueuse/core";

interface EnhancedGuildCardsProps {
  guilds: TransformedLoginData["transformedGuilds"] | null;
  loading?: boolean;
  error?: Error | null;
  refreshGuilds: (opts?: object) => Promise<void>;
};

const props = withDefaults(defineProps<EnhancedGuildCardsProps>(), {
  loading: false,
});

const INITIAL_COUNT = 20;
const LOAD_MORE_COUNT = 10;

const visibleCount = ref(INITIAL_COUNT);
const scrollComponent = ref<HTMLElement | null>(null);
const loadingMore = ref(false);
// is true by default because we want to show only manageable servers
const showManageableOnly = ref(true);
// Search and filtering
const searchQuery = ref("");

const { history: _searchHistory, undo: undoSearch, redo: _redoSearch, canUndo: _canUndo, canRedo: _canRedo } = useRefHistory(searchQuery, {
  deep: false,
  capacity: 10, // Keep last 10 search terms
});
// Computed filtered guilds
const filteredGuilds = computed(() => {
  if (isNullOrUndefined(props.guilds))
    return [];

  let filtered = [...props.guilds];

  // Apply manageable filter
  if (showManageableOnly.value) {
    filtered = filtered.filter(guild => guild.manageable);
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(guild => guild.name.toLowerCase().includes(query) || guild.id.includes(query));
  }

  // Sort: manageable servers first, then alphabetically
  return filtered.sort((guildA, guildB) => {
    if (guildA.manageable !== guildB.manageable) {
      return guildA.manageable ? -1 : 1;
    }
    if (guildA.wolfstarIsIn !== guildB.wolfstarIsIn) {
      return guildA.wolfstarIsIn ? -1 : 1;
    }
    return guildA.name.localeCompare(guildB.name, "en", { sensitivity: "base" });
  });
});

const paginatedGuilds = computed(() => {
  return filteredGuilds.value.slice(0, visibleCount.value);
});

function loadMore() {
  if (loadingMore.value || visibleCount.value >= filteredGuilds.value.length)
    return;

  loadingMore.value = true;
  setTimeout(() => {
    visibleCount.value += LOAD_MORE_COUNT;
    loadingMore.value = false;
  }, 500); // Simulate loading delay
}

useInfiniteScroll(
  scrollComponent,
  () => {
    if (!props.loading)
      loadMore();
  },
  { distance: 10 },
);
</script>
