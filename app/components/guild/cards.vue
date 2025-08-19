<template>
  <!-- Enhanced Guild Cards Grid - inspired by Dyno.gg -->
  <div class="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-base-content space-y-6">
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
      <div ref="scrollComponent">
        <!-- Guild Cards Grid -->
        <div v-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <guild-card-skeleton v-for="guild in paginatedGuilds" :key="guild.id" class="h-full" :type="type" />
        </div>

        <div
          v-if="!loading && paginatedGuilds.length > 0"
          class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          <guild-card v-for="guild in paginatedGuilds" :key="guild.id" class="h-full" :guild="guild" :type="type" />
        </div>

        <!-- Loading Indicator for Infinite Scroll -->
        <div v-if="!loading && loadingMore" class="flex justify-center py-4">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && error" class="flex flex-col items-center justify-center space-y-6 py-16">
        <ShadAlert
          color="error"
          variant="subtle"
          title="Error Occurred"
          :description="error.toString()"
          icon="heroicons:exclamation-triangle"
        />
      </div>
      <div v-else-if="!loading && filterGuilds.length === 0" class="flex flex-col items-center justify-center space-y-6 py-16">

        <div class="text-center py-16">
          <h3 class="text-xl font-bold text-base-content/80 mb-2">
            {{ searchQuery ? 'No matching servers' : 'No servers found' }}
          </h3>
          <p class="max-w-md mx-auto text-base-content/60">
            {{ searchQuery && filterGuilds.length === 0 ? 'Try adjusting your search terms or filters.' : "Start by inviting WolfStar to your Discord servers." }}
          </p>
        </div>

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
  type?: "card" | "grid";
};

const props = withDefaults(defineProps<EnhancedGuildCardsProps>(), {
  loading: false,
  type: "card",
});

const INITIAL_COUNT = 20;
const LOAD_MORE_COUNT = 10;

const visibleCount = ref(INITIAL_COUNT);
const scrollComponent = useTemplateRef<HTMLElement>("scrollComponent");
const loading = toRef(props, "loading");
const type = reactive(toRef(props, "type"));
const paginatedGuilds = computed(() => {
  return props.filterGuilds.slice(0, visibleCount.value);
});

const { isLoading: loadingMore, reset } = useInfiniteScroll(
  scrollComponent,
  () => {
    if (loading.value)
      return;
    visibleCount.value += LOAD_MORE_COUNT;
  },
  {
    distance: 10,
    canLoadMore: () => visibleCount.value < props.filterGuilds.length,
  },
);

watch(
  () => props.filterGuilds,
  () => {
    visibleCount.value = INITIAL_COUNT;
    reset();
  },
);
</script>
