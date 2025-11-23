<template>
  <GuildSettingsSection title="Event Settings">
    <div class="grid grid-cols-1 gap-6">
      <UAlert
        color="info"
        variant="subtle"
        title="Coming Soon"
        description="Event logging and notification features are currently in development."
      />
    </div>
  </GuildSettingsSection>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

useSeoMetadata({
  title: "Event Settings",
  description: "Manage event logging and notifications for your guild",
});
</script>
