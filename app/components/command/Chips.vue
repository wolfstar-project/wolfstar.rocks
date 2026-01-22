<template>
  <div v-if="hasChips" class="flex flex-wrap gap-3 animate-fade-in" role="list" aria-label="Command properties">
    <!-- Permission Level Badge -->
    <UBadge
      v-if="command.permissionLevel > 0"
      color="warning"
      variant="soft"
      size="md"
      role="listitem"
      :aria-label="`Permission level: ${permissionLevelLabel}`"
      class="hover-lift focus:outline-none focus:ring-2 focus:ring-warning-500 focus:ring-offset-2"
    >
      <template #leading>
        <UIcon name="i-heroicons-chevron-double-up" class="size-4" aria-hidden="true" />
      </template>
      {{ permissionLevelLabel }}
    </UBadge>

    <!-- Guild Only Badge -->
    <UBadge
      v-if="isGuildOnly"
      color="info"
      variant="soft"
      size="md"
      role="listitem"
      :aria-label="`Server requirement: ${guildOnlyLabel}`"
      class="transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-info-500 focus:ring-offset-2"
    >
      <template #leading>
        <UIcon name="i-custom-discord" class="size-4" aria-hidden="true" />
      </template>
      {{ guildOnlyLabel }}
    </UBadge>

    <!-- Guarded Badge -->
    <UBadge
      v-if="command.guarded"
      color="error"
      variant="soft"
      size="md"
      role="listitem"
      aria-label="This command cannot be disabled"
      class="transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-error-500 focus:ring-offset-2"
    >
      <template #leading>
        <UIcon name="i-heroicons-lock-closed" class="size-4" aria-hidden="true" />
      </template>
      Cannot be disabled
    </UBadge>
  </div>
</template>

<script lang="ts" setup>
import type { FlattenedCommand } from "#shared/types/discord";

const { command } = defineProps<{
  command: FlattenedCommand;
}>();

const GUILD_ONLY_PRECONDITIONS = [
  "Administrator",
  "DJ",
  "GuildOnly",
  "Moderator",
  "NewsOnly",
  "NSFW",
  "TextOnly",
];

const PERMISSION_TITLES: Record<number, string> = {
  4: "This can only be ran by staff members.",
  5: "This can only be ran by moderators and administrators.",
  6: "This can only be ran by administrators.",
};

const MOBILE_TITLES: Record<number, string> = {
  4: "Staff members only",
  5: "Moderators & administrators only",
  6: "Administrators only",
};

// Computed
const isGuildOnly = computed(() => {
  return command.preconditions.entries
    .flatMap((preconditionEntry) => preconditionEntry.entries)
    .filter(Boolean)
    .map((entry) => entry.name)
    .some((predicate) => GUILD_ONLY_PRECONDITIONS.includes(predicate));
});

const permissionLevelLabel = computed(() => {
  return isSmallScreen.value
    ? MOBILE_TITLES[command.permissionLevel]
    : PERMISSION_TITLES[command.permissionLevel];
});

const guildOnlyLabel = computed(() => {
  return isSmallScreen.value
    ? "Usable in servers only."
    : "This can only be used in servers.";
});

const hasChips = computed(() => {
  return (
    command.permissionLevel > 0
    || isGuildOnly.value
    || command.guarded
  );
});
</script>
