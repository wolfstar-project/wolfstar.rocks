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
import type { GuildSettings } from "#shared/types/guildSettings";
import type { ValuesType } from "#shared/types/utils";
import type { NavigationMenuItem } from "@nuxt/ui";
import { Time } from "@sapphire/time-utilities";
import { isNullOrUndefinedOrZero } from "@sapphire/utilities";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { objectToTuples } from "@sapphire/utilities/objectToTuples";

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
  && !isNullOrUndefinedOrZero(Object.keys(guildData.value).length)
  && !isNullOrUndefinedOrZero(Object.keys(guildSettings.value).length));

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
        data: objectToTuples(guildSettingsChanges.value as Partial<GuildSettings>),
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
  catch (error: any) {
    hasError.value = true;
    setTimeout(() => {
      isLoading.value = false;
    }, Time.Second);

    console.error("Error saving guild settings changes", {
      error,
    });

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
    const guildData = await $fetch<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>(`/api/guilds/${guildId.value}`);
    const guildSettings = await $fetch<GuildSettings>(`/api/guilds/${guildId.value}/settings`);

    setGuildData(guildData);
    setGuildSettings(guildSettings);

    hasError.value = false;

    toast.add({
      color: "success",
      icon: "i-heroicons-check-circle",
      title: "Data Loaded",
      description: "Guild data and settings have been successfully loaded.",
    });
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
