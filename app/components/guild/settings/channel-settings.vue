<template>
    <div role="region" aria-label="Channel Settings">
        <!-- Header Section -->
        <section>
            <h2 class="text-2xl font-bold">Channels</h2>
            <p class="mt-2 text-base-content/80">
                Here you can configure different kinds of channels for WolfStar. Hover over a button to get more information for that specific
                channel.
            </p>
        </section>

        <!-- Logging Channels Section -->
        <LayoutSettingsSection title="Logging Channels">
            <div v-if="guildData" class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div v-for="channel in ConfigurableLoggingChannels" :key="channel.key">
                    <SelectChannel
                        v-model="settings[channel.key]"
                        :label="channel.name"
                        :tooltip="channel.description"
                        :guild="guildData"
                        class="w-full"
                        @reset="resetChanges(channel.key)"
                    />
                </div>
            </div>
        </LayoutSettingsSection>

        <!-- Ignore Channels Section -->
        <LayoutSettingsSection title="Logging Ignore Channels" class="mt-8">
            <div v-if="guildData" class="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div v-for="channel in ConfigurableIgnoreChannels" :key="channel.key">
                    <SelectChannels
                        v-model="settings[channel.key]"
                        :label="channel.name"
                        :tooltip="channel.description"
                        :guild="guildData"
                        class="w-full"
                        @reset="resetChanges(channel.key)"
                    />
                </div>
            </div>
        </LayoutSettingsSection>
    </div>
</template>

<script setup lang="ts">
// Get the settings data from your store
const guildData = useGuildData();
const { settings, resetChanges } = useGuildSettings();
</script>

<style scoped>
.md-grid-cols-3 {
    @apply grid-cols-3;
}
</style>
