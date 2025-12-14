<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar :ui="{ right: 'gap-3' }">
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
      <div v-if="loading" class="flex h-48 items-center justify-center">
        <UIcon name="heroicons:arrow-path" class="size-8 animate-spin text-primary" />
      </div>
      <component :is="renderComponent" v-else :commands="commands" :languages="languages" />
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { Time } from "@sapphire/time-utilities";

definePageMeta({
  layout: "dashboard",
  path: "/guilds/:id/manage/:slug(.*)*",
});

const route = useRoute();
// Use composables and stores
const { isNotificationsSlideoverOpen } = useDashboardLayout();
const loading = useState<boolean>("guildGeneral:loading", () => false);
const commands = useState<FlattenedCommand[]>("guildCommands", () => []);
const languages = useState<string[]>("guildLanguages", () => []);
const { $api } = useNuxtApp();

const slug = route.params.slug as string | string[];
const joinedPath = Array.isArray(slug) ? slug.join("/") : (slug || "");

const renderComponent = computed(() => {
  switch (joinedPath) {
    case "commands":
      return defineAsyncComponent(() => import("~/components/guild/settings/DisabledCommands.vue"));
    default:
      return defineAsyncComponent(() => import("~/components/guild/settings/General.vue"));
  }
});

async function fetchCommandsAndLanguages() {
  loading.value = true;

  const commandsStorage = useSessionStorage<ExpirableLocalStorageStructure<FlattenedCommand[]>>(LocalStorageKeys.Commands, {
    expire: 0,
    data: [],
  });
  if (commandsStorage.value && (import.meta.env.DEV || commandsStorage.value.expire > Date.now())) {
    commands.value = commandsStorage.value.data;
  }
  else {
    const commandsData = await $api<FlattenedCommand[]>("/commands");
    logger.info("Fetched commands data:", commandsData);
    commands.value = commandsData;
    commandsStorage.value = {
      expire: Date.now() + Time.Day * 6,
      data: commandsData!,
    };
  }

  const languagesStorage = useSessionStorage<ExpirableLocalStorageStructure<string[]>>(LocalStorageKeys.Languages, {
    expire: 0,
    data: [],
  });
  if (languagesStorage.value && (import.meta.env.DEV || languagesStorage.value.expire > Date.now())) {
    languages.value = languagesStorage.value.data;
  }
  else {
    const languagesData = await $api<string[]>("/languages");
    logger.info("Fetched languages data:", languagesData);
    languages.value = languagesData;
    languagesStorage.value = {
      expire: Date.now() + Time.Day * 6,
      data: languagesData,
    };
  }

  loading.value = false;
}
onMounted(fetchCommandsAndLanguages);
</script>
