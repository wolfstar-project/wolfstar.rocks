<template>
  <GuildSettingsSection title="Channel Settings">
    <div class="grid grid-cols-1 gap-6">
      <UAlert
        color="info"
        variant="subtle"
        title="Coming Soon"
        description="Channel management features are currently in development."
      />
    </div>
  </GuildSettingsSection>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

useSeoMetadata({
  title: "Channel Settings",
  description: "Manage channel-specific settings for your guild",
});
</script>
