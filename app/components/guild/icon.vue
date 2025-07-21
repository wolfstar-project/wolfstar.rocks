<template>
  <!-- Guild Icon - Card or Bare variant -->
  <div 
    :class="[
      variant === 'card' 
        ? 'group relative flex flex-col items-center space-y-3 rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm transition-all duration-300 hover:bg-base-200/50 hover:shadow-lg hover:scale-[1.02]'
        : 'relative',
      {
        'ring-2 ring-primary/20': variant === 'card' && guild?.wolfstarIsIn,
        'opacity-75': variant === 'card' && guild && !guild.manageable,
      }
    ]"
  >
    <!-- Status Indicator -->
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
    <div 
      class="relative"
      :class="[
        variant === 'card' ? '' : 'group'
      ]"
    >
      <div
        class="flex items-center justify-center overflow-hidden rounded-full bg-base-300 transition-transform duration-300 group-hover:scale-105"
        :class="iconSizeClasses"
        @mouseenter="isHovering = true"
        @mouseleave="isHovering = false"
      >
        <picture v-if="!isDefault">
          <source
            v-if="isAnimated && isHovering"
            media="(prefers-reduced-motion: no-preference), (prefers-reduced-data: no-preference)"
            type="image/gif"
            :srcset="makeSrcset('gif')"
          />
          <source type="image/webp" :srcset="makeSrcset('webp')" />
          <source type="image/png" :srcset="makeSrcset('png')" />
          <img 
            :src="createUrl('png', 128)" 
            :alt="guild?.name || 'Guild icon'" 
            class="h-full w-full object-cover" 
            decoding="async" 
            crossorigin="anonymous" 
          />
        </picture>
        <div
          v-else
          class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 text-base-content"
        >
          <span :class="acronymSizeClasses">{{ acronym }}</span>
        </div>
      </div>

      <!-- Online indicator for bot status -->
      <div
        v-if="showStatus && guild?.wolfstarIsIn"
        class="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-base-100 bg-success shadow-md animate-pulse"
        title="WolfStar is online"
      >
        <ShadIcon name="ph:lightning-fill" class="h-2 w-2 text-white" />
      </div>
    </div>

    <!-- Guild Name (optional) - only in card variant -->
    <div v-if="variant === 'card' && showName && guild?.name" class="w-full text-center">
      <h4 class="line-clamp-1 text-xs font-medium text-base-content transition-colors group-hover:text-primary">
        {{ guild.name }}
      </h4>
    </div>

    <!-- Guild Stats (optional) - only in card variant -->
    <div v-if="variant === 'card' && showStats && guild" class="flex items-center justify-center space-x-2 text-xs text-base-content/60">
      <span v-if="guild.approximateMemberCount" class="flex items-center space-x-1" title="Total members">
        <ShadIcon name="ph:users-fill" class="h-2 w-2" />
        <span>{{ formatNumber(guild.approximateMemberCount) }}</span>
      </span>
      <span v-if="guild.approximatePresenceCount" class="flex items-center space-x-1" title="Members online">
        <ShadIcon name="ph:wifi-high" class="h-2 w-2 text-success" />
        <span>{{ formatNumber(guild.approximatePresenceCount) }}</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ValuesType } from 'utility-types'
import type { TransformedLoginData } from '~~/shared/types/discord'

const props = withDefaults(defineProps<GuildIconProps>(), {
  size: 'md',
  variant: 'card',
  showStatus: true,
  showName: false,
  showStats: false,
})

const isHovering = ref(false)

interface GuildIconProps {
  guild: ValuesType<NonNullable<TransformedLoginData['transformedGuilds']>>
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'card' | 'bare'
  showStatus?: boolean
  showName?: boolean
  showStats?: boolean
}

// Make these computed to avoid SSR hydration issues
const isDefault = computed(() => {
  return !props.guild.icon
})

const isAnimated = computed(() => {
  return props.guild.icon ? props.guild.icon.startsWith('a_') ?? false : false
})

const acronym = computed(() => {
  return props.guild.acronym
})

// Size-based classes
const iconSizeClasses = computed(() => {
  const sizeMap = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16', 
    lg: 'h-20 w-20',
    xl: 'h-24 w-24'
  }
  return sizeMap[props.size]
})

const acronymSizeClasses = computed(() => {
  const sizeMap = {
    sm: 'text-sm font-bold',
    md: 'text-lg font-bold',
    lg: 'text-xl font-bold', 
    xl: 'text-2xl font-bold'
  }
  return sizeMap[props.size]
})

// Utility functions
function createUrl(format: 'webp' | 'png' | 'gif', size: number) {
  return `https://cdn.discordapp.com/icons/${props.guild!.id}/${props.guild!.icon}.${format}?size=${size}`
}

function makeSrcset(format: 'webp' | 'png' | 'gif') {
  return `${createUrl(format, 64)} 1x, ${createUrl(format, 128)} 2x, ${createUrl(format, 256)} 3x, ${createUrl(format, 512)} 4x`
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
