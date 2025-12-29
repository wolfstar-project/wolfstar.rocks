<template>
  <GuildSettingsSection title="Channel Settings" description="Configure which channels are used for logging events and which channels should be ignored">
    <!-- Loading Skeleton -->
    <div v-if="loading" class="space-y-8">
      <!-- Logging Channels Skeleton -->
      <div class="space-y-4">
        <USkeleton class="h-8 w-48" />
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="i in 6" :key="`log-skeleton-${i}`" class="space-y-2">
            <USkeleton class="h-5 w-32" />
            <USkeleton class="h-10 w-full" />
          </div>
        </div>
      </div>

      <!-- Ignore Channels Skeleton -->
      <div class="space-y-4">
        <USkeleton class="h-8 w-48" />
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="i in 5" :key="`ignore-skeleton-${i}`" class="space-y-2">
            <USkeleton class="h-5 w-32" />
            <USkeleton class="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>

    <!-- Channels Settings Form -->
    <GuildSettingsForm
      v-else
      :state="state"
      :schema="schema"
      :map-to-guild-data="mapToGuildData"
      aria-label="General guild settings form"
      class="space-y-8"
      @error="onError"
    >
      <!-- Logging Channels Section -->
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-document-text" class="size-5 text-primary" />
          <h3 class="text-lg font-semibold text-base-content">
            Logging Channels
          </h3>
        </div>
        <p class="text-sm text-base-content/70">
          Select which channels should receive specific log events. Leave empty to disable logging for that event.
        </p>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="config in ConfigurableLoggingChannels"
            :key="config.key"
          >
            <SelectChannel
              :guild="guildData"
              :name="config.name"
              :label="config.name"
              :value="state[config.key]"
              :description="config.description"
            />
          </div>
        </div>
      </div>

      <Separator />

      <!-- Ignore Channels Section -->
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <UIcon name="heroicons:eye-slash" class="size-5 text-warning" />
          <h3 class="text-lg font-semibold text-base-content">
            Ignore Channels
          </h3>
        </div>
        <p class="text-sm text-base-content/70">
          Select channels that should be ignored for specific logging events. Messages and events in these channels won't be logged.
        </p>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="config in ConfigurableIgnoreChannels"
            :key="config.key"
          >
            <SelectChannels
              :guild="guildData"
              :label="config.name"
              :value="state[config.key]"
            />
          </div>
        </div>
      </div>
    </GuildSettingsForm>
  </GuildSettingsSection>
</template>

<script setup lang="ts">
import type { FormErrorEvent } from "@nuxt/ui";
import type { GuildData, GuildDataKey } from "~~/server/database";
import { ConfigurableIgnoreChannels, ConfigurableLoggingChannels } from "#shared/utils/settingsDataEntries";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import * as yup from "yup";

const { guildData } = useGuildData();
const { guildSettings } = useGuildSettings();
const toast = useToast();

// Create dynamic schema for form validation
const createChannelSchema = () => {
  const schemaShape: Record<string, any> = {};

  // Add logging channels (string with "none" option)
  for (const config of ConfigurableLoggingChannels) {
    schemaShape[config.key] = yup.string().optional().default(null);
  }

  // Add ignore channels (array of strings)
  for (const config of ConfigurableIgnoreChannels) {
    schemaShape[config.key] = yup.array().of(yup.string()).optional().default([]);
  }

  return yup.object(schemaShape);
};

const schema = createChannelSchema();

type Schema = yup.InferType<typeof schema>;

// Initialize form state from guild settings
const state = reactive<Schema>(schema.getDefault());

// Loading state
const loading = computed(() => !guildData.value?.channels?.length || !guildSettings.value);

// Compute original values from initialized state (snapshot)
// We need this to return the actual values from guildData once loaded, not just defaults
const originalValues = computed(() => {
  if (loading.value)
    return schema.getDefault();

  const values: Record<string, any> = {};

  // Populate from guildData
  for (const config of ConfigurableLoggingChannels) {
    if (guildSettings.value && guildSettings.value[config.key as GuildDataKey]) {
      values[config.key] = guildSettings.value[config.key as GuildDataKey];
    }
    else {
      values[config.key] = null; // or default
    }
  }

  for (const config of ConfigurableIgnoreChannels) {
    if (guildSettings.value && guildSettings.value[config.key as GuildDataKey]) {
      values[config.key] = guildSettings.value[config.key as GuildDataKey];
    }
    else {
      values[config.key] = []; // or default
    }
  }

  return values as Schema;
});

// Watch for loading state change to populate local state
watch(loading, (isLoading) => {
  if (!isLoading && guildData.value && guildSettings.value) {
    // Populate state with values from guildData
    const newValues = originalValues.value;
    Object.assign(state, newValues);
  }
}, { immediate: true });

// Map form state to GuildData changes
function mapToGuildData(formState: Schema): Partial<GuildData> {
  const changes: Partial<GuildData> = {};

  for (const config of ConfigurableLoggingChannels) {
    const value = formState[config.key];
    if (!isNullOrUndefined(value)) {
      changes[config.key as GuildDataKey] = value;
    }
  }

  for (const config of ConfigurableIgnoreChannels) {
    const value = formState[config.key];
    if (!isNullOrUndefined(value)) {
      changes[config.key as GuildDataKey] = value;
    }
  }

  return changes;
}

// Form error handler
async function onError(event: FormErrorEvent) {
  const errorMessage = event.errors[0]?.message;
  toast.add({
    color: "error",
    title: "Error",
    description: `Failed to update channel settings. ${errorMessage ?? "Unknown error"}`,
    icon: "heroicons:x-circle",
  });
}
</script>
