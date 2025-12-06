<template>
  <!-- Enhanced Guild Card - inspired by Dyno.gg design -->
  <div class="group block cursor-pointer h-full">
    <component
      :is="guild.manageable ? 'NuxtLink' : 'div'"
      v-if="effectiveViewMode === 'grid'"
      :to="guild.manageable ? manageGuildURL : undefined"
      :aria-disabled="!guild.manageable"
      :aria-label="guild.manageable ? `Manage ${guild.name}` : `${guild.name} - Insufficient permissions`"
      :role="!guild.manageable ? 'button' : undefined"
      class="block h-full"
    >
      <div
        class="card-container"
        :class="{
          'ring-2 ring-primary/20': guild.wolfstarIsIn,
          'opacity-75 ring-2 ring-error/20': !guild.manageable,
        }"
      >
        <!-- Guild Icon -->
        <div class="flex flex-col items-center" role="img" :aria-label="`${guild.name} server icon`">
          <guild-icon :guild variant="bare" size="lg" :show-status="true" />
        </div>

        <!-- Guild Info -->
        <div class="card-title-container">
          <h3 class="card-title">
            {{ guild.name }}
          </h3>
        </div>
      </div>
    </component>

    <div
      v-else
      class="card-container-full"
      :class="{
        'ring-2 ring-primary/20': guild.wolfstarIsIn,
        'opacity-75 ring-2 ring-error/20': !guild.manageable,
      }"
    >
      <!-- Guild Info -->
      <div class="card-info">
        <div class="flex flex-col items-center" role="img" :aria-label="`${guild.name} server icon`">
          <guild-icon :guild variant="bare" size="lg" :show-status="true" />
        </div>
        <!-- Guild Name -->
        <h3 class="card-title-full">
          {{ guild.name }}
        </h3>

        <!-- Guild Stats -->
        <div class="card-stats">
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
        <div class="card-actions">
          <NuxtLink
            v-if="guild.wolfstarIsIn && guild.manageable"
            :to="`/guilds/${guild.id}/manage`"
            class="card-action-btn card-action-manage"
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
            class="card-action-btn card-action-invite"
            :aria-label="`Invite WolfStar bot to ${guild.name}`"
          >
            <UIcon name="heroicons:rocket-launch" class="mr-1 inline size-3" aria-hidden="true" />
            Invite Bot
          </NuxtLink>
          <div
            v-else
            class="card-action-btn card-action-disabled"
            role="status"
            :aria-label="`No permission to manage ${guild.name}`"
          >
            <UIcon name="heroicons:no-symbol" class="mr-1 inline size-3" aria-hidden="true" />
            No Permission
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TransformedLoginData } from "#shared/types/discord";
import type { ValuesType } from "#shared/types/utils";
import { isNullOrUndefinedOrZero } from "@sapphire/utilities";
import { breakpointsTailwind } from "@vueuse/core";

interface EnhancedGuildCardProps {
  guild: ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>;
  /**
   * The type of card to render.
   * - `card`: A full-width card with a status indicator.
   * - `grid`: A grid card with a status indicator.
   */
  viewMode?: "card" | "grid";
}

const { guild, viewMode = "card" } = defineProps<EnhancedGuildCardProps>();

// Force grid view on mobile devices
const breakpoints = useBreakpoints(breakpointsTailwind);
const isMobile = breakpoints.smaller("sm");
const effectiveViewMode = computed(() => isMobile.value ? "grid" : viewMode);

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

const manageGuildURL = computed(() => {
  if (!guild.manageable) {
    return undefined;
  }
  return guild.wolfstarIsIn
    ? `/guilds/${guild.id}/manage`
    : guildAddURL(guild.id);
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* Grid view card container */
.card-container {
	@apply relative flex h-full flex-col items-center gap-3 rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg transition-all duration-300 ease-out transform-gpu;
	@apply group-hover:bg-base-200/50 hover:-translate-y-1 hover:shadow-2xl hover:border-primary/40;
	@apply focus-visible:-translate-y-1 focus-visible:shadow-2xl focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40;
	@apply motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:shadow-xl motion-reduce:hover:translate-y-0;
}

/* Grid view title container */
.card-title-container {
	@apply flex flex-1 items-center justify-center;
}

/* Grid view title */
.card-title {
	@apply line-clamp-2 text-center text-sm font-semibold text-base-content transition-colors group-hover:text-primary;
}

/* Full card view container */
.card-container-full {
	@apply relative flex h-full flex-col rounded-xl border border-base-300 bg-base-100 p-4 shadow-lg transition-all duration-300 ease-out transform-gpu;
	@apply hover:-translate-y-1 hover:shadow-2xl hover:border-primary/40;
	@apply focus-visible:-translate-y-1 focus-visible:shadow-2xl focus-visible:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40;
	@apply motion-reduce:transform-none motion-reduce:transition-none motion-reduce:hover:shadow-xl motion-reduce:hover:translate-y-0;
}

/* Full card info layout */
.card-info {
	@apply flex h-full flex-col items-center gap-3 text-center;
}

/* Full card title */
.card-title-full {
	@apply line-clamp-2 text-base font-bold text-base-content;
}

/* Stats row */
.card-stats {
	@apply flex items-center justify-center gap-4 text-xs text-base-content/60;
}

/* Action buttons container */
.card-actions {
	@apply mt-auto w-full pt-2;
}

/* Base action button styles */
.card-action-btn {
	@apply flex h-9 w-full items-center justify-center rounded-lg px-3 text-xs font-medium transition-all duration-200;
}

/* Manage server button */
.card-action-manage {
	@apply border border-success/20 bg-success/10 text-success hover:bg-success/20 hover:shadow-md;
}

/* Invite bot button */
.card-action-invite {
	@apply border border-primary/20 bg-primary/10 text-primary group-hover:bg-primary/20 hover:shadow-md;
}

/* Disabled/No permission button */
.card-action-disabled {
	@apply cursor-not-allowed bg-base-300/50 text-base-content/50;
}
</style>
