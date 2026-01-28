<template>
  <UContainer
    class="w-full max-w-7xl px-4 py-4 text-base-content sm:px-6 sm:py-6 lg:px-8"
    role="region"
    aria-label="Server list"
  >
    <div class="mb-4 flex flex-col justify-between gap-4 sm:flex-row">
      <div class="flex items-start">
        <div v-if="loading" class="text-sm text-base-content/60 sm:block">
          <div class="flex animate-pulse items-center">
            <div class="h-4 w-24 rounded bg-base-content/20"></div>
            <div class="mx-1 h-4 w-4 rounded bg-base-content/20"></div>
            <div class="h-4 w-24 rounded bg-base-content/20"></div>
          </div>
        </div>
        <div v-else-if="guilds" class="text-sm text-base-content/60 sm:block" role="status" aria-live="polite">
          <span>{{ filteredGuilds.length }} of {{ guilds?.length || 0 }} servers</span>
        </div>
      </div>
    </div>

    <div class="w-full">
      <!-- Loading Skeleton Grid -->
      <div ref="scrollComponent">
        <!-- Loading Skeleton Grid -->
        <div
          v-if="loading"
          class="grid grid-cols-2 gap-8 sm:grid-cols-3 md:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          role="status"
          aria-label="Loading servers"
        >
          <guild-card v-for="n in INITIAL_COUNT" :key="n" :loading="true" />
        </div>

        <!-- Guild Cards Grid -->
        <div
          v-else-if="paginatedGuilds.length > 0"
          class="grid grid-cols-2 gap-8 sm:grid-cols-3 md:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          role="list"
          aria-label="Guilds list"
        >
          <guild-card
            v-for="guild in paginatedGuilds"
            :key="guild.id"
            :guild
            role="listitem"
          />
        </div>
      </div>

      <!-- Loading Indicator for Infinite Scroll -->
      <div v-if="!loading && loadingMore" class="flex justify-center py-4" role="status" aria-label="Loading more servers">
        <span class="loading loading-spinner loading-lg text-primary" aria-hidden="true"></span>
      </div>

      <!-- Error State with Enhanced UX -->
      <div
        v-if="!loading && error"
        v-motion
        :initial="{ opacity: 0, scale: 0.95 }"
        :enter="{ opacity: 1, scale: 1, transition: { duration: 300, ease: 'easeOut' } }"
        :leave="{ opacity: 0, scale: 0.95, transition: { duration: 200, ease: 'easeIn' } }"
        class="py-8"
      >
        <div
          class="mx-auto max-w-2xl rounded-xl border p-6"
          :class="[
            errorState.color === 'warning'
              ? 'border-warning/30 bg-warning/10 text-warning'
              : 'border-error/30 bg-error/10 text-error',
          ]"
        >
          <div class="flex items-start gap-4">
            <div class="shrink-0">
              <UIcon :name="errorState.icon" class="size-6" />
            </div>
            <div class="flex-1 space-y-2">
              <h3 class="text-lg font-semibold">{{ errorState.title }}</h3>
              <p class="opacity-90">{{ errorState.description }}</p>
              <p v-if="errorState.suggestion" class="text-sm opacity-70">
                {{ errorState.suggestion }}
              </p>
            </div>
          </div>
          <div class="mt-4 flex justify-end">
            <UButton
              v-if="error.status === 401"
              color="error"
              variant="outline"
              size="sm"
              icon="heroicons:arrow-path"
              @click="reloadPage"
            >
              Reload Page
            </UButton>
            <UButton
              v-else-if="onRetry"
              :color="errorState.color"
              variant="outline"
              size="sm"
              icon="heroicons:arrow-path"
              :loading="isRetrying"
              @click="onRetry"
            >
              {{ isRetrying ? "Retrying..." : "Try Again" }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && !error && filteredGuilds.length === 0">
        <div class="flex flex-col items-center justify-center space-y-6 py-16">
          <div class="py-16 text-center" role="status" aria-live="polite">
            <h2 class="mb-2 text-xl font-bold text-base-content/80">
              {{ searchQuery ? "No matching servers" : "No servers found" }}
            </h2>
            <p class="mx-auto max-w-md text-base-content/60">
              {{
                searchQuery
                  ? "Try adjusting your search terms or filters."
                  : "Start by inviting WolfStar to your Discord servers."
              }}
            </p>
          </div>

          <UButton
            v-if="searchQuery"
            variant="outline"
            size="sm"
            class="gap-2 transition-all duration-200 hover:scale-105"
            icon="heroicons:x-mark"
            aria-label="Clear search filter"
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

interface GuildCardsProps {
  filteredGuilds: NonNullable<TransformedLoginData["transformedGuilds"]>;
  guilds: TransformedLoginData["transformedGuilds"] | null;
  undoSearch: () => void;
  searchQuery: string | null;
  loading: boolean;
  error: FetchError<any> | undefined;
  isRetrying?: boolean;
  onRetry?: () => void;
}

const {
  filteredGuilds,
  guilds,
  undoSearch,
  searchQuery,
  loading,
  error,
  isRetrying = false,
  onRetry,
} = defineProps<GuildCardsProps>();

// Error handling computed properties
const isTimeoutError = computed(() => error?.status === 408);
const isNetworkError = computed(() =>
  (error?.status === 0
    || error?.message?.includes("network")
    || error?.message?.includes("fetch")) ?? false,
);

const errorState = computed(() => ({
  color: (() => {
    if (isTimeoutError.value || isNetworkError.value || error?.status === 429) {
      return "warning";
    }
    return "error";
  })() as "error" | "warning",
  title: (() => {
    if (!error) {
      return "Error";
    }
    if (isTimeoutError.value) {
      return "Request Timeout";
    }
    if (error.status === 401) {
      return "Session Expired";
    }
    if (error.status === 403) {
      return "Access Denied";
    }
    if (error.status === 429) {
      return "Too Many Requests";
    }
    if (error.status && error.status >= 500) {
      return "Server Error";
    }
    if (isNetworkError.value) {
      return "Network Error";
    }
    return "Error Loading Servers";
  })(),
  description: (() => {
    if (!error) {
      return "An unexpected error occurred.";
    }
    if (isTimeoutError.value) {
      return "The request took too long to complete.";
    }
    if (error.status === 401) {
      return "Your session has expired. Please log in again.";
    }
    if (error.status === 403) {
      return "You don't have permission to access this resource.";
    }
    if (error.status === 429) {
      return "You've made too many requests. Please wait a moment before trying again.";
    }
    if (error.status && error.status >= 500) {
      return "Something went wrong on our end. Please try again later.";
    }
    if (isNetworkError.value) {
      return "Unable to connect to the server.";
    }
    return error.statusText ?? error.message ?? "Failed to load servers.";
  })(),
  suggestion: (() => {
    if (isTimeoutError.value) {
      return "This might be due to slow network connection or server load. Try again in a moment.";
    }
    if (error?.status === 429) {
      return "Rate limiting is in effect to protect the service.";
    }
    if (error?.status && error.status >= 500) {
      return "If this persists, please contact support.";
    }
    if (isNetworkError.value) {
      return "Please check your internet connection and try again.";
    }
    return undefined;
  })(),
  icon: (() => {
    if (isTimeoutError.value) {
      return "heroicons:clock";
    }
    if (error?.status === 401) {
      return "heroicons:lock-closed";
    }
    if (error?.status === 403) {
      return "heroicons:shield-exclamation";
    }
    if (error?.status === 429) {
      return "heroicons:hand-raised";
    }
    if (error?.status && error.status >= 500) {
      return "heroicons:server";
    }
    if (isNetworkError.value) {
      return "heroicons:signal-slash";
    }
    return "heroicons:exclamation-triangle";
  })(),
}));

const INITIAL_COUNT = 20;
const LOAD_MORE_COUNT = 10;

const visibleCount = ref(INITIAL_COUNT);
const scrollComponent = useTemplateRef<HTMLElement>("scrollComponent");

const paginatedGuilds = computed(() => {
  return filteredGuilds.slice(0, visibleCount.value);
});

const { isLoading: loadingMore, reset } = useInfiniteScroll(
  scrollComponent,
  () => {
    visibleCount.value += LOAD_MORE_COUNT;
  },
  {
    distance: 10,
    canLoadMore: () => visibleCount.value < filteredGuilds.length,
  },
);

function reloadPage() {
  window.location.reload();
}

watch(
  () => filteredGuilds.length,
  () => {
    visibleCount.value = INITIAL_COUNT;
    reset();
  },
);
</script>
