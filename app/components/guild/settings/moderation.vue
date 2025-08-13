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
            <SelectBoolean
              :title="message.name"
              :description="message.description"
              :model-value="Boolean(settings[message.key])"
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
            <SelectBoolean
              :title="event.title"
              :description="event.description"
              :model-value="Boolean(settings[event.key])"
              @update:model-value="(value) => updateModerationSetting(event.key, Boolean(value))"
            />
          </div>
        </ShadCard>
      </div>
    </SettingsSection>
  </div>
</template>

<script setup lang="ts">
import { useGuildModeration } from "~~/app/composables/useGuildSettings";
import SelectBoolean from "~/components/select/boolean.vue";

// Use the moderation composable with SettingsDataEntries
const {
  moderationConfig,
  settings,
  updateModerationSetting,
} = useGuildModeration();
</script>
