<template>
  <div
    class="relative flex h-full flex-col rounded-xl border border-base-300/70 bg-base-100 p-4 shadow-lg transition-all duration-300 ease-out transform-gpu hover:-translate-y-1 hover:shadow-2xl focus-visible:-translate-y-1 focus-visible:shadow-2xl focus-visible:outline-none focus-visible:ring-2 motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:shadow-xl motion-reduce:hover:translate-y-0"
    :class="{
      'ring-2 ring-success/20 hover:border-success/40 focus-visible:border-success/50 focus-visible:ring-success/40': guild.wolfstarIsIn && guild.manageable,
      'hover:border-primary/40 focus-visible:border-primary/50 focus-visible:ring-primary/40': !guild.wolfstarIsIn && guild.manageable,
      'opacity-75 ring-2 ring-error/20': !guild.manageable,
    }"
  >
    <!-- Guild Info -->
    <div class="flex h-full flex-col items-center gap-3 text-center">
      <div class="flex flex-col items-center" role="img" :aria-label="`${guild.name} server icon`">
        <guild-icon :guild variant="bare" size="lg" :show-status="true" />
      </div>
      <!-- Guild Name -->
      <h3 class="line-clamp-2 text-base font-bold text-base-content">
        {{ guild.name }}
      </h3>

      <!-- Guild Stats -->
      <div class="hidden md:flex items-center justify-center gap-4 text-xs text-base-content/60">
        <span class="flex items-center gap-1" title="Total members" aria-label="Total members">
          <UIcon
            name="heroicons:user-group"
            class="size-3 text-base-content/70"
            aria-hidden="true"
          />
          <span>{{ approximateMemberCount }}</span>
        </span>
        <span class="flex items-center gap-1" title="Members online" aria-label="Members online">
          <UIcon name="heroicons:signal" class="size-3 text-success" aria-hidden="true" />
          <span>{{ approximatePresenceCount }}</span>
        </span>
      </div>

      <!-- Action Button -->
      <div class="mt-auto w-full pt-2">
        <NuxtLink
          v-if="guild.wolfstarIsIn && guild.manageable"
          :to="`/guilds/${guild.id}/manage`"
          class="flex h-9 w-full items-center justify-center rounded-lg px-3 text-xs font-medium transition-all duration-200 border border-success/20 bg-success/10 text-success hover:bg-success/20 hover:shadow-md"
          :aria-label="`Manage ${guild.name} server settings`"
        >
          <UIcon
            name="heroicons:adjustments-horizontal"
            class="mr-1 inline size-3"
            aria-hidden="true"
          />
          Manage Server
        </NuxtLink>
        <NuxtLink
          v-else-if="guild.manageable"
          :to="guildAddURL(guild.id)"
          class="flex h-9 w-full items-center justify-center rounded-lg px-3 text-xs font-medium transition-all duration-200 border border-primary/20 bg-primary/10 text-primary group-hover:bg-primary/20 hover:shadow-md"
          :aria-label="`Invite WolfStar bot to ${guild.name}`"
        >
          <UIcon name="heroicons:rocket-launch" class="mr-1 inline size-3" aria-hidden="true" />
          Invite Bot
        </NuxtLink>
        <div
          v-else
          class="flex h-9 w-full items-center justify-center rounded-lg px-3 text-xs font-medium transition-all duration-200 cursor-not-allowed bg-base-300/50 text-base-content/50"
          role="status"
          :aria-label="`No permission to manage ${guild.name}`"
        >
          <UIcon name="heroicons:no-symbol" class="mr-1 inline size-3" aria-hidden="true" />
          No Permission
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TransformedLoginData } from "#shared/types/discord";
import type { ValuesType } from "#shared/types/utils";
import { isNullOrUndefinedOrZero } from "@sapphire/utilities";

interface EnhancedGuildCardProps {
  guild: ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>;
}

const { guild } = defineProps<EnhancedGuildCardProps>();

const approximatePresenceCount = computed(() => {
  return !isNullOrUndefinedOrZero(guild.approximatePresenceCount)
    ? formatNumber(guild.approximatePresenceCount)
    : "N/A";
});

const approximateMemberCount = computed(() => {
  return !isNullOrUndefinedOrZero(guild.approximateMemberCount)
    ? formatNumber(guild.approximateMemberCount)
    : "N/A";
});
</script>
