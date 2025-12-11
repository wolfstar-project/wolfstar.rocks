<!-- eslint-disable vue/valid-v-else-if -->
<template>
  <UContainer class="mx-auto max-w-7xl space-y-8 px-4 py-8">
    <section
      class="flex flex-col items-center justify-center space-y-6 rounded-xl bg-linear-to-br from-base-100 via-base-200 to-base-100 p-12 shadow-xl border border-base-300"
    >
      <div
        v-if="!user || isLoading"
        class="flex flex-col items-center justify-center space-y-6"
      >
        <USkeleton class="h-24 w-24 rounded-full ring-2 ring-base-200 ring-offset-4 ring-offset-base-100" />
        <div class="space-y-2 text-center">
          <USkeleton class="h-10 w-48" />
          <USkeleton class="h-7 w-32" />
          <div class="flex items-center justify-center gap-2">
            <USkeleton class="h-6 w-16" />
            <USkeleton class="h-6 w-32 rounded-md" />
          </div>
        </div>
      </div>
      <template v-else>
        <UAvatar
          :src
          :alt="`Avatar's ${user.name}`"
          class="rounded-full ring-2 ring-base-200 ring-offset-4 ring-offset-base-100 transition-all duration-300"
        />
        <div class="space-y-2 text-center">
          <h1 class="text-4xl font-bold text-base-content">
            {{ user.globalName ?? user.username }}
          </h1>
          <p class="text-lg font-medium text-base-content/80">
            @{{ user.username }}
          </p>
          <p class="text-sm text-base-content/60">
            User ID:               <UButton
              variant="outline"
              size="xs"
              color="neutral"
              class="text-sm text-base-content/60 hover:text-base-content"
              @click="copyUserId"
            >
              <template #leading>
                <UIcon :name="copied ? 'heroicons:check' : 'heroicons:clipboard-document'" />
              </template>
              {{ user.id }}
            </UButton>
          </p>
        </div>
      </template>
    </section>

    <section
      class="overflow-hidden rounded-xl shadow-lg flex flex-col items-center bg-base-100 border border-base-300"
    >
      <UTabs
        v-model="activeTab"
        variant="transparent"
        :items
        class="w-full flex flex-col items-center justify-center"
      >
        <template #content="{ item }">
          <div class="p-8">
            <div v-if="item.value === 'servers'" class="space-y-6">
              <!-- Server Section Header -->
              <div class="mb-4">
                <h2 class="text-2xl font-bold text-base-content">Servers</h2>
                <p class="mt-1 text-base-content/60">
                  <USkeleton
                    v-if="isLoading"
                    class="inline-block h-5 w-48"
                  />
                  <span v-else>Servers you're in ({{ guilds?.length ?? 0 }} servers)</span>
                </p>
              </div>

              <!-- Search and Controls Section -->
              <div
                class="flex flex-wrap items-center justify-between gap-4 mb-4"
              >
                <div class="flex items-end gap-2">
                  <UFieldGroup class="flex items-start gap-2">
                    <UInput
                      ref="input"
                      v-model="searchQuery"
                      name="search"
                      type="text"
                      placeholder="Search servers.."
                      icon="heroicons:magnifying-glass-circle"
                      :is-loading
                      is-loading-icon="lucide:loader"
                      class="max-w-xs flex items-start"
                    >
                      <template v-if="searchQuery?.length" #trailing>
                        <UButton
                          color="neutral"
                          variant="link"
                          size="sm"
                          icon="lucide:circle-x"
                          aria-label="Clear input"
                          @click="undoSearch()"
                        />
                      </template>
                    </UInput>
                  </UFieldGroup>
                  <!-- Mobile Buttons (no view toggle) -->
                  <UFieldGroup size="sm" class="flex items-end join sm:hidden">
                    <!-- Manageable Only Toggle Button -->
                    <UButton
                      class="join-item"
                      color="primary"
                      :is-loading
                      is-loading-icon="lucide:loader"
                      icon="heroicons:shield-check"
                      @click="toggleShowManageableOnly()"
                    />

                    <!-- Sort Button -->
                    <UButton
                      class="join-item"
                      color="primary"
                      :is-loading
                      @click="toggleSortOrder()"
                    >
                      <template #leading>
                        <UIcon
                          v-motion
                          :initial="{ opacity: 0 }"
                          :enter="{ opacity: 1, transition: { duration: 150 } }"
                          :leave="{ opacity: 0, transition: { duration: 150 } }"
                          :name="
                            sortAscending
                              ? 'lucide:arrow-up-a-z'
                              : 'lucide:arrow-down-z-a'
                          "
                        />
                      </template>
                    </UButton>

                    <!-- Refresh Button -->
                    <UButton
                      v-if="filteredGuilds.length === 0"
                      class="join-item"
                      color="primary"
                      :is-loading
                      is-loading-icon="lucide:loader"
                      icon="heroicons:arrow-path-20-solid"
                      @click="refresh()"
                    />
                  </UFieldGroup>

                  <!-- Desktop Buttons (with view toggle) -->
                  <UFieldGroup size="sm" class="hidden sm:flex items-end join">
                    <!-- View Button -->
                    <UButton
                      class="join-item"
                      color="primary"
                      is-loading-icon="lucide:loader"
                      :is-loading
                      @click="toggleView()"
                    >
                      <template #leading>
                        <UIcon
                          v-motion
                          :initial="{ opacity: 0 }"
                          :enter="{ opacity: 1, transition: { duration: 150 } }"
                          :leave="{ opacity: 0, transition: { duration: 150 } }"
                          :name="
                            viewMode === 'grid'
                              ? 'heroicons:squares-2x2'
                              : 'heroicons:bars-3'
                          "
                        />
                      </template>

                      <span>View</span>
                    </UButton>

                    <!-- Manageable Only Toggle Button -->
                    <UButton
                      class="join-item"
                      color="primary"
                      :is-loading
                      is-loading-icon="lucide:loader"
                      icon="heroicons:shield-check"
                      @click="toggleShowManageableOnly()"
                    >
                      <span>Manageable</span>
                    </UButton>

                    <!-- Sort Button -->
                    <UButton
                      class="join-item"
                      color="primary"
                      :is-loading
                      @click="toggleSortOrder()"
                    >
                      <template #leading>
                        <UIcon
                          v-motion
                          :initial="{ opacity: 0 }"
                          :enter="{ opacity: 1, transition: { duration: 150 } }"
                          :leave="{ opacity: 0, transition: { duration: 150 } }"
                          :name="
                            sortAscending
                              ? 'lucide:arrow-up-a-z'
                              : 'lucide:arrow-down-z-a'
                          "
                        />
                      </template>
                    </UButton>

                    <!-- Refresh Button -->
                    <UButton
                      v-if="filteredGuilds.length === 0"
                      class="join-item"
                      color="primary"
                      :is-loading
                      is-loading-icon="lucide:loader"
                      icon="heroicons:arrow-path-20-solid"
                      @click="refresh()"
                    >
                      <span>Refresh</span>
                    </UButton>
                  </UFieldGroup>
                </div>
                <!-- Search Input for Desktop -->
              </div>
              <div class="space-y-4 md:space-y-2">
                <GuildCards
                  :error="combinedError"
                  :guilds
                  :filtered-guilds
                  :undo-search
                  :search-query
                  :loading="isLoading"
                  :is-retrying
                  :on-retry="handleRetry"
                  :view-mode
                />
              </div>
            </div>
            <div v-if="item.value === 'settings'" class="space-y-6">
              <div class="mb-6">
                <h2 class="text-2xl font-bold text-base-content">Settings</h2>
                <p class="mt-1 text-base-content/60">
                  Manage your profile settings and preferences
                </p>
              </div>

              <!-- Accessibility Settings Card -->
              <UCard>
                <template #header>
                  <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center rounded-full size-7 bg-primary/10">
                      <UIcon name="heroicons:eye-20-solid" class="size-4 text-primary" />
                    </div>

                    <div>
                      <h3 class="text-lg font-semibold text-base-content">
                        Accessibility
                      </h3>
                      <p class="text-sm text-base-content/60">
                        Customize your viewing experience
                      </p>
                    </div>
                  </div>
                </template>

                <div class="space-y-4">
                  <!-- Reduce Motion Toggle -->
                  <div class="flex items-center justify-between rounded-lg border border-base-300 bg-base-200/50 p-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-2">
                        <UIcon name="heroicons:arrows-right-left" class="h-5 w-5 text-base-content/70" />
                        <h4 class="font-medium text-base-content">
                          Reduce Motion
                        </h4>
                      </div>
                      <p class="mt-1 text-sm text-base-content/60">
                        Minimize animations and transitions for a calmer experience
                      </p>
                    </div>
                    <USwitch
                      v-model="reduceMotionEnabled"
                      size="lg"
                      :disabled="systemPrefersReducedMotion"
                      @update:model-value="setReduceMotion"
                    />
                  </div>

                  <!-- System Preference Info -->
                  <div
                    v-if="systemPrefersReducedMotion"
                    class="flex items-start gap-3 rounded-lg border border-info/30 bg-info/10 p-4"
                  >
                    <UIcon name="heroicons:information-circle" class="h-5 w-5 text-info mt-0.5 shrink-0" />
                    <div class="text-sm">
                      <p class="font-medium text-info">
                        System Preference Detected
                      </p>
                      <p class="mt-1 text-info/80">
                        Your system is configured to reduce motion. This setting is automatically applied and cannot be overridden for your safety.
                      </p>
                    </div>
                  </div>

                  <!-- Motion Status Indicator -->
                  <div class="flex items-center gap-2 text-sm">
                    <span class="text-base-content/60">Current Status:</span>
                    <UBadge
                      :color="effectiveReduceMotion ? 'primary' : 'neutral'"
                      variant="subtle"
                    >
                      <template #leading>
                        <UIcon
                          :name="effectiveReduceMotion ? 'heroicons:check-circle' : 'heroicons:x-circle'"
                          class="h-4 w-4"
                        />
                      </template>
                      {{ effectiveReduceMotion ? 'Motion Reduced' : 'Motion Enabled' }}
                    </UBadge>
                  </div>
                </div>
              </UCard>

              <!-- Privacy Settings Card -->
              <UCard>
                <template #header>
                  <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center rounded-full size-7 bg-primary/10">
                      <UIcon name="heroicons:lock-closed-20-solid" class="size-4 text-primary" />
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-base-content">
                        Privacy
                      </h3>
                      <p class="text-sm text-base-content/60">
                        Manage your privacy preferences
                      </p>
                    </div>
                  </div>
                </template>
                <div class="flex flex-col items-center justify-center py-12">
                  <div class="text-center space-y-2">
                    <UIcon name="heroicons:sparkles" class="size-12 text-base-content/30 mx-auto mb-4" />
                    <h4 class="text-xl font-semibold text-base-content/60">Coming Soon</h4>
                    <p class="text-sm text-base-content/40">Privacy controls and data management options coming soon</p>
                  </div>
                </div>
              </UCard>

              <!-- Notifications Settings Card -->
              <UCard>
                <template #header>
                  <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center rounded-full size-7 bg-primary/10">
                      <UIcon name="heroicons:bell-20-solid" class="size-4 text-primary" />
                    </div>
                    <div>
                      <h3 class="text-lg font-semibold text-base-content">
                        Notifications
                      </h3>
                      <p class="text-sm text-base-content/60">
                        Configure notification preferences
                      </p>
                    </div>
                  </div>
                </template>
                <div class="flex flex-col items-center justify-center py-12">
                  <div class="text-center space-y-2">
                    <UIcon name="heroicons:sparkles" class="size-12 text-base-content/30 mx-auto mb-4" />
                    <h4 class="text-xl font-semibold text-base-content/60">Coming Soon</h4>
                    <p class="text-sm text-base-content/40">Notification settings and preferences will be available soon</p>
                  </div>
                </div>
              </UCard>
            </div>
            <div v-if="item.value === 'premium'" class="space-y-6">
              <UCard
                class="border-2 border-primary/30 bg-linear-to-br from-primary/10 via-transparent to-secondary/10 shadow-2xl"
              >
                <template #header>
                  <div>
                    <h2 class="text-2xl font-bold text-base-content">
                      Premium
                    </h2>
                    <p class="mt-1 text-base-content/60">
                      Unlock advanced features and support the project
                    </p>
                  </div>
                </template>
                <div class="space-y-6">
                  <div class="flex flex-col items-center space-y-4 text-center">
                    <div class="flex items-center justify-center rounded-full size-18 bg-primary/20">
                      <UIcon name="heroicons:sparkles-20-solid" class="size-12 text-primary" />
                    </div>
                    <div>
                      <h3 class="text-3xl font-bold text-base-content">Upgrade to Premium</h3>
                      <p class="mt-2 text-base-content/70">
                        Unlock advanced features and get priority support
                      </p>
                    </div>
                  </div>

                  <!-- Feature List -->
                  <div class="grid gap-4 sm:grid-cols-2">
                    <div class="flex items-start gap-3">
                      <div class="flex items-center justify-center rounded-full size-10 bg-success/20">
                        <UIcon name="heroicons:check-circle" class="size-7 text-success mt-0.5" />
                      </div>
                      <div>
                        <p class="font-semibold text-base-content">Advanced Commands</p>
                        <p class="text-sm text-base-content/60">Access to premium-only commands</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <div class="flex items-center justify-center rounded-full size-10 bg-success/20">
                        <UIcon name="heroicons:check-circle" class="size-7 text-success mt-0.5" />
                      </div>
                      <div>
                        <p class="font-semibold text-base-content">Priority Support</p>
                        <p class="text-sm text-base-content/60">Get help faster from our team</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <div class="flex items-center justify-center rounded-full size-10 bg-success/20">
                        <UIcon name="heroicons:check-circle" class="size-7 text-success mt-0.5" />
                      </div>
                      <div>
                        <p class="font-semibold text-base-content">Custom Settings</p>
                        <p class="text-sm text-base-content/60">Personalize your experience</p>
                      </div>
                    </div>
                    <div class="flex items-start gap-3">
                      <div class="flex items-center justify-center rounded-full size-10 bg-success/20">
                        <UIcon name="heroicons:check-circle" class="size-7 text-success mt-0.5" />
                      </div>
                      <div>
                        <p class="font-semibold text-base-content">Early Access</p>
                        <p class="text-sm text-base-content/60">Try new features first</p>
                      </div>
                    </div>
                  </div>
                </div>
                <template #footer>
                  <UFieldGroup
                    size="md"
                    class="flex w-full justify-center pt-4 z-10"
                  >
                    <UButton color="primary">Get Premium</UButton>
                    <UButton
                      color="primary"
                      variant="outline"
                    >
                      Learn More
                    </UButton>
                  </UFieldGroup>
                </template>
              </UCard>
            </div>
          </div>
        </template>
      </UTabs>
    </section>
  </UContainer>
