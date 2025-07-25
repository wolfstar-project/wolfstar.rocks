<template>
  <div class="space-y-8">
    <!-- Logging Channels -->
    <SettingsSection title="Logging Channels">
      <div v-if="guildData" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ShadCard
          v-for="channel in channelsConfig.logging"
          :key="channel.key"
          class="p-4"
        >
          <div class="space-y-3">
            <div>
              <ShadLabel>{{ channel.name }}</ShadLabel>
              <p class="text-sm text-base-content/70 mt-1">{{ channel.description }}</p>
            </div>
            <div class="flex gap-2">
              <SelectChannel
                :label="channel.name"
                :guild="guildData"
                :model-value="settings[channel.key] || undefined"
                class="flex-1"
                @update:model-value="(value: string) => updateChannelSetting(channel.key, value)"
              />
              <ShadButton
                variant="outline"
                size="sm"
                @click="resetChannel(channel.key)"
              >
                Reset
              </ShadButton>
            </div>
          </div>
        </ShadCard>
      </div>
      <div v-else class="text-center py-8 text-base-content/70">
        <ShadIcon name="heroicons:arrow-path" class="h-6 w-6 animate-spin mx-auto mb-2" />
        Loading guild data...
      </div>
    </SettingsSection>

    <!-- Ignore Channels -->
    <SettingsSection title="Ignore Channels">
      <div v-if="guildData" class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ShadCard
          v-for="ignoreChannel in channelsConfig.ignore"
          :key="ignoreChannel.key"
          class="p-4"
        >
          <div class="space-y-3">
            <div>
              <ShadLabel>{{ ignoreChannel.name }}</ShadLabel>
              <p class="text-sm text-base-content/70 mt-1">{{ ignoreChannel.description }}</p>
            </div>
            <div class="flex gap-2">
              <SelectChannels
                :label="ignoreChannel.name"
                :guild="guildData"
                :model-value="(settings[ignoreChannel.key] as string[]) || []"
                class="flex-1"
                @update:model-value="(value: string[]) => updateChannelSetting(ignoreChannel.key, value)"
              />
              <ShadButton
                variant="outline"
                size="sm"
                @click="resetChannel(ignoreChannel.key)"
              >
                Reset
              </ShadButton>
            </div>
          </div>
        </ShadCard>
      </div>
      <div v-else class="text-center py-8 text-base-content/70">
        <ShadIcon name="heroicons:arrow-path" class="h-6 w-6 animate-spin mx-auto mb-2" />
        Loading guild data...
      </div>
    </SettingsSection>
  </div>
</template>

<script setup lang="ts">
import { useGuildChannels } from "~~/app/composables/useGuildSettings";

// Use the channels composable with SettingsDataEntries
const {
  channelsConfig,
  settings,
  updateChannelSetting,
  resetChannel,
} = useGuildChannels();

// Get guild data from composable
const guildData = useGuildData();
</script>

<style scoped>
.md-grid-cols-3 {
	@apply grid-cols-3;
}
</style>
