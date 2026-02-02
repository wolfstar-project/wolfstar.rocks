<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      collapsible
      resizable
      :ui="{ header: 'bg-base-200/80', body: 'bg-base-200/80 border-r border-base-200', footer: 'bg-base-200/80 border-t border-b border-base-200' }"
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
      v-else-if="hasError && error"
      class="flex min-h-screen w-full flex-col items-center justify-center space-y-4 px-4 text-center"
      role="alert"
      aria-label="Error loading dashboard"
    >
      <UIcon name="ph:warning-duotone" class="size-12 text-error" aria-hidden="true" />
      <div class="space-y-2">
        <h2 class="text-xl font-semibold text-base-content">Error Loading Dashboard</h2>
        <p v-if="error.status === 403">
          You do not have permission to access this guild's dashboard.
          Please ensure you have the necessary permissions and try again.
        </p>
        <p class="text-sm text-base-content/60">
          An error occurred while loading the dashboard.
          Please try again later or contact support if the issue persists.
        </p>
      </div>
    </div>
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
import type { GuildData } from "#server/database";
import type { ValuesType } from "#shared/types/utils";
import type { NavigationMenuItem } from "@nuxt/ui";
import type { FetchError } from "ofetch";
import { useLogger } from "#shared/utils/logger";
import { cast, isNullOrUndefinedOrZero, objectValues } from "@sapphire/utilities";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { objectToTuples } from "@sapphire/utilities/objectToTuples";

const logger = useLogger("@wolfstar/dashboard");
const guildId = useRouteParams("id", null, { transform: String });

// Validate guild ID first
if (!isValidGuildId(guildId.value)) {
  throw createError({
    status: 400,
    statusText: "Invalid Guild ID",
    message: "The provided guild ID is not valid. Guild IDs must be 17-19 digit numbers.",
    data: {
      field: "guildId",
    },
  });
}

const toast = useToast();
const open = ref(false);
const error = useState<FetchError | null>("dashboard:error", () => null);
const { setGuildData, guildData } = useGuildData();
const { setGuildSettings, guildSettings } = useGuildSettings();
const { setGuildSettingsChanges, guildSettingsChanges } = useGuildSettingsChanges();
const hasError = useState<boolean>("dashboard:hasError", () => false);
const isLoading = useState<boolean>("dashboard:loading", () => true);

// Form validation registration
type ValidateFn = () => Promise<{ valid: boolean; errors: any[] }>;
const registeredValidation = ref<ValidateFn | null>(null);

function registerFormValidation(validateFn: ValidateFn) {
  registeredValidation.value = validateFn;
}

function unregisterFormValidation() {
  registeredValidation.value = null;
}

provide("registerFormValidation", registerFormValidation);
provide("unregisterFormValidation", unregisterFormValidation);

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
  // Validate form before submitting
  if (registeredValidation.value) {
    try {
      const validation = await registeredValidation.value();

      if (!validation.valid) {
        // Extract first error message for toast
        const firstError = validation.errors[0];
        const errorMessage = firstError?.message || firstError?.path || "Please fix the errors before saving";

        toast.add({
          color: "error",
          icon: "i-heroicons-exclamation-triangle",
          title: "Validation Failed",
          description: errorMessage,
        });

        logger.warn(`Validation failed for guild ${guildId.value}:`, validation.errors);
        return; // Abort save
      }
    }
    catch (err: any) {
      logger.error(`Validation error for guild ${guildId.value}:`, err);

      toast.add({
        color: "error",
        icon: "i-heroicons-exclamation-triangle",
        title: "Validation Error",
        description: "An error occurred during validation. Please try again.",
      });

      return; // Abort save
    }
  }

  try {
    const { data, error: fetchError } = await useFetch(`/api/guilds/${guildId.value}/settings`, {
      method: "PATCH",
      body: {
        data: objectToTuples(guildSettingsChanges.value as Partial<GuildData>),
      },
    });

    if (fetchError.value) {
      hasError.value = true;
      error.value = fetchError.value;

      logger.error("Error saving guild settings changes for guild Id:", guildId.value, fetchError.value);

      toast.add({
        color: "error",
        icon: "i-heroicons-x-circle",
        title: "Error",
        description: "An error occurred while saving changes. Please try again later.",
      });

      return; // Early return on error
    }

    // Parse the serialized JSON string response from server
    const dataParsed = cast<GuildData>(JSON.parse(data.value as string));

    if (!isNullOrUndefined(dataParsed) && objectValues(dataParsed).length !== 0) {
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
  catch (err: any) {
    hasError.value = true;
    error.value = err;

    logger.error("Unexpected error saving guild settings:", guildId.value, err);

    toast.add({
      color: "error",
      icon: "i-heroicons-x-circle",
      title: "Error",
      description: "An unexpected error occurred while saving changes. Please try again later.",
    });
  }
}

function resetChanges() {
  setGuildSettingsChanges(undefined);

  logger.info(`Guild settings changes reset for guild Id: ${guildId.value}`);

  toast.add({
    icon: "heroicons:arrow-path",
    title: "Reset",
    color: "info",
    description: "All changes have been reset",
  });
}

// Clear staged changes when guild ID changes (prevents cross-guild leakage)
watch(guildId, (newGuildId, oldGuildId) => {
  if (oldGuildId && newGuildId !== oldGuildId) {
    setGuildSettingsChanges(undefined);
    logger.info(`Cleared staged changes due to guild switch from ${oldGuildId} to ${newGuildId}`);
  }
});

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
  catch (err: any) {
    hasError.value = true;
    isLoading.value = false;
    error.value = err;

    logger.error("Error loading guild data or settings for guild Id:", guildId.value, err);

    toast.add({
      color: "error",
      icon: "i-heroicons-x-circle",
      title: "Error Loading Data",
      description: err?.message || "An error occurred while fetching the guild data or settings. Please try again later.",
    });
  }
  finally {
    isLoading.value = false;
  }
});
</script>
