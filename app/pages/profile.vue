<!-- eslint-disable vue/valid-v-else-if -->
<template>
  <UContainer class="mx-auto max-w-7xl space-y-8 px-4 py-8">
    <section
      class="flex flex-col items-center justify-center space-y-6 rounded-xl bg-base-80 p-12 shadow-lg"
    >
      <div
        v-if="!user || isLoading"
        class="flex flex-col items-center justify-center space-y-6"
      >
        <div class="h-24 w-24 animate-pulse rounded-full bg-base-300"></div>
        <div class="space-y-2 text-center">
          <div class="h-8 w-48 animate-pulse rounded bg-base-300"></div>
          <div class="h-6 w-32 animate-pulse rounded bg-base-300"></div>
          <div class="h-4 w-56 animate-pulse rounded bg-base-300"></div>
        </div>
      </div>
      <template v-else>
        <UAvatar
          :src
          :alt="isDefault ? 'Default Avatar' : 'Avatar'"
          size="xl"
          class="rounded-full ring-2 ring-base-200 ring-offset-4 ring-offset-base-100 transition-all duration-300"
        />
        <div class="space-y-2 text-center">
          <h1 class="text-4xl font-bold text-base-content">
            {{ user.globalName ?? user.username }}
          </h1>
          <p class="text-lg font-medium text-base-content/80">
            @{{ user.username }}
          </p>
          <p class="text-sm text-base-content/60">User ID: {{ user.id }}</p>
        </div>
      </template>
    </section>

    <section
      class="overflow-hidden rounded-xl shadow-lg flex flex-col items-center"
    >
      <UTabs
        v-model="activeTab"
        variant="transparent"
        :items
        class="w-full flex flex-col items-center"
      >
        <template #content="{ item }">
          <div class="p-8">
            <div v-if="item.value === 'servers'" class="space-y-6">
              <!-- Server Section Header -->
              <div class="mb-4">
                <h2 class="text-2xl font-bold text-base-content">Servers</h2>
                <p class="mt-1 text-base-content/60">
                  <span
                    v-if="status === 'pending'"
                    class="inline-block h-5 w-48 animate-pulse rounded bg-base-300"
                  ></span>
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
                      :disabled="isLoading"
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
                  <!-- Actual Buttons -->
                  <UFieldGroup size="sm" class="flex items-end join">
                    <!-- View Button -->

                    <UButton
                      class="join-item hidden sm:inline-flex"
                      color="primary"
                      is-loading-icon="lucide:loader"
                      :is-loading
                      @click="toggleView()"
                    >
                      <template #leading>
                        <Transition name="fade" mode="in-out">
                          <UIcon
                            :name="
                              viewMode === 'grid'
                                ? 'heroicons:squares-2x2'
                                : 'heroicons:bars-3'
                            "
                          />
                        </Transition>
                      </template>

                      <span class="hidden sm:inline">View</span>
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
                      <span class="hidden sm:inline">Manageable</span>
                    </UButton>

                    <!-- Sort Button -->
                    <UButton
                      class="join-item"
                      color="primary"
                      :is-loading
                      @click="toggleSortOrder()"
                    >
                      <template #leading>
                        <Transition name="fade" mode="out-in">
                          <UIcon
                            :name="
                              sortAscending
                                ? 'lucide:arrow-up-a-z'
                                : 'lucide:arrow-down-z-a'
                            "
                          />
                        </Transition>
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
                      <span class="hidden sm:inline">Refresh</span>
                    </UButton>
                  </UFieldGroup>
                </div>
                <!-- Search Input for Desktop -->
              </div>
              <div class="space-y-4 md:space-y-2">
                <GuildCards
                  :error
                  :guilds
                  :filter-guilds="filteredGuilds"
                  :undo-search
                  :search-query
                  :loading="isLoading"
                  :container-height="600"
                  :item-height="280"
                  :view-mode
                />
              </div>
            </div>
            <div v-if="item.value === 'premium'" class="space-y-6">
              <UCard
                class="border-2 border-primary/30 bg-linear-to-r from-primary/10 via-transparent to-secondary/10 shadow-lg"
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
                <div class="space-y-4 p-6 text-center">
                  <UIcon
                    name="heroicons:sparkles-20-solid"
                    class="mx-auto h-12 w-12 text-primary"
                  />
                  <h3 class="text-2xl font-bold">Upgrade to Premium</h3>
                </div>
                <p class="text-base-content/70">
                  Get access to exclusive features and priority support
                </p>
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
import { useFuse } from "@vueuse/integrations/useFuse";

definePageMeta({ alias: ["/account"], auth: true });

useSeoMetadata({
  title: "Profile",
  description: "Manage your profile, servers and settings",
  shouldSeoImage: true,
});

const { user } = useAuth();
// refs
// Tab Management - inspired by Dyno.gg tab system
const activeTab = ref("servers");
const isDefault = ref(false);
const isAnimated = ref(false);
const isLoading = ref(true);
const evaluating = shallowRef(false);
const searchQuery = ref<null | string>(null);
const viewMode = ref<"grid" | "card">("card");

// toggles
// is true by default because we want to show only manageable servers
const [showManageableOnly, toggleShowManageableOnly] = useToggle(true);
// Sort order: true for ascending, false for descending
const [sortAscending, toggleSortOrder] = useToggle(true);

const { data, status, refresh, error } = useFetch("/api/users", {
  key: "guilds",
  transform: (data) => {
    if (!data) {
      return {
        guilds: [],
        fetchAt: Date.now(),
      };
    }

    const { transformedGuilds } = data;

    return {
      guilds: transformedGuilds ?? [],
      fetchAt: Date.now(),
    };
  },
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
});

const guilds = computed(() => data.value?.guilds ?? []);
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

// Optimized avatar computation
const defaultAvatar = computed(() =>
  user.value?.id
    ? `https://cdn.discordapp.com/embed/avatars/${BigInt(user.value.id) % BigInt(5)}.png`
    : "https://cdn.discordapp.com/embed/avatars/0.png",
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
    value: "premium",
    label: "Premium",
    icon: "heroicons:star",
  },
]);

const src = computed(() => {
  if (isDefault.value) {
    return defaultAvatar.value;
  }
  return createUrl(isAnimated.value ? "gif" : "png", 128);
});

function undoSearch() {
  searchQuery.value = null;
}

function toggleView() {
  viewMode.value = viewMode.value === "grid" ? "card" : "grid";
}

function createUrl(format: "webp" | "png" | "gif", size: number) {
  return `https://cdn.discordapp.com/avatars/${user.value!.id}/${user.value!.avatar}.${format}?size=${size}`;
}

watch(status, (fetchStatus) => {
  if (fetchStatus === "success") {
    evaluating.value = false;
    isLoading.value = false;
  }
});

watch(
  user,
  (user) => {
    if (user) {
      isDefault.value = user.avatar === null;
      isAnimated.value = user.avatar?.startsWith("a_") ?? false;
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.15s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