</template>

<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";
import { avatarURL } from "#shared/utils/discord";
import { useFuse } from "@vueuse/integrations/useFuse";
import { FetchError } from "ofetch";
import { isDevelopment } from "std-env";

definePageMeta({ alias: ["/account"], auth: true });

useSeoMetadata({
  title: "Profile",
  description: "Manage your profile, servers and settings",
  shouldSeoImage: true,
});

// Constants for timeout and retry logic
const FETCH_TIMEOUT_MS = 15000; // 15 seconds timeout
const MAX_RETRY_ATTEMPTS = 3;

const { user } = useAuth();
// refs
// Tab Management - inspired by Dyno.gg tab system
const activeTab = ref("servers");
const isLoading = ref(true);
const { copy, copied } = useClipboard();
const evaluating = shallowRef(false);
const searchQuery = ref<null | string>(null);
const viewMode = ref<"grid" | "card">("card");

// Error handling state
const timeoutError = ref<Error | null>(null);
const isRetrying = ref(false);
const retryCount = ref(0);

// toggles
// is true by default because we want to show only manageable servers
const [showManageableOnly, toggleShowManageableOnly] = useToggle(true);
// Sort order: true for ascending, false for descending
const [sortAscending, toggleSortOrder] = useToggle(true);

// Accessibility - Reduce Motion
const {
  reduceMotionEnabled,
  effectiveReduceMotion,
  systemPreferenceActive: systemPrefersReducedMotion,
  setReduceMotion,
} = useReduceMotion();

