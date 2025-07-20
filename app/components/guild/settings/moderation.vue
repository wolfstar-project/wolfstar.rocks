<template>
  <div class="space-y-8">
    <!-- Moderation Messages Settings -->
    <SettingsSection title="Moderation Messages">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ShadCard
          v-for="message in moderationConfig.messages"
          :key="message.key"
          class="p-4"
        >
          <div class="flex items-center justify-between">
            <div class="space-y-1">
              <ShadLabel>{{ message.name }}</ShadLabel>
              <p class="text-sm text-base-content/70">{{ message.description }}</p>
            </div>
            <ShadCheckbox
              :model-value="Boolean(settings[message.key])"
              color="primary"
              @update:model-value="(value) => updateModerationSetting(message.key, Boolean(value))"
            />
          </div>
        </ShadCard>
      </div>
    </SettingsSection>

    <!-- Moderation Events Settings -->
    <SettingsSection title="Moderation Events">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <ShadCard
          v-for="event in moderationConfig.events"
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
              @update:model-value="(value) => updateModerationSetting(event.key, Boolean(value))"
            />
          </div>
        </ShadCard>
      </div>
    </SettingsSection>
  </div>
</template>

<script setup lang="ts">
import { useGuildModeration } from '~~/app/composables/useGuildSettings'

// Use the moderation composable with SettingsDataEntries
const { 
  moderationConfig, 
  settings, 
  updateModerationSetting
} = useGuildModeration()
</script>
