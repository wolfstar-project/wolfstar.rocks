<template>
  <div class="space-y-8">
    <!-- Moderation Events -->
    <SettingsSection title="Moderation Events">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ShadCard
          v-for="event in eventsConfig.moderation"
          :key="event.key"
          class="p-4"
        >
          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <ShadLabel>{{ event.title }}</ShadLabel>
              <p class="text-sm text-base-content/70">{{ event.description }}</p>
            </div>
            <ShadCheckbox
              :model-value="Boolean(settings[event.key])"
              color="primary"
              @update:model-value="(value) => updateEventSetting(event.key, Boolean(value))"
            />
          </div>
        </ShadCard>
      </div>
    </SettingsSection>

    <!-- Message Events -->
    <SettingsSection title="Message Events">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ShadCard
          v-for="event in eventsConfig.messages"
          :key="event.key"
          class="p-4"
        >
          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <ShadLabel>{{ event.title }}</ShadLabel>
              <p class="text-sm text-base-content/70">{{ event.description }}</p>
            </div>
            <ShadCheckbox
              :model-value="Boolean(settings[event.key])"
              color="primary"
              @update:model-value="(value) => updateEventSetting(event.key, Boolean(value))"
            />
          </div>
        </ShadCard>
      </div>
    </SettingsSection>
  </div>
</template>

<script setup lang="ts">
import { useGuildEvents } from "~~/app/composables/useGuildSettings";

// Use the events composable with SettingsDataEntries
const {
  eventsConfig,
  settings,
  updateEventSetting,
} = useGuildEvents();
</script>
