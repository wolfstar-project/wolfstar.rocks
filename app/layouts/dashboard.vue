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
    <slot></slot>
    <div v-if="isReadyToRender" class="fixed right-4 bottom-4 z-50 flex flex-col space-y-2">
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
    </div>
  </UDashboardGroup>
</template>

<script setup lang="ts">
import type { ValuesType } from "#shared/types/utils";
import type { NavigationMenuItem } from "@nuxt/ui";
import type { GuildSettings } from "~~/shared/types/guildSettings";
import { Time } from "@sapphire/time-utilities";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { objectToTuples } from "@sapphire/utilities/objectToTuples";
import { useGuildSettings } from "~/composables/useGuildSettings";
import { useGuildSettingsChanges } from "~/composables/useGuildSettingsChanges";

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
const isLoading = ref(true);
const { $api } = useNuxtApp();

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
  && guildData.value !== undefined
  && guildSettings.value !== undefined
  && Object.keys(guildData.value).length !== 0
  && Object.keys(guildSettings.value).length !== 0);

// Validate Guild ID format (Discord Snowflake: 17-19 digit string)
function isValidGuildId(id: string | undefined | null): boolean {
  if (isNullOrUndefined(id))
    return false;
  const snowflakeRegex = /^\d{17,19}$/;
  return snowflakeRegex.test(id);
}

async function submitChanges() {
  try {
    const response = await $fetch<GuildSettings | [string] | { error: string }>(`/api/guilds/${guildId.value}/settings`, {
      method: "PATCH",
      body: JSON.stringify({
        guild_id: guildId.value,
        data: objectToTuples(guildSettingsChanges),
      }),
    });

    if (!response || Array.isArray(response) || "error" in response || Object.keys(response).length === 0) {
      toast.add({
        color: "error",
        icon: "i-heroicons-x-circle",
        title: "Error",
        description: "Failed to save changes. Please try again later.",
      });
      hasError.value = true;
      setTimeout(() => {
        isLoading.value = false;
      }, Time.Second);
    }
    else {
      setGuildSettings(response as GuildSettings);
      setGuildSettingsChanges(undefined);
      toast.add({
        color: "success",
        icon: "i-heroicons-check-circle",
        title: "Success",
        description: "Guild settings have been successfully updated.",
      });
    }
  }
  catch {
    hasError.value = true;
    setTimeout(() => {
      isLoading.value = false;
    }, Time.Second);

    toast.add({
      color: "error",
      icon: "i-heroicons-x-circle",
      title: "Error",
      description: "An error occurred while saving changes. Please try again later.",
    });
  }
}

function resetChanges() {
  setGuildSettingsChanges(undefined);
  toast.add({
    icon: "i-heroicons-arrow-path",
    title: "Reset",
    color: "info",
    description: "All changes have been reset",
  });
}

onMounted(async () => {
  isLoading.value = true;

  try {
    // Fetch guild data first
    const [guildData, guildSettings] = await Promise.all([
      $fetch<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>(`/api/guilds/${guildId.value}`),
      $api<GuildSettings>(`/guilds/${guildId.value}/settings`),
    ]);

    setGuildData(guildData);
    setGuildSettings(guildSettings);
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to load guild data or settings",
      message: "An error occurred while fetching the guild data or settings. Please try again later.",
      cause: error,
    });
  }
  finally {
    isLoading.value = false;
  }
});
</script>
