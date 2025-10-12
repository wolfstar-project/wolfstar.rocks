<template>
  <!-- Guild UIcon - Card or Bare variant -->
  <div
    ref="icon"
    :class="[
      variant === 'card'
        ? 'group relative flex flex-col items-center space-y-3 rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm transition-all duration-300 hover:bg-base-200/50 hover:shadow-lg hover:scale-[1.02]'
        : 'relative',
      {
        'ring-2 ring-primary/20': variant === 'card' && guild.wolfstarIsIn,
        'opacity-75': variant === 'card' && !guild.manageable,
      },
    ]"
  >
    <!-- Guild UIcon -->
    <div class="relative" :class="[variant === 'card' ? '' : 'group']">
      <!-- Status Indicator -->
      <div v-if="showStatus && guild" class="absolute -top-1 -right-1 z-10">
        <div
          v-if="guild.wolfstarIsIn"
          class="flex h-7 w-7 items-center justify-center rounded-full bg-success/70 text-white shadow-sm transition-all duration-200 hover:bg-success/60"
          title="WolfStar is active in this server"
        >
          <UIcon name="heroicons:check-badge" class="h-5 w-5" />
        </div>
        <div
          v-else-if="guild.manageable"
          class="flex h-7 w-7 items-center justify-center rounded-full bg-primary/70 text-white shadow-sm transition-all duration-200 hover:bg-primary/60"
          title="You can invite WolfStar to this server"
        >
          <UIcon name="heroicons:plus-circle" class="h-5 w-5" />
        </div>
        <div
          v-else
          class="flex h-7 w-7 items-center justify-center rounded-full bg-error/70 text-white shadow-sm"
          title="Insufficient permissions to manage this server"
        >
          <UIcon name="heroicons:shield-exclamation" class="h-4 w-4" />
        </div>
      </div>
      <div class="avatar" :class="{ 'avatar-placeholder': isDefault }">
        <div
          class="rounded-full transition-transform duration-300 group-hover:scale-105 flex items-center justify-center"
          :class="iconSizeClasses"
          role="img"
        >
          <div v-if="!loaded" class="skeleton h-full w-full"></div>
          <picture v-if="!isDefault && loaded">
            <source
              v-if="isAnimated && prefersReducedMotion === 'no-preference'"
              type="image/gif"
              :srcset="makeSrcset('gif')"
            />
            <source type="image/webp" :srcset="makeSrcset('webp')" />
            <source type="image/png" :srcset="makeSrcset('png')" />
            <img
              :src="createUrl('png', 128)"
              :alt="guild?.name || 'Guild icon'"
              class="rounded-full"
              decoding="async"
              loading="lazy"
              crossorigin="anonymous"
            />
          </picture>
          <div
            v-else-if="isDefault && loaded"
            class="bg-gradient-to-br from-primary/20 to-secondary/20 text-base-content flex rounded-full"
            :class="iconSizeClasses"
          >
            <span :class="acronymSizeClasses">{{ guild.acronym }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Guild Name (optional) - only in card variant -->
    <div
      v-if="variant === 'card' && showName && guild"
      class="w-full text-center"
    >
      <h4
        class="line-clamp-1 text-xs font-medium text-base-content transition-colors group-hover:text-primary"
      >
        {{ guild.name }}
      </h4>
    </div>

    <!-- Guild Stats (optional) - only in card variant -->
    <div
      v-if="variant === 'card' && showStats && guild"
      class="flex items-center justify-center space-x-2 text-xs text-base-content/60"
    >
      <span
        v-if="guild.approximateMemberCount"
        class="flex items-center space-x-1"
        title="Total members"
      >
        <UIcon name="ph:users-fill" class="h-2 w-2" />
        <span>{{ formatNumber(guild.approximateMemberCount) }}</span>
      </span>
      <span
        v-if="guild.approximatePresenceCount"
        class="flex items-center space-x-1"
        title="Members online"
      >
        <UIcon name="ph:wifi-high" class="h-2 w-2 text-success" />
        <span>{{ formatNumber(guild.approximatePresenceCount) }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TransformedLoginData } from "#shared/types/discord";
import type { ValuesType } from "~/types/utils";
import {
  useIntersectionObserver,
  usePreferredReducedMotion,
} from "@vueuse/core";

interface GuildIconProps {
  guild: ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "card" | "bare";
  showStatus?: boolean;
  showName?: boolean;
  showStats?: boolean;
}

const {
  guild,
  size = "md",
  variant = "card",
  showStatus = true,
  showName = false,
  showStats = false,
} = defineProps<GuildIconProps>();

const loaded = ref(false);
const icon = useTemplateRef<HTMLElement | null>("icon");
const prefersReducedMotion = usePreferredReducedMotion();

// Intersection Observer to lazy-load the icon image
const { stop } = useIntersectionObserver(
  icon,
  ([entry]) => {
    if (entry?.isIntersecting) {
      loaded.value = true;
      stop();
    }
  },
  { rootMargin: "150px" },
);
// Make these computed to avoid SSR hydration issues
const isDefault = ref(false);
const isAnimated = ref(false);
// Size-based classes for DaisyUI Avatar
const iconSizeClasses = computed(() => {
  const sizeMap = {
    sm: "size-12",
    md: "size-16",
    lg: "size-20",
    xl: "size-24",
  };
  return sizeMap[size];
});

const acronymSizeClasses = computed(() => {
  const sizeMap = {
    sm: "text-sm font-bold",
    md: "text-lg font-bold",
    lg: "text-xl font-bold",
    xl: "text-2xl font-bold",
  };
  return sizeMap[size];
});

// Utility functions
function createUrl(format: "webp" | "png" | "gif", size: number) {
  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${format}?size=${size}`;
}

function makeSrcset(format: "webp" | "png" | "gif") {
  return `${createUrl(format, 64)} 1x, ${createUrl(format, 128)} 2x, ${createUrl(format, 256)} 3x, ${createUrl(format, 512)} 4x`;
}

function formatNumber(num: number): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(num);
}

watch(
  () => guild,
  (guild) => {
    isDefault.value = guild.icon === null;
    isAnimated.value = guild.icon?.startsWith("a_") ?? false;
  },
  { immediate: true },
);
</script>
