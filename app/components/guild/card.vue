<template>
  <!-- Enhanced Guild Card - inspired by Dyno.gg design -->
  <NuxtLink :to="guild.wolfstarIsIn ? `/guilds/${guild.id}/manage` : guildAddURL(guild.id)" class="group block cursor-pointer">
    <!-- Minimal Card Version -->
    <div
      v-if="type === 'card'"
      class="relative rounded-xl border border-base-300 bg-base-100 p-4 shadow-md transition-all duration-300 group-hover:bg-base-200/50 hover:scale-[1.02] hover:border-primary/30 hover:shadow-xl"
      :class="{
        'ring-2 ring-primary/20': guild.wolfstarIsIn,
        'opacity-75': !guild.manageable,
      }"
    >
      <!-- Guild Icon -->
      <div class="flex flex-col items-center space-y-3">
        <guild-icon
          :guild="guild"
          variant="bare"
          size="md"
          :show-status="false"
        />

        <!-- Guild Name -->
        <h3 class="line-clamp-2 text-sm font-semibold text-base-content transition-colors group-hover:text-primary text-center">
          {{ guild.name }}
        </h3>
      </div>
    </div>

    <!-- Full List Version -->
    <div
      v-else
      class="relative rounded-xl border border-base-300 bg-base-100 p-6 shadow-md transition-all duration-300 group-hover:bg-base-200/50 hover:scale-[1.02] hover:border-primary/30 hover:shadow-xl"
      :class="{
        'ring-2 ring-primary/20': guild.wolfstarIsIn,
        'opacity-75': !guild.manageable,
      }"
    >
      <!-- Status Indicator -->
      <div class="absolute top-3 right-3">
        <div
          v-if="guild.wolfstarIsIn"
          class="flex h-7 w-7 items-center justify-center rounded-full bg-success/20 text-success shadow-sm transition-all duration-200 hover:bg-success/30"
          title="WolfStar is active in this server"
        >
          <ShadIcon name="heroicons:check-badge" class="h-5 w-5" />
        </div>
        <div
          v-else-if="guild.manageable"
          class="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20 text-primary shadow-sm transition-all duration-200 hover:bg-primary/30"
          title="You can invite WolfStar to this server"
        >
          <ShadIcon name="heroicons:plus-circle" class="h-5 w-5" />
        </div>
        <div
          v-else
          class="flex h-7 w-7 items-center justify-center rounded-full bg-error/20 text-error shadow-sm"
          title="Insufficient permissions to manage this server"
        >
          <ShadIcon name="heroicons:shield-exclamation" class="h-4 w-4" />
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
        <div class="flex items-center justify-center space-x-4 text-xs text-base-content/60">
          <span v-if="guild.approximateMemberCount" class="flex items-center space-x-1 transition-colors hover:text-base-content" title="Total members">
            <ShadIcon name="heroicons:user-group" class="h-3 w-3 text-base-content/70" />
            <span>{{ formatNumber(guild.approximateMemberCount) }}</span>
          </span>
          <span v-if="guild.approximatePresenceCount" class="flex items-center space-x-1 transition-colors hover:text-success" title="Members online">
            <ShadIcon name="heroicons:signal" class="h-3 w-3 text-success" />
            <span>{{ formatNumber(guild.approximatePresenceCount) }}</span>
          </span>
        </div>
      </div>

      <!-- Action Button -->
      <div class="w-full">
        <div
          v-if="guild.wolfstarIsIn"
          class="w-full rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-center text-xs font-medium text-success transition-all duration-200 hover:bg-success/20 hover:shadow-md"
        >
          <ShadIcon name="heroicons:adjustments-horizontal" class="mr-1 inline h-3 w-3" />
          Manage Server
        </div>
        <div
          v-else-if="guild.manageable"
          class="w-full rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-center text-xs font-medium text-primary transition-all duration-200 group-hover:bg-primary/20 hover:shadow-md"
        >
          <ShadIcon name="heroicons:rocket-launch" class="mr-1 inline h-3 w-3" />
          Invite Bot
        </div>
        <div v-else class="w-full rounded-lg bg-base-300/50 px-3 py-2 text-center text-xs font-medium text-base-content/50">
          <ShadIcon name="heroicons:no-symbol" class="mr-1 inline h-3 w-3" />
          No Permission
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { ValuesType } from "utility-types";
import type { TransformedLoginData } from "~~/shared/types/discord";

interface EnhancedGuildCardProps {
  guild: ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>;
  type?: "card" | "list";
}

const props = withDefaults(defineProps<EnhancedGuildCardProps>(), {
  type: "list",
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
