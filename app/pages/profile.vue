<!-- eslint-disable vue/valid-v-else-if -->
<template>
  <Head>
    <Title>Profile</Title>
    <Meta name="description" content="Manage your profile and servers" />
  </Head>

  <div class="container mx-auto max-w-7xl space-y-8 px-4 py-8">
    <section class="flex flex-col items-center justify-center space-y-6 rounded-xl bg-base-200 p-12 shadow-lg">
      <div v-if="!user || loading" class="flex flex-col items-center justify-center space-y-6">
        <div class="h-24 w-24 animate-pulse rounded-full bg-base-300"></div>
        <div class="space-y-2 text-center">
          <div class="h-8 w-48 animate-pulse rounded bg-base-300"></div>
          <div class="h-6 w-32 animate-pulse rounded bg-base-300"></div>
          <div class="h-4 w-56 animate-pulse rounded bg-base-300"></div>
        </div>
      </div>
      <template v-else>
        <ShadAvatar
          :src="isAnimated ? createUrl('gif', 128) : createUrl('png', 128)"
          :alt="isDefault ? 'Default Avatar' : 'Avatar'"
          :fallback="defaultAvatar"
          size="xl"
          class="rounded-full ring-4 ring-primary ring-offset-4 ring-offset-base-100 transition-all duration-300 hover:ring-primary/70"
        />
        <div class="space-y-2 text-center">
          <h1 class="text-4xl font-bold text-base-content">{{ user.name }}</h1>
          <p class="text-lg font-medium text-base-content/80">@{{ user.username }}</p>
          <p class="text-sm text-base-content/60">User ID: {{ user.id }}</p>
        </div>
      </template>
    </section>

    <section class="overflow-hidden rounded-xl bg-base-200 shadow-lg">
      <ShadTabs v-model="activeTab" color="primary" :items="items" class="w-full flex flex-col items-center">
        <template #content="{ item }">
          <div class="p-8">
            <div v-if="item.value === 'servers'" class="space-y-6">
              <!-- Server Section Header -->
              <div class="mb-4">
                <h2 class="text-2xl font-bold text-base-content">Servers</h2>
                <p class="mt-1 text-base-content/60">
                  <span v-if="status === 'pending'" class="inline-block h-5 w-48 animate-pulse rounded bg-base-300"></span>
                  <span v-else>Servers you're in ({{ guilds?.length ?? 0 }} servers)</span>
                </p>
              </div>

              <!-- Search and Controls Section -->
              <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div class="flex items-end gap-2">
                  <ShadInput
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search servers..."
                    :disabled="loading"
                    icon="heroicons:magnifying-glass-circle"
                    :loading="loading"
                    loading-icon="i-lucide-loader"
                    class="max-w-xs"
                  >
                    <template #trailing>
                      <ShadKbd
                        value="k"
                        class="absolute top-1/2 right-2 -translate-y-1/2"
                      />
                    </template>
                  </ShadInput>
                  <!-- Skeletons -->
                  <div v-if="loading" class="flex items-center gap-2">
                    <div class="skeleton h-9 w-24 rounded-md"></div>
                    <div class="skeleton h-9 w-20 rounded-md"></div>
                    <div class="skeleton h-9 w-24 rounded-md"></div>
                    <div class="skeleton h-9 w-20 rounded-md"></div>
                  </div>
                  <!-- Actual Buttons -->
                  <div v-else class="flex items-center justify-end gap-2">
                    <!-- View Button -->
                    <ShadButton
                      size="sm"
                      active-class="btn-active"
                      :icon="viewMode === 'grid' ? 'heroicons:squares-2x2' : 'heroicons:bars-3'"
                      @click="toggleView()"
                    >
                      <span class="hidden sm:inline">View</span>
                    </ShadButton>

                    <!-- Manageable Only Toggle Button -->
                    <ShadButton
                      size="sm"
                      active-class="btn-active"
                      icon="heroicons:shield-check"
                      @click="showManageableOnly = !showManageableOnly"
                    >
                      <span class="hidden sm:inline">Manageable</span>
                    </ShadButton>

                    <!-- Sort Button -->
                    <ShadButton
                      size="sm"
                      class="join-item btn-active"
                      @click="toggleSortOrder"
                    >
                      <template #leading>
                        <ShadIcon :name="sortAscending ? 'heroicons:arrow-up' : 'heroicons:arrow-down'" class="h-4 w-4" />
                      </template>
                      <span class="hidden sm:inline">{{ sortAscending ? 'A-Z' : 'Z-A' }}</span>
                    </ShadButton>

                    <!-- Refresh Button -->
                    <ShadButton
                      v-if="filteredGuilds.length > 0"
                      size="sm"
                      icon="heroicons:arrow-path"
                      @click="refresh()"
                    >
                      <span class="hidden sm:inline">Refresh</span>
                    </ShadButton>
                  </div>
                </div>

                <!-- Search Input for Desktop -->
              </div>
              <div class="space-y-4">
                <guild-cards
                  :error="error"
                  :guilds="guilds"
                  :filter-guilds="filteredGuilds"
                  :undo-search="undoSearch"
                  :search-query="searchQuery"
                  :loading="status === 'pending'"
                  :container-height="600"
                  :item-height="280"
                  :type="viewMode === 'grid' ? 'card' : 'list'"
                />
              </div>
            </div>
            <div v-if="item.value === 'settings'" class="space-y-6">
              <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                <ShadCard class="shadow-md">
                  <template #title>
                    <div>
                      <h2 class="text-2xl font-bold text-base-content">Settings</h2>
                      <p class="mt-1 text-base-content/60">Manage your account preferences</p>
                    </div>
                  </template>
                  <template #header>
                    <h3 class="text-lg font-semibold">Notification Settings</h3>
                  </template>
                  <p class="text-base-content/60">Control how you receive updates</p>
                  <template #footer>
                    <div class="flex justify-end">
                      <ShadButton variant="soft" color="primary" size="sm">Manage</ShadButton>
                    </div>
                  </template>
                </ShadCard>
              </div>
            </div>
            <div v-if="item.value === 'premium'" class="space-y-6">
              <ShadCard class="border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10 shadow-lg">
                <template #title>
                  <div>
                    <h2 class="text-2xl font-bold text-base-content">Premium</h2>
                    <p class="mt-1 text-base-content/60">Unlock advanced features and support the project</p>
                  </div>
                </template>
                <template #header>
                  <div class="space-y-4 p-6 text-center">
                    <ShadIcon name="heroicons:sparkles-20-solid" class="mx-auto h-12 w-12 text-primary" />
                    <h3 class="text-2xl font-bold">Upgrade to Premium</h3>
                  </div>
                </template>

                <p class="text-base-content/70">Get access to exclusive features and priority support</p>
                <template #footer>
                  <ShadButtonGroup class="flex w-full justify-center space-x-4 pt-4 z-10">
                    <ShadButton color="primary" size="md">Get Premium</ShadButton>
                    <ShadButton variant="outline" size="md">Learn More</ShadButton>
                  </ShadButtonGroup>
                </template>
              </ShadCard>
            </div>
          </div>
        </template>
      </ShadTabs>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { TabsItem } from "@/components/ui/tabs";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { captureException } from "@sentry/vue";
