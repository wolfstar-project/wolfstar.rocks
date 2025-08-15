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
              <div class="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 class="text-2xl font-bold text-base-content">Servers</h2>
                  <p class="mt-1 text-base-content/60">
                    <span v-if="!guilds || status === 'pending'" class="inline-block h-5 w-48 animate-pulse rounded bg-base-300"></span>
                    <span v-else>Servers you're in ({{ guilds?.length ?? 0 }} servers)</span>
                  </p>
                </div>
                <div class="space-y-4">
                  <guild-cards
                    :error="error"
                    :guilds="guilds"
                    :refresh-guilds="refreshGuilds"
                    :loading="status === 'pending'"
                    :container-height="600"
                    :item-height="280"
                  />
                </div>
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
                  <ShadButtonGroup class="flex justify-center space-x-4 pt-4">
                    <ShadButton color="primary" size="sm">Get Premium</ShadButton>
                    <ShadButton variant="outline" size="sm">Learn More</ShadButton>
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

const {
  data: guilds,
  status,
  refresh: refreshGuilds,
  error,
} = useFetch("/api/users", {
  key: "guilds",
  transform: data => data ? data.transformedGuilds ?? null : null,
  getCachedData: (key, nuxtApp, _ctx) => {
    const now = Date.now();
    if (now - lastFetchTime.value > 5 * 60 * 1000) {
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
  refreshGuilds().then(() => {
    lastFetchTime.value = Date.now();
  });
}

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
