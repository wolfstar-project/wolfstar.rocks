<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar :ui="{ right: 'gap-3' }">
        <template #title>
          <div v-if="guildData" class="flex items-center gap-0.5 cursor-pointer">
            <UAvatar
              :src
              :alt="guildData.name"
              class="mr-2"
            />
            <h1 class="text-lg font-semibold">{{ guildData.name }}</h1>
          </div>
        </template>
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              aria-label="Open notifications panel"
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="lucide:bell" class="size-5 shrink-0" aria-hidden="true" />
              </UChip>
            </UButton>
          </UTooltip>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <ClientOnly>
        <component :is="renderComponent" :commands="commands" :languages="languages" />
        <template #fallback>
          <div class="flex h-48 items-center justify-center">
            <UIcon name="heroicons:arrow-path" class="size-8 animate-spin text-primary" />
          </div>
        </template>
      </ClientOnly>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { FilterRoutes, GuildRoutes } from "@/types/GuildRoutes";
import { Time } from "@sapphire/time-utilities";
import { isDevelopment } from "std-env";

definePageMeta({
  layout: "dashboard",
  path: "/guilds/:id/manage/:slug(.*)*",
  auth: {
    required: true,
  },
});

const route = useRoute();
const { isNotificationsSlideoverOpen } = useDashboardLayout();
const loading = useState<boolean>("guild:loading", () => false);
const commands = useState<FlattenedCommand[]>("guild:commands", () => []);
const languages = useState<string[]>("guild:languages", () => []);
const toast = useToast();
const { guildData } = useGuildData();
const { $api } = useNuxtApp();

const slug = route.params.slug as string | string[];

async function fetchCommandsAndLanguages() {
  loading.value = true;

  try {
    const commandsStorage = useLocalStorage<ExpirableLocalStorageStructure<FlattenedCommand[]>>(LocalStorageKeys.Commands, {
      expire: 0,
      data: [],
    });
    if (commandsStorage.value && (isDevelopment || commandsStorage.value.expire > Date.now())) {
      commands.value = commandsStorage.value.data;
    }
    else {
      const commandsData = await $api<FlattenedCommand[]>("/commands");
      commands.value = commandsData;
      commandsStorage.value = {
        expire: Date.now() + Time.Day * 6,
        data: commandsData,
      };
    }

    const languagesStorage = useLocalStorage<ExpirableLocalStorageStructure<string[]>>(LocalStorageKeys.Languages, {
      expire: 0,
      data: [],
    });
    if (languagesStorage.value && (isDevelopment || languagesStorage.value.expire > Date.now())) {
      languages.value = languagesStorage.value.data;
    }
    else {
      const languagesData = await $api<string[]>("/languages");
      languages.value = languagesData;
      languagesStorage.value = {
        expire: Date.now() + Time.Day * 6,
        data: languagesData,
      };
    }
  }
  catch (error: any) {
    toast.add({
      icon: "heroicons:exclamation-triangle",
      closeIcon: "heroicons:x-mark",
      title: "Failed to load data",
      description: error?.message || "Unable to fetch commands and languages",
      color: "error",
      duration: 3000,
    });
    logger.error("Error fetching commands and languages:", error);
  }
  finally {
    loading.value = false;
  }
}

const joinedPath = computed(() => Array.isArray(slug) ? slug.join("/") : (slug || ""));

const renderComponent = computed(() => {
  switch (joinedPath.value as GuildRoutes & FilterRoutes) {
    case "channels":
      return defineAsyncComponent(() => import("~/components/guild/settings/Channels.vue"));
    case "commands":
      return defineAsyncComponent(() => import("~/components/guild/settings/DisabledCommands.vue"));
    case "roles":
      return defineAsyncComponent(() => import("~/components/guild/settings/Roles.vue"));
    default:
      return defineAsyncComponent(() => import("~/components/guild/settings/General.vue"));
  }
});

const src = computed(() =>
  guildIconURL(guildData as unknown as OauthFlattenedGuild, {
    size: 64,
  })!);

onMounted(fetchCommandsAndLanguages);
</script>
