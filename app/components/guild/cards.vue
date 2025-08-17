<template>
  <!-- Enhanced Guild Cards Grid - inspired by Dyno.gg -->
  <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-base-content space-y-6">
    <div class="flex flex-col justify-between gap-4 sm:flex-row">
      <div class="flex items-start">
        <div v-if="guilds" class="text-sm text-base-content/60 sm:block">
          <span> {{ filterGuilds.length }} of {{ guilds?.length || 0 }} servers </span>
        </div>
      </div>
      <!-- Control Buttons with Loading States -->
    </div>

    <!--- <div v-if="loading" class="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div class="flex items-center space-x-4">
        <div class="skeleton h-12 w-64 rounded-lg">
        </div>
        <div class="skeleton h-6 w-32 rounded"></div>
      </div>
      <div class="skeleton h-4 w-24 rounded"></div>
    </div> -->
    <div>
      <!-- Loading Skeleton Grid -->

      <div ref="scrollComponent">
        <!-- Guild Cards Grid -->
        <div
          v-if="!loading && paginatedGuilds.length > 0"
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          <guild-card v-for="guild in paginatedGuilds" :key="guild.id" class="h-full" :guild="guild" :loading="loading" :type="type" />
        </div>

        <!-- Loading Indicator for Infinite Scroll -->
        <div v-if="!loading && loadingMore" class="flex justify-center py-4">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="!loading && filterGuilds.length === 0"
        class="flex flex-col items-center justify-center space-y-6 py-16"
      >
        <div class="text-center space-y-2">
          <div v-if="error">
            <ShadAlert
              color="error"
              title="Error Occurred"
              :description="error.toString()"
              icon="heroicons:exclamation-triangle"
            />
            <div>
              <h3 class="text-xl font-bold text-base-content/80">
                {{ searchQuery ? 'No matching servers' : 'No servers found' }}
              </h3>
              <p class="max-w-md text-center text-base-content/60">
                {{ searchQuery ? 'Try adjusting your search terms or filters.' : "Start by inviting WolfStar to your Discord servers." }}
              </p>
            </div>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TransformedLoginData } from "~~/shared/types/discord";
import { useInfiniteScroll } from "@vueuse/core";

interface EnhancedGuildCardsProps {
  filterGuilds: NonNullable<TransformedLoginData["transformedGuilds"]>;
  guilds: TransformedLoginData["transformedGuilds"] | null;
  undoSearch: () => void;
  searchQuery: string;
  loading?: boolean;
  error?: Error | null;
  type?: "card" | "list";
};

const props = withDefaults(defineProps<EnhancedGuildCardsProps>(), {
  loading: false,
});

const INITIAL_COUNT = 20;
const LOAD_MORE_COUNT = 10;

const visibleCount = ref(INITIAL_COUNT);
const scrollComponent = ref<HTMLElement | null>(null);
const loadingMore = ref(false);

const paginatedGuilds = computed(() => {
  return props.filterGuilds.slice(0, visibleCount.value);
});

function loadMore() {
  if (loadingMore.value || visibleCount.value >= props.filterGuilds.length)
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
