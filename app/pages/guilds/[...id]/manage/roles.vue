<template>
  <GuildSettingsSection title="Role Settings">
    <div class="grid grid-cols-1 gap-6">
      <UAlert
        color="info"
        variant="subtle"
        title="Coming Soon"
        description="Role management features are currently in development."
      />
    </div>
  </GuildSettingsSection>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "dashboard",
});

useSeoMetadata({
  title: "Role Settings",
  description: "Manage role-specific settings for your guild",
});
</script>
