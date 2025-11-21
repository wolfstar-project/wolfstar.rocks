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
    <slot v-if="readyToRender"></slot>
    <div v-if="error" class="fixed top-4 left-4 z-50">
      <UAlert
        color="error"
        :title="error.message"
      />
    </div>

    <div v-if="hasChanges" class="fixed right-4 bottom-4 z-50 flex flex-col space-y-2">
      <UButton
        color="primary"
        icon="heroicons:check"
        @click="submitChanges"
      >
        Submit Changes
      </UButton>

      <UButton color="error" icon="heroicons:trash" @click="guildStore.resetAllChanges()">
        Reset Changes
      </UButton>
    </div>
  </UDashboardGroup>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import { isNullOrUndefined } from "@sapphire/utilities";

const guildId = useRouteParams("id", null, { transform: String });
const guildData = useGuildData();
const guildStore = useGuildSettingsStore();
const toast = useToast();
const open = ref(false);
const { hasChanges, mergedSettings: guildSettingsChanges, error } = storeToRefs(guildStore);

useSeoMetadata({
  title: `${guildData.value?.name ? `${guildData.value.name} - ` : ""} Guild`,
});

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
const submitChanges = async () => {
  const error = await guildStore.setChanges(guildSettingsChanges.value);

  toast.add(error
    ? {
        title: "Error",
        color: "error",
        description: "Failed to save changes",
      }
    : {
        title: "Success",
        color: "success",
        description: "Changes saved successfully",
      });
};

onMounted(async () => {
  try {
    await guildStore.fetchSettings();
  }
  catch {
    toast.add({ color: "error", title: "Error", description: "Failed to fetch settings" });
  }
});

const readyToRender = computed(() => {
  return guildStore.loading !== true && !isNullOrUndefined(guildStore.settings);
});
</script>
