<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      collapsible
      resizable
      :ui="{ footer: 'border-t border-base-100' }"
    >
      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="items[0]"
          orientation="vertical"
          tooltip
          popover
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="items[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <slot v-if="isReadyToRender"></slot>
    <div
      v-else
      class="flex min-h-screen w-full flex-col items-center justify-center space-y-4 px-4"
      role="status"
      aria-label="Loading dashboard"
    >
      <div class="flex flex-col items-center space-y-4">
        <UIcon name="ph:warning-duotone" class="size-12 text-primary" aria-hidden="true" />
        <div class="space-y-2 text-center">
          <h2 class="text-xl font-semibold text-base-content">Loading Dashboard</h2>
          <p class="text-sm text-base-content/60">Fetching guild settings...</p>
        </div>
        <div class="flex items-center space-x-2">
          <div
            v-motion
            :initial="{ scale: 0.8, opacity: 0.5 }"
            :enter="{ scale: 1, opacity: 1, transition: { repeat: Infinity, repeatType: 'reverse', duration: 600 } }"
            class="h-2 w-2 rounded-full bg-primary"
          ></div>
          <div
            v-motion
            :initial="{ scale: 0.8, opacity: 0.5 }"
            :enter="{ scale: 1, opacity: 1, transition: { repeat: Infinity, repeatType: 'reverse', duration: 600, delay: 200 } }"
            class="h-2 w-2 rounded-full bg-primary"
          ></div>
          <div
            v-motion
            :initial="{ scale: 0.8, opacity: 0.5 }"
            :enter="{ scale: 1, opacity: 1, transition: { repeat: Infinity, repeatType: 'reverse', duration: 600, delay: 400 } }"
            class="h-2 w-2 rounded-full bg-primary"
          ></div>
        </div>
      </div>
    </div>
    <div v-if="isReadyToSubmit" class="fixed right-4 bottom-4 z-50 flex flex-col space-y-2">
      <UFieldGroup>
        <UButton
          color="primary"
          icon="heroicons:check"

          @click="submitChanges"
        >
          Save Changes
        </UButton>

        <UButton
          color="error"
          icon="heroicons:arrow-path"

          @click="resetChanges"
        >
          Reset Changes
        </UButton>
      </UFieldGroup>
    </div>
  </UDashboardGroup>
</template>

<script setup lang="ts">
import type { ValuesType } from "#shared/types/utils";
import type { NavigationMenuItem } from "@nuxt/ui";
import type { GuildData } from "~~/server/database";
import { Time } from "@sapphire/time-utilities";
import { cast, isNullOrUndefinedOrZero, objectValues } from "@sapphire/utilities";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { objectToTuples } from "@sapphire/utilities/objectToTuples";
import { promiseTimeout } from "@vueuse/core";

const guildId = useRouteParams("id", null, { transform: String });

// Validate guild ID first
if (!isValidGuildId(guildId.value)) {
  throw createError({
    statusCode: 400,
    statusMessage: "Invalid Guild ID",
    message: "The provided guild ID is not valid. Guild IDs must be 17-19 digit numbers.",
    data: {
      field: "guildId",
    },
  });
}

const toast = useToast();
const open = ref(false);
const { setGuildData, guildData } = useGuildData();
const { setGuildSettings, guildSettings } = useGuildSettings();
const { setGuildSettingsChanges, guildSettingsChanges } = useGuildSettingsChanges();
const hasError = useState<boolean>("dashboard:hasError", () => false);
const isLoading = useState<boolean>("dashboard:loading", () => true);

