<template>
  <!-- Enhanced Guild Cards Grid - inspired by Dyno.gg -->
  <div class="guild-cards-container space-y-6">
    <template v-if="!loading">
      <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div class="flex w-full items-center space-x-2 sm:w-auto">
          <!-- Search Input for Desktop -->
          <div class="relative hidden flex-grow sm:block">
            <ShadIcon
              name="heroicons:magnifying-glass-circle"
              class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-primary/60"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search servers..."
              class="input-bordered input w-full pl-11 sm:w-64"
              :disabled="loading"
            />
          </div>

          <!-- Search Input for Mobile -->
          <div class="relative w-48 sm:hidden">
            <ShadIcon
              name="heroicons:magnifying-glass-circle"
              class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-primary/60"
            />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search..."
              class="input-bordered input w-full pl-11"
              :disabled="loading"
            />
          </div>

          <!-- Manageable Only Toggle Button -->
          <div class="form-control">
            <ShadButton
              variant="ghost"
              size="sm"
              :class="{ 'btn-active': showManageableOnly }"
              :disabled="loading"
              @click="showManageableOnly = !showManageableOnly"
            >
              <template #leading>
                <ShadIcon name="heroicons:shield-check" class="h-4 w-4" />
              </template>
              <span class="hidden sm:inline">Manageable</span>
            </ShadButton>
          </div>
        </div>
        <div class="hidden text-sm text-base-content/60 sm:block">
          <span> {{ filteredGuilds.length }} of {{ guilds?.length || 0 }} servers </span>
        </div>
      </div>
    </template>

    <div v-else class="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div class="flex items-center space-x-4">
        <div class="skeleton h-12 w-64 rounded-lg"></div>
        <div class="skeleton h-6 w-32 rounded"></div>
      </div>
      <div class="skeleton h-4 w-24 rounded"></div>
    </div>

    <!-- Loading Skeleton Grid -->
    <div v-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <guild-card-skeleton v-for="i in 14" :key="`skeleton-${i}`" class="h-full" />
    </div>

    <div ref="scrollComponent">
      <!-- Guild Cards Grid -->
      <div
        v-if="!loading && paginatedGuilds.length > 0"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      >
        <guild-card v-for="guild in paginatedGuilds" :key="guild.id" :guild="guild" class="h-full" />
      </div>

      <!-- Loading Indicator for Infinite Scroll -->
      <div v-if="!loading && loadingMore" class="flex justify-center py-4">
        <span class="loading loading-spinner loading-lg text-primary"></span>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!loading && filteredGuilds.length === 0"
      class="flex flex-col items-center justify-center space-y-6 py-16"
    >
      <div class="relative">
        <ShadIcon 
          :name="searchQuery ? 'heroicons:magnifying-glass-circle' : 'heroicons:server-stack'" 
          class="h-20 w-20 text-base-content/30 transition-all duration-300" 
        />
        <div v-if="!searchQuery" class="absolute -top-2 -right-2">
          <ShadIcon name="heroicons:plus-circle" class="h-8 w-8 text-primary/50" />
        </div>
      </div>
        
      <div class="text-center space-y-2">
        <h3 class="text-xl font-bold text-base-content/80">
          {{ searchQuery ? 'No matching servers' : 'No servers found' }}
        </h3>
        <p class="max-w-md text-center text-base-content/60">
          {{ searchQuery ? 'Try adjusting your search terms or filters.' : "Start by inviting WolfStar to your Discord servers." }}
        </p>
      </div>
        
      <div class="flex flex-col sm:flex-row gap-3">
        <button 
          v-if="searchQuery" 
          class="btn btn-outline btn-sm gap-2 transition-all duration-200 hover:scale-105" 
          @click="clearSearch"
        >
          <ShadIcon name="heroicons:x-mark" class="h-4 w-4" />
          Clear Search
        </button>
        <button class="btn btn-primary btn-sm gap-2 transition-all duration-200 hover:scale-105 shadow-lg">
          <ShadIcon name="heroicons:rocket-launch" class="h-4 w-4" />
          Invite WolfStar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TransformedLoginData } from '~~/shared/types/discord'
import { useInfiniteScroll, useRefHistory } from '@vueuse/core'

interface EnhancedGuildCardsProps {
  guilds: TransformedLoginData['transformedGuilds'] | null
  loading?: boolean
}

const props = withDefaults(defineProps<EnhancedGuildCardsProps>(), {
  loading: false,
})

const INITIAL_COUNT = 20
const LOAD_MORE_COUNT = 10

const visibleCount = ref(INITIAL_COUNT)
const scrollComponent = ref<HTMLElement | null>(null)
const loadingMore = ref(false)

// Search and filtering
const searchQuery = ref('')
const { history: _searchHistory, undo: _undoSearch, redo: _redoSearch, canUndo: _canUndo, canRedo: _canRedo } = useRefHistory(searchQuery, {
  deep: false,
  capacity: 10, // Keep last 10 search terms
})
// is true by default because we want to show only manageable servers
const showManageableOnly = ref(true)

// Computed filtered guilds
const filteredGuilds = computed(() => {
  if (!props.guilds)
    return []

  let filtered = [...props.guilds]

  // Apply manageable filter
  if (showManageableOnly.value) {
    filtered = filtered.filter(guild => guild.manageable)
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(guild => guild.name.toLowerCase().includes(query) || guild.id.includes(query))
  }

  // Sort: manageable servers first, then alphabetically
  return filtered.sort((guildA, guildB) => {
    if (guildA.manageable !== guildB.manageable) {
      return guildA.manageable ? -1 : 1
    }
    if (guildA.wolfstarIsIn !== guildB.wolfstarIsIn) {
      return guildA.wolfstarIsIn ? -1 : 1
    }
    return guildA.name.localeCompare(guildB.name, 'en', { sensitivity: 'base' })
  })
})

const paginatedGuilds = computed(() => {
  return filteredGuilds.value.slice(0, visibleCount.value)
})

function loadMore() {
  if (loadingMore.value || visibleCount.value >= filteredGuilds.value.length)
    return

  loadingMore.value = true
  setTimeout(() => {
    visibleCount.value += LOAD_MORE_COUNT
    loadingMore.value = false
  }, 500) // Simulate loading delay
}

useInfiniteScroll(
  scrollComponent,
  () => {
    if (!props.loading)
      loadMore()
  },
  { distance: 10 },
)

function clearSearch() {
  searchQuery.value = ''
}
</script>
