<template>
  <!-- Enhanced Guild Card - inspired by Dyno.gg design -->
  <NuxtLink :to="guild.wolfstarIsIn ? `/guilds/${guild.id}` : guildAddURL(guild.id)" class="group block cursor-pointer">
    <div
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
          class="flex h-6 w-6 items-center justify-center rounded-full bg-success/20 text-success"
          title="Bot is in this server"
        >
          <Icon name="heroicons:check" class="h-4 w-4" />
        </div>
        <div
          v-else-if="guild.manageable"
          class="flex h-6 w-6 items-center justify-center rounded-full bg-warning/20 text-warning"
          title="You can add the bot to this server"
        >
          <Icon name="heroicons:plus" class="h-4 w-4" />
        </div>
        <div
          v-else
          class="flex h-6 w-6 items-center justify-center rounded-full bg-base-300 text-base-content/50"
          title="Insufficient permissions"
        >
          <Icon name="heroicons:lock-closed" class="h-3 w-3" />
        </div>
      </div>

      <!-- Guild Icon -->
      <div class="flex flex-col items-center space-y-4">
        <div class="relative">
          <div
            class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-base-300 transition-transform duration-300 group-hover:scale-105"
          >
            <picture v-if="guild?.icon && !isDefault">
              <source
                v-if="isAnimated"
                media="(prefers-reduced-motion: no-preference), (prefers-reduced-data: no-preference)"
                type="image/gif"
                :srcset="makeSrcset('gif')"
              />
              <source type="image/webp" :srcset="makeSrcset('webp')" />
              <source type="image/png" :srcset="makeSrcset('png')" />
              <img
                :src="createUrl('png', 128)"
                :alt="guild.name"
                class="h-full w-full object-cover"
                decoding="async"
                crossorigin="anonymous"
              />
            </picture>
            <div
              v-else
              class="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 text-base-content"
            >
              <span class="text-2xl font-bold">{{ guild.acronym }}</span>
            </div>
          </div>

          <!-- Online indicator for bot status -->
          <div
            v-if="guild.wolfstarIsIn"
            class="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-base-100 bg-success"
            title="Bot is online"
          >
            <div class="h-2 w-2 rounded-full bg-white"></div>
          </div>
        </div>

        <!-- Guild Info -->
        <div class="flex min-h-[4rem] flex-col justify-center space-y-2 text-center">
          <h3 class="line-clamp-2 text-base font-semibold text-base-content transition-colors group-hover:text-primary">
            {{ guild.name }}
          </h3>

          <!-- Guild Stats -->
          <div class="flex items-center justify-center space-x-4 text-xs text-base-content/60">
            <span v-if="guild.approximateMemberCount" class="flex items-center space-x-1">
              <Icon name="heroicons:users" class="h-3 w-3" />
              <span>{{ formatNumber(guild.approximateMemberCount) }}</span>
            </span>
            <span v-if="guild.approximatePresenceCount" class="flex items-center space-x-1">
              <div class="h-2 w-2 rounded-full bg-success"></div>
              <span>{{ formatNumber(guild.approximatePresenceCount) }}</span>
            </span>
          </div>
        </div>

        <!-- Action Button -->
        <div class="w-full">
          <div
            v-if="guild.wolfstarIsIn"
            class="w-full rounded-lg border border-success/20 bg-success/10 px-3 py-2 text-center text-xs font-medium text-success"
          >
            <Icon name="heroicons:cog-6-tooth" class="mr-1 inline h-3 w-3" />
            Manage Server
          </div>
          <div
            v-else-if="guild.manageable"
            class="w-full rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-center text-xs font-medium text-primary transition-colors group-hover:bg-primary/20"
          >
            <Icon name="heroicons:plus" class="mr-1 inline h-3 w-3" />
            Add Bot
          </div>
          <div v-else class="w-full rounded-lg bg-base-300/50 px-3 py-2 text-center text-xs font-medium text-base-content/50">
            <Icon name="heroicons:lock-closed" class="mr-1 inline h-3 w-3" />
            No Permission
          </div>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { ValuesType } from 'utility-types'
import type { TransformedLoginData } from '~~/shared/types/discord'

interface EnhancedGuildCardProps {
  guild: ValuesType<NonNullable<TransformedLoginData['transformedGuilds']>>
}

const props = defineProps<EnhancedGuildCardProps>()

const isDefault = ref(true)
const isAnimated = ref(false)

watch(
  () => props.guild,
  (guild) => {
    if (guild?.icon) {
      isDefault.value = false
      isAnimated.value = guild.icon.startsWith('a_')
    }
    else {
      isDefault.value = true
      isAnimated.value = false
    }
  },
  { immediate: true },
)

// Utility functions
function createUrl(format: 'webp' | 'png' | 'gif', size: number) {
  return `https://cdn.discordapp.com/icons/${props.guild.id}/${props.guild.icon}.${format}?size=${size}`
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