const items = computed<NavigationMenuItem[][]>(() => [[
  {
    label: "Home",
    icon: "heroicons:home",
    to: `/guilds/${guildId.value}/manage`,
    exact: true,
    onSelect: () => {
      open.value = false;
    },

  },
  {
    label: "Moderation",
    icon: "lucide:shield",
    to: `/guilds/${guildId.value}/manage/moderation`,
    onSelect: () => {
      open.value = false;
    },
  },
  {
    label: "Channels",
    icon: "heroicons:hashtag",
    to: `/guilds/${guildId.value}/manage/channels`,
    onSelect: () => {
      open.value = false;
    },
  },
  {
    value: "roles",
    label: "Roles",
    icon: "heroicons:user-group",
    to: `/guilds/${guildId.value}/manage/roles`,
    onSelect: () => {
      open.value = false;
    },
  },
  {
    value: "events",
    label: "Events",
    icon: "heroicons:bell",
    to: `/guilds/${guildId.value}/manage/events`,
    onSelect: () => {
      open.value = false;
    },
  },
  {
    value: "disabled-commands",
    label: "Commands",
    icon: "heroicons:command-line",
    to: `/guilds/${guildId.value}/manage/commands`,
    onSelect: () => {
      open.value = false;
    },
  },
]]);

const isReadyToRender = computed(() =>
  !isLoading.value
  && !isNullOrUndefined(guildData.value)
  && !isNullOrUndefined(guildSettings.value)
  && !isNullOrUndefinedOrZero(objectValues(guildData.value).length)
  && !isNullOrUndefinedOrZero(objectValues(guildSettings.value).length));

const isReadyToSubmit = computed(() => !isNullOrUndefined(guildSettingsChanges.value)
  && objectValues(guildSettingsChanges.value).length > 0);

// Validate Guild ID format (Discord Snowflake: 17-19 digit string)
function isValidGuildId(id: string | undefined | null): boolean {
  if (isNullOrUndefined(id))
    return false;
  const snowflakeRegex = /^\d{17,19}$/;
  return snowflakeRegex.test(id);
}

async function submitChanges() {
  const { data, error } = await useFetch(`/api/guilds/${guildId.value}/settings`, {
    method: "PATCH",
    body: JSON.stringify({
      data: objectToTuples(guildSettingsChanges.value as Partial<GuildData>),
    }),
  });

  if (error.value) {
    hasError.value = true;
    await promiseTimeout(Time.Second);
    isLoading.value = false;

    logger.error("Error saving guild settings changes for guild Id:", error.value);

    toast.add({
      color: "error",
      icon: "i-heroicons-x-circle",
      title: "Error",
      description: "An error occurred while saving changes. Please try again later.",
    });
  }

  const dataParsed = cast<GuildData>(JSON.parse(data.value ?? "{}"));

  if (!isNullOrUndefined(data.value) || (!isNullOrUndefined(data.value) && !Array.isArray(data.value)) || (!isNullOrUndefined(dataParsed) && objectValues(dataParsed).length !== 0)) {
    setGuildSettings(dataParsed);
    setGuildSettingsChanges(undefined);

    logger.info(`Guild settings changes saved successfully for guild Id: ${guildId.value}`);

    toast.add({
      color: "success",
      icon: "i-heroicons-check-circle",
      title: "Success",
      description: "Guild settings have been successfully updated.",
    });
  }
}

function resetChanges() {
  setGuildSettingsChanges(undefined);
  toast.add({
    icon: "heroicons:arrow-path",
    title: "Reset",
    color: "info",
    description: "All changes have been reset",
  });
}

onMounted(async () => {
  isLoading.value = true;

  try {
    // Fetch guild data first
    const guildData = await $fetch<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>(`/api/guilds/${guildId.value}`);
    const guildSettings = await $fetch<string>(`/api/guilds/${guildId.value}/settings`);

    setGuildData(guildData);
    setGuildSettings(JSON.parse(guildSettings));

    hasError.value = false;
  }
  catch (error: any) {
    hasError.value = true;

    toast.add({
      color: "error",
      icon: "i-heroicons-x-circle",
      title: "Error Loading Data",
      description: error?.message || "An error occurred while fetching the guild data or settings. Please try again later.",
    });
  }
  finally {
    isLoading.value = false;
  }
});
</script>