const { data, status, error: fetchError, execute } = useFetch("/api/users", {
  key: "guilds",
  immediate: false,
  timeout: FETCH_TIMEOUT_MS,
  retry: MAX_RETRY_ATTEMPTS,
  retryDelay: 1000,
  retryStatusCodes: [408, 500, 502, 503, 504],
  transform: (data) => ({
    transformedGuilds: data.transformedGuilds ?? [],
    fetchAt: Date.now(),
  }),
  getCachedData: (key, nuxtApp) => {
    const data = nuxtApp.isHydrating
      ? nuxtApp.payload.data[key]
      : nuxtApp.static.data[key];
    if (!data) {
      return undefined;
    }

    const expirationDate = new Date(data.fetchAt);
    expirationDate.setMinutes(expirationDate.getMinutes() + minutes(10));
    const isExpired = expirationDate.getTime() < Date.now();
    if (isExpired) {
      return;
    }
    return data;
  },
  onRequest({ options }) {
    isLoading.value = true;
    timeoutError.value = null;
    logger.info(`Fetching user: ${user.value?.id} guilds ${isDevelopment && options.timeout ? `with timeout: ${options.timeout}ms` : ""}`);
  },
  onRequestError({ error }) {
    logger.error(`Profile fetch request failed: ${error.message} for user: ${user.value?.id}`);
    timeoutError.value = error;
  },
  onResponse({ response }) {
    logger.info(`Profile fetch successful with status: ${response.status} for user: ${user.value?.id}`);
  },
  onResponseError({ response, error }) {
    logger.error(`Profile fetch response error with status: ${response.status} - ${error?.message}`);

    if (response.status === 408 || (error && error.message?.includes("timeout"))) {
      timeoutError.value = createError({
        statusCode: 408,
        statusMessage: "Request Timeout",
        message: `Request timed out after ${FETCH_TIMEOUT_MS / 1000} seconds`,
      });
    }
  },
});

