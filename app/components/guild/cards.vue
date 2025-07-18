<template>
  <!-- Enhanced Guild Cards Grid - inspired by Dyno.gg -->
  <div class="guild-cards-container space-y-6">
    <!-- Filter/Search Section -->
    <div v-if="!loading" class="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div class="flex items-center space-x-4">
        <div class="relative">
          <ShadIcon name="heroicons:magnifying-glass-circle" class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-primary/60 transition-colors hover:text-primary" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search servers..." 
            class="input-bordered input w-full pl-11 sm:w-64 transition-all duration-200 focus:border-primary/50"
            :disabled="loading"
          />
        </div>
        <div class="form-control">
          <label class="label cursor-pointer space-x-2 transition-all duration-200 hover:bg-base-200/50 rounded-lg px-2 py-1">
            <input 
              v-model="showManageableOnly" 
              type="checkbox" 
              class="checkbox checkbox-sm checkbox-primary"
              :disabled="loading"
            />
            <span class="label-text text-sm flex items-center space-x-1">
              <ShadIcon name="heroicons:shield-check" class="h-3 w-3 text-primary/70" />
              <span>Manageable only</span>
            </span>
          </label>
        </div>
      </div>
      <div class="text-sm text-base-content/60">
        <span v-if="!loading">
          {{ filteredGuilds.length }} of {{ guilds?.length || 0 }} servers
        </span>
      </div>
    </div>

    <!-- Loading Filter Skeleton -->
    <div v-else class="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div class="flex items-center space-x-4">
        <div class="skeleton h-12 w-64 rounded-lg"></div>
        <div class="skeleton h-6 w-32 rounded"></div>
      </div>
      <div class="skeleton h-4 w-24 rounded"></div>
    </div>

    <!-- Loading Skeleton Grid -->
    <div v-if="loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <guild-card-skeleton v-for="i in 12" :key="`skeleton-${i}`" class="h-full" />
    </div>

    <!-- Virtual List Container -->
    <div 
      v-else-if="!loading && filteredGuilds.length > 0" 
      class="overflow-auto rounded-lg border border-base-300"
      :style="{ height: `${props.containerHeight}px` }"
      v-bind="containerProps"
    >
      <div v-bind="wrapperProps">
        <div
          v-for="{ data: rowGuilds, index } in list"
          :key="index"
          class="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          <guild-card
            v-for="guild in rowGuilds"
            :key="guild.id"
            :guild="guild"
            class="h-full"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && filteredGuilds.length === 0" class="flex flex-col items-center justify-center space-y-6 py-16">
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
import { useVirtualList } from '@vueuse/core'

interface EnhancedGuildCardsProps {
  guilds: TransformedLoginData['transformedGuilds'] | null
  loading?: boolean
  itemHeight?: number
  containerHeight?: number
  itemsPerRow?: number
}

const props = withDefaults(defineProps<EnhancedGuildCardsProps>(), {
  loading: false,
  itemHeight: 280, // Altezza approssimativa di una guild card
  containerHeight: 600, // Altezza del container virtuale  
  itemsPerRow: 5, // Numero di elementi per riga (xl:grid-cols-5)
})

// Search and filtering
const searchQuery = ref('')
const showManageableOnly = ref(false)

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

// Convert guilds to rows for virtual list (5 items per row)
const guildRows = computed(() => {
  const rows = []
  for (let i = 0; i < filteredGuilds.value.length; i += props.itemsPerRow) {
    rows.push(filteredGuilds.value.slice(i, i + props.itemsPerRow))
  }
  return rows
})

// Virtual list setup
const { list, containerProps, wrapperProps } = useVirtualList(
  guildRows,
  {
    itemHeight: props.itemHeight,
  }
)

function clearSearch() {
  searchQuery.value = ''
}
</script>