import { promiseTimeout } from "@vueuse/core";

definePageMeta({ alias: ["/account"], auth: true });

const { user, ready } = useAuth();
const lastFetchTime = useState("profile-guilds-last-fetch", () => 0);
// Tab Management - inspired by Dyno.gg tab system
const activeTab = ref("servers");
const isAnimated = ref(false);
const isDefault = ref(false);
const loading = ref(true);
const searchQuery = ref("");
const viewMode = ref("grid");
// is true by default because we want to show only manageable servers
const showManageableOnly = ref(true);
const sortAscending = ref(true);
const { history: _searchHistory, undo: undoSearch, redo: _redoSearch, canUndo: _canUndo, canRedo: _canRedo } = useRefHistory(searchQuery, {
  deep: false,
  capacity: 10, // Keep last 10 search terms
});

const {
  data: guilds,
  status,
  refresh,
  error,
} = useFetch("/api/users", {
  key: "guilds",
  transform: data => data ? data.transformedGuilds ?? null : null,
  getCachedData: (key, nuxtApp, _ctx) => {
    const now = Date.now();
    if (now - lastFetchTime.value > minutes(5)) {
      return undefined;
    }
    return nuxtApp.isHydrating ? nuxtApp.payload.data[key] : nuxtApp.static.data[key];
  },
});

const items = [
  {
    value: "servers",
    label: "Servers",
    icon: "heroicons:server",
    badge: guilds?.value?.length || 0,
  },
  {
    value: "premium",
    label: "Premium",
    icon: "heroicons:star",
  },
  {
    value: "settings",
    label: "Settings",
    icon: "heroicons:cog-6-tooth",
  },
] satisfies TabsItem[];

if (error.value)
  captureException(error.value);

function fetchGuildsIfNeeded() {
  refresh().then(() => {
    lastFetchTime.value = Date.now();
  });
}

function toggleView() {
  viewMode.value = viewMode.value === "grid" ? "list" : "grid";
}

function toggleSortOrder() {
  sortAscending.value = !sortAscending.value;
}

// Computed filtered guilds
const filteredGuilds = computed(() => {
  if (isNullOrUndefined(guilds.value))
    return [];

  let filtered = [...guilds.value];

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
    const comparison = guildA.name.localeCompare(guildB.name, "en", { sensitivity: "base" });
    return sortAscending.value ? comparison : -comparison;
  });
});

onMounted(() => {
  if (ready.value) {
    promiseTimeout(seconds(5)).then(() => {
      loading.value = false;
    });
  }
});

const defaultAvatar = computed(() =>
  user.value?.id
    ? `https://cdn.discordapp.com/embed/avatars/${BigInt(user.value.id) % BigInt(5)}.png`
    : "https://cdn.discordapp.com/embed/avatars/0.png",
);

watch(
  user,
  (user) => {
    lastFetchTime.value = 0;
    if (activeTab.value === "servers") {
      fetchGuildsIfNeeded();
    };
    if (user?.avatar) {
      isDefault.value = false;
      isAnimated.value = user.avatar.startsWith("a_");
    }
    else {
      isDefault.value = true;
      isAnimated.value = false;
    }
  },
  { immediate: true },
);

function createUrl(format: "webp" | "png" | "gif", size: number) {
  return `https://cdn.discordapp.com/avatars/${user.value!.id}/${user.value!.avatar}.${format}?size=${size}`;
}
</script>
