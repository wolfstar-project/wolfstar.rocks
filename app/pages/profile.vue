<!-- eslint-disable vue/valid-v-else-if -->
<template>
  <Head>
    <Title>Profile</Title>
    <Meta name="description" content="Manage your profile and servers" />
  </Head>

  <div class="container mx-auto max-w-7xl space-y-8 px-4 py-8">
    <section class="flex flex-col items-center justify-center space-y-6 rounded-xl bg-base-50 p-12 shadow-lg">
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
          class="rounded-full ring-2 ring-base-200 ring-offset-4 ring-offset-base-100 transition-all duration-300"
        />
        <div class="space-y-2 text-center">
          <h1 class="text-4xl font-bold text-base-content">{{ user.globalName ?? user.username }}</h1>
          <p class="text-lg font-medium text-base-content/80">@{{ user.username }}</p>
          <p class="text-sm text-base-content/60">User ID: {{ user.id }}</p>
        </div>
      </template>
    </section>

    <section class="overflow-hidden rounded-xl bg-base-50 shadow-lg">
      <UTabs v-model="activeTab" variant="transparent" :unmount-on-hide="false" :items class="w-full flex flex-col items-center">
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
                  <ShadFieldGroup class="flex items-start gap-2">
                    <UInput
                      ref="input"
                      v-model="searchQuery"
                      name="search"
                      type="text"
                      placeholder="Search servers.."
                      :disabled="loading"
                      icon="heroicons:magnifying-glass-circle"
                      :loading
                      loading-icon="lucide:loader"
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
                  </ShadFieldGroup>
                  <!-- Actual Buttons -->
                  <ShadFieldGroup size="sm" class="flex items-end join gap-2">
                    <!-- View Button -->

                    <UButton
                      class="join-item hidden sm:inline-flex"
                      color="secondary"
                      loading-icon="lucide:loader"
                      :loading
                      @click="toggleView()"
                    >
                      <template #leading>
                        <Transition name="fade" mode="in-out">
                          <ShadIcon :name="viewMode === 'grid' ? 'heroicons:squares-2x2' : 'heroicons:bars-3'" />
                        </Transition>
                      </template>

                      <span class="hidden sm:inline">View</span>
                    </UButton>

                    <!-- Manageable Only Toggle Button -->
                    <UButton
                      class="join-item"
                      color="secondary"
                      :loading
                      loading-icon="lucide:loader"
                      icon="heroicons:shield-check"
                      @click="toggleShowManageableOnly()"
                    >
                      <span class="hidden sm:inline">Manageable</span>
                    </UButton>

                    <!-- Sort Button -->
                    <UButton
                      class="join-item"
                      color="secondary"
                      :loading
                      @click="toggleSortOrder()"
                    >
                      <template #leading>
                        <Transition name="fade" mode="out-in">
                          <ShadIcon :name="sortAscending ? 'lucide:arrow-up-a-z' : 'lucide:arrow-down-z-a'" />
                        </Transition>
                      </template>
                    </UButton>

                    <!-- Refresh Button -->
                    <UButton
                      v-if="filteredGuilds.length < 0"
                      color="secondary"
                      class="join-item"
                      :loading
                      loading-icon="lucide:loader"
                      icon="heroicons:arrow-path-20-solid"
                      @click="refresh()"
                    >
                      <span class="hidden sm:inline">Refresh</span>
                    </UButton>
                  </ShadFieldGroup>
                </div>
                <!-- Search Input for Desktop -->
              </div>
              <div class="space-y-4 md:space-y-2">
                <guild-cards
                  :error
                  :guilds
                  :filter-guilds="filteredGuilds"
                  :undo-search
                  :search-query
                  :loading
                  :container-height="600"
                  :item-height="280"
                  :view-mode
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
                      <UButton variant="soft" color="primary" size="sm">Manage</UButton>
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
                  <ShadFieldGroup class="flex w-full justify-center space-x-4 pt-4 z-10">
                    <UButton color="primary" size="md">Get Premium</UButton>
                    <UButton color="primary" variant="outline" size="md">Learn More</UButton>
                  </ShadFieldGroup>
                </template>
              </ShadCard>
            </div>
          </div>
        </template>
      </UTabs>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";
import { useFuse } from "@vueuse/integrations/useFuse";

definePageMeta({ alias: ["/account"], auth: true });

const { user, ready } = useAuth();
const { isMobile } = useBreakpoint();

// refs
// Tab Management - inspired by Dyno.gg tab system
const activeTab = ref("servers");
const isAnimated = ref(false);
const isDefault = ref(false);
const loading = ref(true);
const evaluating = shallowRef(false);
const searchQuery = ref<null | string>(null);
const viewMode = ref<"grid" | "card">("card");

// toggles
// is true by default because we want to show only manageable servers
const [showManageableOnly, toggleShowManageableOnly] = useToggle(true);
// Sort order: true for ascending, false for descending
const [sortAscending, toggleSortOrder] = useToggle(true);

if (isMobile) {
  viewMode.value = "grid";
}

const {
  data,
  status,
  refresh,
  error,
} = useFetch("/api/users", {
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
    const data = nuxtApp.isHydrating ? nuxtApp.payload.data[key] : nuxtApp.static.data[key];
    if (!data) {
      return;
    }

    const experationDate = new Date(data.fetchAt);
    experationDate.setMinutes(experationDate.getMinutes() + minutes(10));
    const isExpired = experationDate.getTime() < Date.now();
    if (isExpired) {
      return;
    }
    return data;
  },
});

const guilds = computed(() => data.value?.guilds ?? []);
// Optimized filtered guilds with memoization
const filteredGuilds = computedAsync(() => {
  let filtered = [...guilds.value];
  evaluating.value = true;
  // Apply manageable filter
  if (showManageableOnly.value) {
    filtered = filtered.filter(guild => guild.manageable);
  }
  // Apply search filter
  if (searchQuery.value !== null && searchQuery.value?.trim()) {
    const { results } = useFuse(searchQuery as Ref<string>, filtered, {
      fuseOptions: {
        keys: ["name", "id"],
        threshold: 0.3,
      },
    });
    filtered = results.value.map(result => result.item);
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
}, [], { lazy: true, evaluating });

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
    badge: loading.value ? undefined : { label: guilds.value?.length ?? "N/A", color: "primary" },
    kbds: ["1"],
  },
  {
    value: "premium",
    label: "Premium",
    icon: "heroicons:star",
    kbds: ["2"],
  },
  {
    value: "settings",
    label: "Settings",
    icon: "heroicons:cog-6-tooth",
    kbds: ["3"],
  },
]);

function undoSearch() {
  searchQuery.value = null;
}

function toggleView() {
  viewMode.value = viewMode.value === "grid" ? "card" : "grid";
}

function createUrl(format: "webp" | "png" | "gif", size: number) {
  return `https://cdn.discordapp.com/avatars/${user.value!.id}/${user.value!.avatar}.${format}?size=${size}`;
}

onMounted(() => {
  if (ready.value && status.value !== "pending") {
    loading.value = false;
    evaluating.value = false;
  }
});

watch(
  user,
  (user) => {
    if (user) {
      isAnimated.value = user.avatar ? user.avatar.startsWith("a_") : false;
      isDefault.value = user.avatar === null;
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
