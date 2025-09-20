<template>
  <UContainer class="w-full max-w-7xl sm:px-6 lg:px-8 sm:py-6 text-base-content space-y-6">
    <div class="flex flex-col justify-between gap-4 sm:flex-row">
      <div class="flex items-start">
        <div v-if="loading" class="text-sm text-base-content/60 sm:block">
          <div class="animate-pulse flex items-center">
            <div class="h-4 w-24 bg-base-content/20 rounded"></div>
            <div class="mx-1 h-4 w-4 bg-base-content/20 rounded"></div>
            <div class="h-4 w-24 bg-base-content/20 rounded"></div>
          </div>
        </div>
        <div v-else-if="guilds" class="text-sm text-base-content/60 sm:block">
          <span>{{ filterGuilds.length }} of {{ guilds?.length || 0 }} servers</span>
        </div>
      </div>
      <!-- Control Buttons with Loading States -->
    </div>

    <div class="w-full">
      <!-- Loading Skeleton Grid -->
      <div v-if="loading" class="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <guild-card-skeleton v-for="n in INITIAL_COUNT" :key="n" :view-mode />
      </div>
      <div v-else ref="scrollComponent">
        <!-- Guild Cards Grid -->
        <div
          v-if="paginatedGuilds.length > 0"
          class="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          <guild-card v-for="guild in paginatedGuilds" :key="guild.id" class="h-full" :guild="guild" :view-mode />
        </div>
      </div>

      <!-- Loading Indicator for Infinite Scroll -->
      <div v-if="!loading && loadingMore" class="flex justify-center py-4">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && error">
        <div class="flex flex-col items-center justify-center space-y-6 py-16">
          <UAlert
            color="error"
            variant="subtle"
            title="Error Occurred"
            :description="error.statusMessage ?? error.message"
            icon="heroicons:exclamation-triangle"
          />
        </div>
      </div>
      <div v-else-if="!loading && filterGuilds.length === 0">
        <div class="flex flex-col items-center justify-center space-y-6 py-16">
          <div class="text-center py-16">
            <h3 class="text-xl font-bold text-base-content/80 mb-2">
              {{ searchQuery ? 'No matching servers' : 'No servers found' }}
            </h3>
            <p class="max-w-md mx-auto text-base-content/60">
              {{ searchQuery ? 'Try adjusting your search terms or filters.' : "Start by inviting WolfStar to your Discord servers." }}
            </p>
          </div>

          <UButton
            v-if="searchQuery"
            variant="outline"
            size="sm"
            class="gap-2 transition-all duration-200 hover:scale-105"
            icon="heroicons:x-mark"
            @click="undoSearch"
          >
            Clear Search
          </UButton>
        </div>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import type { TransformedLoginData } from "#shared/types/discord";
import type { FetchError } from "ofetch";
import { useInfiniteScroll } from "@vueuse/core";

interface EnhancedGuildCardsProps {
  filterGuilds: NonNullable<TransformedLoginData["transformedGuilds"]>;
  guilds: TransformedLoginData["transformedGuilds"] | null;
  undoSearch: () => void;
  searchQuery: string | null;
  loading: boolean;
  error: FetchError<any> | undefined;
  viewMode: "card" | "grid";
};

const { filterGuilds, guilds, undoSearch, searchQuery, loading, error, viewMode } = defineProps<EnhancedGuildCardsProps>();

const INITIAL_COUNT = 20;
const LOAD_MORE_COUNT = 10;

const visibleCount = ref(INITIAL_COUNT);
const scrollComponent = useTemplateRef<HTMLElement>("scrollComponent");

const paginatedGuilds = computed(() => {
  return filterGuilds.slice(0, visibleCount.value);
});

const { isLoading: loadingMore, reset } = useInfiniteScroll(
  scrollComponent,
  () => {
    if (loading || error !== undefined)
      return;
    visibleCount.value += LOAD_MORE_COUNT;
  },
  {
    distance: 10,
    canLoadMore: () => visibleCount.value < filterGuilds.length,
  },
);

watch(
  () => filterGuilds,
  () => {
    visibleCount.value = INITIAL_COUNT;
    reset();
  },
);
</script>
