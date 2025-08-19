<template>
  <!-- Enhanced Guild Card - inspired by Dyno.gg design -->
  <div class="group block cursor-pointer">
    <NuxtLink
      v-if="type === 'grid'"

      :to="guild.wolfstarIsIn ? `/guilds/${guild.id}/manage` : guildAddURL(guild.id)"
    >
      <div
        class="relative h-full rounded-xl border border-base-300 bg-base-100 p-6 shadow-md transition-all duration-300 group-hover:bg-base-200/50 hover:scale-[1.02] hover:border-primary/30 hover:shadow-xl"
        :class="{
          'ring-2 ring-primary/20': guild.wolfstarIsIn,
          'opacity-75 ring-2 ring-error/20': !guild.manageable,
        }"
      >
        <div
          v-if="showStatus && guild && variant === 'card'"
          class="absolute top-2 right-2"
        >
          <div
            v-if="guild.wolfstarIsIn"
            class="flex h-5 w-5 items-center justify-center rounded-full bg-success/20 text-success"
            title="WolfStar is active"
          >
            <ShadIcon name="ph:check-circle-fill" class="h-3 w-3" />
          </div>
          <div
            v-else-if="guild.manageable"
            class="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary"
            title="Can invite WolfStar"
          >
            <ShadIcon name="ph:plus-circle-fill" class="h-3 w-3" />
          </div>
          <div
            v-else
            class="flex h-5 w-5 items-center justify-center rounded-full bg-error/20 text-error"
            title="No permissions"
          >
            <ShadIcon name="ph:shield-warning-fill" class="h-3 w-3" />
          </div>
        </div>
        <!-- Guild Icon -->
        <div class="flex flex-col items-center space-y-4">
          <guild-icon
            :guild="guild"
            variant="bare"
            size="lg"
            :show-status="true"
          />
        </div>

        <!-- Guild Info -->
        <div class="flex min-h-[4rem] flex-col justify-center space-y-2 text-center">
          <h3 class="line-clamp-2 text-base font-semibold text-base-content transition-colors group-hover:text-primary">
            {{ guild.name }}
          </h3>

        <!-- Guild Stats -->
        </div>
      </div>
    </NuxtLink>
    <div
      v-else
    >
      <div
        class="relative h-full rounded-xl border border-base-300 bg-base-100 p-6 shadow-md transition-all duration-300"
        :class="{
          'ring-2 ring-primary/20': guild.wolfstarIsIn,
          'opacity-75 ring-2 ring-error/20': !guild.manageable,
        }"
      >
        <!-- Guild Icon -->
        <div class="flex flex-col items-center space-y-4">
          <guild-icon
            :guild="guild"
            variant="bare"
            size="lg"
            :show-status="true"
          />
        </div>

        <!-- Guild Info -->
        <div class="flex min-h-[4rem] flex-col justify-center space-y-2 text-center">
          <h3 class="line-clamp-2 text-base font-semibold text-base-content">
            {{ guild.name }}
          </h3>

          <!-- Guild Stats -->
          <div
            class="flex items-center justify-center space-x-4 text-xs text-base-content/60"
          >
            <span
              v-if="guild.approximateMemberCount"
              class="flex items-center space-x-1"
              title="Total members"
            >
              <ShadIcon name="heroicons:user-group" class="h-3 w-3 text-base-content/70" />
              <span>{{ formatNumber(guild.approximateMemberCount) }}</span>
            </span>
            <span
              v-if="guild.approximatePresenceCount"
              class="flex items-center space-x-1"
              title="Members online"
            >
              <ShadIcon name="heroicons:signal" class="h-3 w-3 text-success" />
              <span>{{ formatNumber(guild.approximatePresenceCount) }}</span>
            </span>
          </div>
        </div>
        <!-- Action Button -->
        <div class="w-full">
          <NuxtLink
            v-if="guild.wolfstarIsIn"
            :to="`/guilds/${guild.id}/manage`"
            class="flex h-9 w-full items-center justify-center rounded-lg border border-success/20 bg-success/10 px-3 text-xs font-medium text-success transition-all duration-200 hover:bg-success/20 hover:shadow-md"
          >
            <ShadIcon name="heroicons:adjustments-horizontal" class="mr-1 inline h-3 w-3" />
            Manage Server
          </NuxtLink>
          <NuxtLink
            v-else-if="guild.manageable"
            :to="guildAddURL(guild.id)"
            class="flex h-9 w-full items-center justify-center rounded-lg border border-primary/20 bg-primary/10 px-3 text-xs font-medium text-primary transition-all duration-200 group-hover:bg-primary/20 hover:shadow-md"
          >
            <ShadIcon name="heroicons:rocket-launch" class="mr-1 inline h-3 w-3" />
            Invite Bot
          </NuxtLink>
          <div v-else class="flex h-9 w-full items-center justify-center rounded-lg bg-base-300/50 px-3 text-xs font-medium text-base-content/50">
            <ShadIcon name="heroicons:no-symbol" class="mr-1 inline h-3 w-3" />
            No Permission
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TransformedLoginData } from "~~/shared/types/discord";
import type { ValuesType } from "~/types/utils";

interface EnhancedGuildCardProps {
  guild: ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>;
  /**
   * The type of card to render.
   * - `card`: A full-width card with a status indicator.
   * - `grid`: A grid card with a status indicator.
   */
  type?: "card" | "grid";
}

const props = withDefaults(defineProps<EnhancedGuildCardProps>(), {
  type: "card",
});

// Extract guild and type from props for template usage
const guild = toRef(props, "guild");
const type = toRef(props, "type");

// Utility functions
function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
}
</script>

<style scoped>
.line-clamp-2 {
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}
</style>
