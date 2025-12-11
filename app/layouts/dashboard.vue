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
    <div v-if="hasChanges" class="fixed right-4 bottom-4 z-50 flex flex-col space-y-2">
      <UButton
        color="primary"
        icon="heroicons:check"
        :loading="saving"
        :disabled="saving"
        @click="submitChanges"
      >
        {{ saving ? "Saving..." : "Save Changes" }}
      </UButton>

      <UButton
        color="error"
        icon="heroicons:arrow-path"
        :disabled="saving"
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
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";

const guildId = useRouteParams("id", null, { transform: String });
const readyToRender = useState<boolean>("readyToRender", () => false);
const guildStore = useGuildSettingsStore();
const toast = useToast();
const open = ref(false);
const guild = useGuildData();
const { hasChanges, saving } = storeToRefs(guildStore);

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
async function submitChanges() {
  const error = await guildStore.saveSettings();

  toast.add(error
    ? {
        icon: "i-heroicons-x-circle",
        title: "Error",
        color: "error",
        description: error.message || "Failed to save changes",
      }
    : {
        icon: "i-heroicons-check-circle",
        title: "Success",
        color: "success",
        description: "Changes saved successfully",
      });
}

function resetChanges() {
  guildStore.resetAllChanges();
  toast.add({
    icon: "i-heroicons-arrow-path",
    title: "Reset",
    color: "info",
    description: "All changes have been reset",
  });
}

onMounted(async () => {
  readyToRender.value = false;

  try {
    // Fetch guild data first
    const { data, error: guildError } = await useFetch<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>(`/api/guilds/${guildId.value}`, {
      params: {
        shouldSerialize: true,
      },
    });

    if (guildError.value) {
      throw createError({
        statusCode: guildError.value.statusCode || 500,
        statusMessage: guildError.value.statusMessage || "Failed to fetch guild data",
        message: guildError.value.data?.message || "An error occurred while fetching guild data",
      });
    }

    if (data.value) {
      guild.value = data.value;
    }

    // Then fetch guild settings
    await guildStore.fetchSettings();
  }
  finally {
    readyToRender.value = true;
  }
});
</script>
