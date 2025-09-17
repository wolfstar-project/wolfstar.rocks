<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      collapsible
      resizable
      :ui="{ footer: 'border-t border-base-300' }"
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
  </UDashboardGroup>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import type { GuildData } from "~~/server/database";
import type { ValuesType } from "~/types/utils";
import { isNullOrUndefined } from "@sapphire/utilities";

const guildId = useRouteParams("id", null, { transform: String });
const loading = useState("loading", () => false);
const guildData = useGuildData();
const guildStore = useGuildStore();
const toast = useToast();
const hasError = ref(false);
const open = ref(false);

const items = computed<NavigationMenuItem[][]>(() => [[{
  label: "Home",
  icon: "heroicons:home",
  to: `/guilds/${guildId.value}/manage`,
  exact: true,
  onSelect: () => {
    open.value = false;
  },

}, {
  label: "Moderation",
  icon: "lucide:shield",
  to: `/guilds/${guildId.value}/manage/moderation`,
  onSelect: () => {
    open.value = false;
  },
}, {
  label: "Channels",
  icon: "heroicons:hashtag",
  to: `/guilds/${guildId.value}/manage/channels`,
  onSelect: () => {
    open.value = false;
  },
}, {
  value: "roles",
  label: "Roles",
  icon: "heroicons:user-group",
  to: `/guilds/${guildId.value}/manage/roles`,
  onSelect: () => {
    open.value = false;
  },
}, {
  value: "events",
  label: "Events",
  icon: "heroicons:bell",
  to: `/guilds/${guildId.value}/manage/events`,
  onSelect: () => {
    open.value = false;
  },
}, {
  value: "disabled-commands",
  label: "Commands",
  icon: "heroicons:command-line",
  to: `/guilds/${guildId.value}/manage/commands`,
  onSelect: () => {
    open.value = false;
  },
}, {
  label: "Moderation",
  value: "moderation",
  icon: "lucide:shield",
  to: `/guilds/${guildId.value}/manage/moderation`,
  onSelect: () => {
    open.value = false;
  },
}, {
  label: "Settings",
  value: "settings",
  icon: "heroicons:settings",
  to: `/guilds/${guildId.value}/manage/settings`,
  onSelect: () => {
    open.value = false;
  },
}]]);

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

// Validate Guild ID format (Discord Snowflake: 17-19 digit string)
function isValidGuildId(id: string | undefined | null): boolean {
  if (isNullOrUndefined(id))
    return false;
  const snowflakeRegex = /^\d{17,19}$/;
  return snowflakeRegex.test(id);
}
const _submitChanges = async () => {
  const { error } = await useFetch(`/api/guilds/${guildId.value}/settings`, {
    method: "PATCH",
    body: {
      data: guildSettingsChanges.value,
    },
  });

  if (error.value) {
    hasError.value = true;
    toast.add({
      title: "Error",
      description: "Failed to save changes",
    });
  }

  const { data: settingsData } = useFetch<GuildData>(`/api/guilds/${guildId.value}/settings`, {
    method: "GET",
  });

  if (settingsData.value) {
    guildStore.setSettings(settingsData.value);
    guildStore.resetAllChanges();
    toast.add({
      title: "Success",
      description: "Changes saved successfully",
    });
  }
};

const { hasChanges: _, mergedSettings: guildSettingsChanges } = storeToRefs(guildStore);

onMounted(async () => {
  loading.value = true;
  try {
    const { data } = useFetch<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>(`/api/guilds/${guildId}`, {
      lazy: true,
    });
    if (data.value)
      guildData.value = data.value;
    /* const { data: settingsResponse } = useFetch<GuildData>(`/api/guilds/${guildId}/settings`),

    if (settingsResponse.value) {
      guildStore.setSettings(settingsResponse.value);
    } */
  }
  catch {
    hasError.value = true;
  }
  finally {
    loading.value = false;
  }
});

const _readyToRender = computed(() => {
  return !loading.value && guildData.value && guildStore.settings;
});
</script>