const guilds = computed(() => data.value?.transformedGuilds ?? []);

// Combined error for GuildCards component
const combinedError = computed(() => timeoutError.value ?? fetchError.value);

// Fetch with built-in timeout and retry
async function fetchWithTimeout() {
  isLoading.value = true;
  timeoutError.value = null;

  try {
    await execute();

    if (fetchError.value) {
      throw fetchError.value;
    }
  }
  catch (error) {
    error instanceof FetchError && logger.error(`Failed fetch user profile:\nStatus - ${error.statusCode}\n${error.message}`);
  }
  finally {
    isLoading.value = false;
  }
}

// Retry handler - ofetch handles automatic retry, this is for manual user-initiated retry
async function handleRetry() {
  isRetrying.value = true;
  retryCount.value++;

  try {
    await fetchWithTimeout();
  }
  finally {
    isRetrying.value = false;
  }
}

// Refresh wrapper for the UI buttons
async function refresh() {
  retryCount.value = 0;
  await fetchWithTimeout();
}

// Optimized filtered guilds with memoization
const filteredGuilds = computedAsync(
  () => {
    let filtered = [...guilds.value];
    evaluating.value = true;
    // Apply manageable filter
    if (showManageableOnly.value) {
      filtered = filtered.filter((guild) => guild.manageable);
    }
    // Apply search filter
    if (searchQuery.value !== null && searchQuery.value?.trim()) {
      const { results } = useFuse(searchQuery as Ref<string>, filtered, {
        fuseOptions: {
          keys: ["name", "id"],
          threshold: 0.3,
        },
      });
      filtered = results.value.map((result) => result.item);
    }
    // Sort: manageable servers first, then alphabetically
    return filtered.sort((guildA, guildB) => {
      if (guildA.manageable !== guildB.manageable) {
        return guildA.manageable ? -1 : 1;
      }
      if (guildA.wolfstarIsIn !== guildB.wolfstarIsIn) {
        return guildA.wolfstarIsIn ? -1 : 1;
      }
      const comparison = guildA.name.localeCompare(guildB.name, "en", {
        sensitivity: "base",
      });
      return sortAscending.value ? comparison : -comparison;
    });
  },
  [],
  { lazy: true, evaluating },
);

// Enhanced tabs configuration
const items = computed<TabsItem[]>(() => [
  {
    value: "servers",
    label: "Servers",
    icon: "heroicons:server",
    badge: isLoading.value
      ? undefined
      : { label: guilds.value?.length ?? "N/A", color: "primary" },
  },
  {
    value: "settings",
    label: "Settings",
    icon: "heroicons:cog-6-tooth",
  },
  {
    value: "premium",
    label: "Premium",
    icon: "heroicons:star",
  },
]);

const src = computed(() => avatarURL(user.value!, { size: 256 }));

function undoSearch() {
  searchQuery.value = null;
}

function toggleView() {
  viewMode.value = viewMode.value === "grid" ? "card" : "grid";
}

async function copyUserId() {
  if (user.value?.id) {
    await copy(user.value.id);
  }
}

watch(status, (fetchStatus) => {
  if (fetchStatus === "success") {
    evaluating.value = false;
    isLoading.value = false;
  }
});

// Initialize fetch on client side
if (import.meta.client) {
  void fetchWithTimeout().catch(logger.error);
}
</script>
