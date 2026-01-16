<template>
  <GuildSettingsSection title="Event Settings" description="Configure which events should be logged and tracked">
    <!-- Loading Skeleton -->
    <div v-if="loading" class="space-y-8">
      <div class="space-y-4">
        <USkeleton class="h-8 w-48" />
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div v-for="i in 4" :key="`event-skeleton-${i}`" class="space-y-2">
            <USkeleton class="h-5 w-32" />
            <USkeleton class="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>

    <!-- Events Settings Form -->
    <GuildSettingsForm
      v-else
      :state="state"
      :schema="schema"
      :map-to-guild-data="mapToGuildData"
      aria-label="Events settings form"
      class="space-y-8"
      @error="onError"
    >
      <!-- Moderation Events Section -->
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <UIcon name="heroicons:shield-check" class="size-5 text-primary" />
          <h3 class="text-lg font-semibold text-base-content">
            Moderation Events
          </h3>
        </div>
        <p class="text-sm text-base-content/70">
          These events involve moderation actions and require that you setup the Moderation Logs channel on
          <NuxtLink :to="channelsPageLink" class="text-primary hover:underline">
            the Channels page
          </NuxtLink>
        </p>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectBoolean
            v-for="event in ConfigurableModerationEvents"
            :key="event.key"
            :label="event.title"
            :value="state[event.key]"
            :description="event.description"
            :tooltip-title="event.description"
          />
        </div>
      </div>

      <Separator />

      <!-- Message Events Section -->
      <div class="space-y-4">
        <div class="flex items-center gap-2">
          <UIcon name="heroicons:chat-bubble-left-right" class="size-5 text-primary" />
          <h3 class="text-lg font-semibold text-base-content">
            Message Events
          </h3>
        </div>
        <p class="text-sm text-base-content/70">
          These events involve message events, the channels to set up vary on the type of event and each channel can be configured on
          <NuxtLink :to="channelsPageLink" class="text-primary hover:underline">
            the Channels page
          </NuxtLink>
        </p>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectBoolean
            v-for="event in ConfigurableMessageEvents"
            :key="event.key"
            :label="event.title"
            :value="state[event.key]"
            :description="event.description"
            :tooltip-title="event.description"
          />
        </div>
      </div>
    </GuildSettingsForm>
  </GuildSettingsSection>
</template>

<script setup lang="ts">
import type { FormErrorEvent } from "@nuxt/ui";
import type { GuildData, GuildDataKey } from "~~/server/database";
import { isNullOrUndefined } from "@sapphire/utilities";
import * as yup from "yup";
import { ConfigurableMessageEvents, ConfigurableModerationEvents } from "~~/shared/utils/settingsDataEntries";

const { guildData } = useGuildData();
const { guildSettings } = useGuildSettings();
const toast = useToast();

// Combine all events for the schema
const allEvents = [...ConfigurableModerationEvents, ...ConfigurableMessageEvents];

// Create yup schema for all event keys
const schemaObject: Record<string, yup.BooleanSchema> = {};
for (const event of allEvents) {
  schemaObject[event.key] = yup.boolean().required();
}

const schema = yup.object(schemaObject);

// Initialize state with current values from guildSettings
const loading = computed(() => isNullOrUndefined(guildSettings.value));

const initialState: Record<string, boolean> = {};
for (const event of allEvents) {
  initialState[event.key] = guildSettings.value?.[event.key] ?? false;
}

const state = reactive<Record<string, boolean>>(initialState);

function mapToGuildData(stateData: Record<string, boolean>): Partial<GuildData> {
  const result: Partial<GuildData> = {};
  for (const key in stateData) {
    result[key as GuildDataKey] = stateData[key] as never;
  }
  return result;
}

async function onError(event: FormErrorEvent) {
  const element = event.errors[0] && event.errors[0].id ? document.getElementById(event.errors[0].id) : null;
  element?.scrollIntoView({ behavior: "smooth", block: "center" });
  const errorMessage = event.errors[0]?.message;
  toast.add({
    color: "error",
    title: "Error",
    description: `Failed to update general settings. ${errorMessage ?? "Unknown error"}`,
    icon: "heroicons:circle",
  });
}

const channelsPageLink = computed(() => `/guilds/${guildData.value.id}/manage/channels`);

// Watch for guildSettings changes and update state
watch(guildSettings, (newSettings) => {
  if (newSettings) {
    for (const event of allEvents) {
      state[event.key] = newSettings[event.key] ?? false;
    }
  }
}, { deep: true });
</script>
