<template>
  <!-- Enhanced Guild Card - inspired by Dyno.gg design -->
  <div class="group block cursor-pointer">
    <component
      :is="guild.manageable ? 'NuxtLink' : 'div'"
      v-if="viewMode === 'grid'"
      :to="guild.manageable ? manageGuildURL : undefined"
      :aria-disabled="!guild.manageable"
      :role="!guild.manageable ? 'button' : undefined"
    >
      <div
        class="relative h-full rounded-xl border border-base-300 bg-base-100 p-6 shadow-md transition-all duration-300 group-hover:bg-base-200/50 hover:scale-[1.02] hover:border-primary/30 hover:shadow-xl"
        :class="{
          'ring-2 ring-primary/20': guild.wolfstarIsIn,
          'opacity-75 ring-2 ring-error/20': !guild.manageable,
        }"
      >
        <!-- Guild UIcon -->
        <div class="flex flex-col items-center space-y-4">
          <guild-icon
            :guild
            variant="bare"
            size="lg"
            :show-status="true"
          />
        </div>

        <!-- Guild Info -->
        <div class="flex min-h-[4rem] flex-col justify-center space-y-2 text-center">
          <h3 class="line-clamp-2 sm:text-sm text-md text-base font-semibold text-base-content transition-colors group-hover:text-primary">
            {{ guild.name }}
          </h3>
        </div>
      </div>
    </component>

    <UContainer
      v-else
      class="card"
      :class="{
        'ring-2 ring-primary/20': guild.wolfstarIsIn,
        'opacity-75 ring-2 ring-error/20': !guild.manageable,
      }"
    >
      <!-- Guild UIcon -->
      <div class="flex flex-col items-center space-y-4">
        <guild-icon
          :guild
          variant="bare"
          size="lg"
          :show-status="true"
        />
      </div>

      <!-- Guild Info -->
      <div class="card-info">
        <!-- Guild Name -->
        <h3 class="line-clamp-2 text-sm font-semibold text-base-content">
          {{ guild.name }}
        </h3>

        <!-- Guild Stats -->
        <div
          class="flex items-center justify-center space-x-4 text-xs text-base-content/60"
        >
          <span
            class="flex items-center space-x-1"
            title="Total members"
          >
            <UIcon name="heroicons:user-group" class="h-3 w-3 text-base-content/70" />
            <span>{{ guild.approximateMemberCount ? formatNumber(guild.approximateMemberCount) : 'N/A' }}</span>
          </span>
          <span
            class="flex items-center space-x-1"
            title="Members online"
          >
            <UIcon name="heroicons:signal" class="h-3 w-3 text-success" />
            <span>{{ guild.approximatePresenceCount ? formatNumber(guild.approximatePresenceCount) : 'N/A' }}</span>
          </span>
        </div>
      </div>
      <!-- Action Button -->
      <div class="w-full gap-2">
        <NuxtLink
          v-if="guild.wolfstarIsIn"
          :to="`/guilds/${guild.id}/manage`"
          class="flex h-9 w-full items-center justify-center rounded-lg border border-success/20 bg-success/10 px-3 text-xs font-medium text-success transition-all duration-200 hover:bg-success/20 hover:shadow-md"
        >
          <UIcon name="heroicons:adjustments-horizontal" class="mr-1 inline h-3 w-3" />
          Manage Server
        </NuxtLink>
        <NuxtLink
          v-else-if="guild.manageable"
          :to="guildAddURL(guild.id)"
          class="flex h-9 w-full items-center justify-center rounded-lg border border-primary/20 bg-primary/10 px-3 text-xs font-medium text-primary transition-all duration-200 group-hover:bg-primary/20 hover:shadow-md"
        >
          <UIcon name="heroicons:rocket-launch" class="mr-1 inline h-3 w-3" />
          Invite Bot
        </NuxtLink>
        <div v-else class="flex h-9 w-full items-center justify-center rounded-lg bg-base-300/50 px-3 text-xs font-medium text-base-content/50">
          <UIcon name="heroicons:no-symbol" class="mr-1 inline h-3 w-3" />
          No Permission
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { TransformedLoginData } from "#shared/types/discord";
import type { ValuesType } from "~/types/utils";
import { card } from "#build/ui";

interface EnhancedGuildCardProps {
  guild: ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>;
  /**
   * The type of card to render.
   * - `card`: A full-width card with a status indicator.
   * - `grid`: A grid card with a status indicator.
   */
  viewMode?: "card" | "grid";
}

const { guild, viewMode = card } = defineProps<EnhancedGuildCardProps>();

const manageGuildURL = computed(() => {
  if (!guild.manageable) {
    return undefined;
  }
  return guild.wolfstarIsIn ? `/guilds/${guild.id}/manage` : guildAddURL(guild.id);
});
// Utility functions
function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.card {
	@apply relative h-full rounded-xl border border-base-300 bg-base-100 p-6 shadow-md transition-all duration-300;
}
.card-info {
	@apply flex min-h-[4rem] flex-col justify-between space-y-2 text-center;
}

.line-clamp-2 {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
</style>
