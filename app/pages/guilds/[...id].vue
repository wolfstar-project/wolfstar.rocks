<template>
  <div class="flex h-screen bg-base-100">
    <!-- Sidebar Navigation -->
    <div class="w-64 bg-base-200 border-r border-base-300 flex flex-col">
      <!-- Header -->
      <div class="p-6 border-b border-base-300">
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 p-4 space-y-2">
        <NuxtLink
          :to="`/guilds/${guildId}`"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          :class="route.path === `/guilds/${guildId}` ? 'bg-primary text-primary-content' : 'hover:bg-base-300'"
        >
          <Icon name="heroicons:home" class="w-5 h-5" />
          Dashboard
        </NuxtLink>

        <div class="pt-4">
          <h3 class="px-3 text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2">
            Configuration
          </h3>
          
          <NuxtLink
            v-for="navItem in navigationItems"
            :key="navItem.route"
            :to="`/guilds/${guildId}/${navItem.route}`"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="route.path.includes(navItem.route) ? 'bg-primary text-primary-content' : 'hover:bg-base-300'"
          >
            <Icon :name="navItem.icon" class="w-5 h-5" />
            {{ navItem.label }}
          </NuxtLink>
        </div>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <div class="bg-base-100 border-b border-base-300 px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold">{{ currentPageTitle }}</h2>
            <p class="text-sm text-base-content/70">{{ currentPageDescription }}</p>
          </div>
          
          <!-- Save/Reset Actions -->
          <div v-if="hasChanges" class="flex gap-3">
            <button 
              class="btn btn-outline btn-sm" 
              :class="{ loading }" 
              :disabled="loading" 
              @click="resetAllChanges"
            >
              Reset Changes
            </button>
            <button 
              class="btn btn-primary btn-sm" 
              :class="{ loading }" 
              :disabled="loading" 
              @click="submitChanges"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <component
        :is="resolveComponent('GuildSettingsGeneral')"
        :languages="languages"
      />
      


      <!-- Settings Component (when not on dashboard) -->
      <div v-if="readyToRender" class="p-6">
        <!-- Channel Settings -->
        <component
          :is="resolveComponent('GuildSettingsChannel')"
          v-if="currentRoute === 'channels'"
        />

        <!-- Role Settings -->
        <component
          :is="resolveComponent('GuildSettingsRole')"
          v-else-if="currentRoute === 'roles'"
        />

        <!-- Moderation Settings -->
        <component
          :is="resolveComponent('GuildSettingsModeration')"
          v-else-if="currentRoute === 'moderation'"
        />

        <!-- Event Settings -->
        <component
          :is="resolveComponent('GuildSettingsEvent')"
          v-else-if="currentRoute === 'events'"
        />

        <!-- Disabled Commands Settings -->
        <component
          :is="resolveComponent('GuildSettingsDisabledCommands')"
          v-else-if="currentRoute === 'disabled-commands'"
          :commands="commands"
          @update:commands="(newCommands: FlattenedCommand[]) => emit('update:commands', newCommands)"
        />

        <!-- Fallback for unknown routes -->
        <div v-else class="text-center py-8">
          <h3 class="text-lg font-semibold mb-2">Page Not Found</h3>
          <p class="text-base-content/70 mb-4">The requested settings page could not be found.</p>
          <NuxtLink :to="`/guilds/${guildId}`" class="btn btn-primary">
            Return to Dashboard
          </NuxtLink>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="flex items-center justify-center h-full">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    </div>
  </div>

  <!-- Floating Save Notification (for mobile) -->
  <!---<Transition name="slide-up">
    <div v-if="hasChanges" class=" sm:inline hidden fixed bottom-0 left-0 right-0 bg-base-300 border-t border-base-300 p-4 gap-3 z-50">
      <button class="btn btn-outline flex-1" :class="{ loading }" :disabled="loading" @click="resetAllChanges">
        Reset
      </button>
      <button class="btn btn-primary flex-1" :class="{ loading }" :disabled="loading" @click="submitChanges">
        Save Changes
      </button>
    </div>
  </Transition>-->
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'
import type { GuildData } from '~~/server/database'
import type { FlattenedCommand } from '~~/shared/types/discord'
import { useRouteParams } from '@vueuse/router'
import { useToast } from '@/composables/useToast'

// Define emits
const emit = defineEmits<{
  'update:commands': [commands: FlattenedCommand[]]
}>()

const route = useRoute()
const router = useRouter()
const guildId = useRouteParams('guildId')
const toast = useToast()

// Validate Guild ID format (Discord Snowflake: 17-19 digit string)
function isValidGuildId(id: string | string[]): boolean {
  if (!id || Array.isArray(id)) return false
  const snowflakeRegex = /^\d{17,19}$/
  return snowflakeRegex.test(id)
}

// Use composables and stores
const { settings, resetChanges, hasChanges, changes } = useGuildSettings()
const guildData = ref<FlattenedGuild | null>(null)
const commandsStore = CommandsStore()
const languagesStore = LanguagesStore()

const loading = ref(true)

// Computed values from stores
const commands = computed(() => commandsStore.commands)
const languages = computed(() => languagesStore.languages)

async function fetchData() {
  try {
    loading.value = true

    // Validate guild ID first
    if (!guildId.value || !isValidGuildId(guildId.value as string)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid Guild ID',
        message: 'The provided guild ID is not valid. Guild IDs must be 17-19 digit numbers.',
      })
    }

    const [guildDataResult, guildSettings] = await Promise.all([
      $fetch(`/api/guilds/${guildId.value}`).catch((error) => {
        if (error.status === 404) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Guild Not Found',
            message: 'The requested guild was not found or you do not have access to it.',
          })
        }
        if (error.status === 403) {
          throw createError({
            statusCode: 403,
            statusMessage: 'Access Forbidden',
            message: 'You do not have permission to manage this guild.',
          })
        }
        throw error
      }),
      $fetch(`/api/guilds/${guildId.value}/settings`).catch((error) => {
        if (error.status === 404) {
          throw createError({
            statusCode: 404,
            statusMessage: 'Guild Settings Not Found',
            message: 'Settings for this guild could not be found.',
          })
        }
        throw error
      }),
    ])

    // Set guild data
    guildData.value = guildDataResult

    // Fetch commands and languages from stores
    await Promise.all([commandsStore.fetchCommands(), languagesStore.fetchLanguages()])

    // Update settings state with the received settings
    if (guildSettings && typeof guildSettings === 'object') {
      changes(guildSettings as unknown as GuildData)
    }
  }
  catch (error) {
    useLogger().error('Error fetching data:', error)
    await handleError(error as NuxtError<unknown>)
  }
  finally {
    loading.value = false
  }
}

async function handleError(error: NuxtError<unknown> | Error) {
  const nuxtError = error as NuxtError<unknown>
  
  // Handle specific error cases
  switch (nuxtError.statusCode) {
    case 400:
      toast.add({
        color: 'error',
        title: 'Invalid Request',
        description: nuxtError.message || 'The guild ID provided is not valid.',
        actions: [{
          label: 'Go Home',
          onClick: (event: MouseEvent) => {
            event.preventDefault()
            router.push('/')
          },
        }],
      })
      break
    case 401: {
      const auth = useAuth()
      await auth.clear()
      toast.add({
        color: 'error',
        title: 'Authentication Error',
        description: 'Your session has expired. Please log in again.',
        actions: [{
          label: 'Login',
          onClick: (event: MouseEvent) => {
            event.preventDefault()
            router.push('/login')
          },
        }],
      })
      break
    }
    case 403:
      toast.add({
        color: 'error',
        title: 'Access Denied',
        description: nuxtError.message || 'You do not have permission to access this guild.',
        actions: [{
          label: 'Go Home',
          onClick: (event: MouseEvent) => {
            event.preventDefault()
            router.push('/')
          },
        }],
      })
      break
    case 404:
      toast.add({
        color: 'error',
        title: 'Not Found',
        description: nuxtError.message || 'The requested guild could not be found.',
        actions: [{
          label: 'Go Home',
          onClick: (event: MouseEvent) => {
            event.preventDefault()
            router.push('/')
          },
        }],
      })
      break
    default:
      toast.add({
        color: 'error',
        title: 'Operation Failed',
        description: nuxtError.message || 'An unexpected error occurred.',
      })
  }
}

async function submitChanges() {
  try {
    loading.value = true

    if (!guildId.value || !isValidGuildId(guildId.value as string)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid guild ID',
      })
    }

    // Update settings using PATCH endpoint
    const settingsChanges = await $fetch(`/api/guilds/${guildId.value}/settings`, {
      method: 'PATCH',
      body: {
        data: Object.entries(settings.value ?? {}),
      },
    })

    if (!settingsChanges) {
      throw createError({
        statusCode: 500,
        message: 'Failed to update settings',
      })
    }

    // Fetch updated settings
    const data = await $fetch(`/api/guilds/${guildId.value}/settings`, {
      method: 'GET',
      query: {
        shouldSerialize: true,
      },
    })

    if (typeof data !== 'string') {
      changes(data as unknown as GuildData)
    }

    resetAllChanges()
    toast.add({
      color: 'error',
      title: 'Settings Updated',
      description: 'Settings updated successfully',
    })
  }
  catch (error) {
    await handleError(error as NuxtError<unknown>)
  }
  finally {
    loading.value = false
  }
}

function resetAllChanges() {
  // Reset all changes instead of resetting by key
  if (settings.value && Object.keys(settings.value).length > 0) {
    Object.keys(settings.value).forEach((key) => {
      resetChanges(key as keyof GuildData)
    })
  }
}

const readyToRender = computed(
  () => !loading.value && guildData.value && settings.value && Object.keys(guildData.value).length > 0 && Object.keys(settings.value).length > 0,
)

const currentRoute = computed(() => {
  const path = route.path
  if (path === `/guilds/${guildId.value}`) return 'general'
  
  const segment = path.split('/').pop()
  const navItem = navigationItems.value.find(item => item.route === segment)
  return navItem?.route || 'general'
})

// Navigation items for sidebar
const navigationItems = computed(() => [
  {
    route: 'general',
    label: 'General',
    icon: 'heroicons:cog-6-tooth',
  },
  {
    route: 'moderation',
    label: 'Moderation',
    icon: 'heroicons:shield-check',
  },
  {
    route: 'channels',
    label: 'Channels',
    icon: 'heroicons:hashtag',
  },
  {
    route: 'roles',
    label: 'Roles',
    icon: 'heroicons:user-group',
  },
  {
    route: 'events',
    label: 'Events',
    icon: 'heroicons:bell',
  },
  {
    route: 'disabled-commands',
    label: 'Commands',
    icon: 'heroicons:command-line',
  },
])

// Page title and description
const currentPageTitle = computed(() => {
  const path = route.path
  if (path === `/guilds/${guildId.value}`) return 'Dashboard'
  
  const segment = path.split('/').pop()
  const navItem = navigationItems.value.find(item => item.route === segment)
  return navItem?.label || 'Settings'
})

const currentPageDescription = computed(() => {
  const path = route.path
  if (path === `/guilds/${guildId.value}`) return 'Overview of your server settings and quick actions'
  
  const descriptions: Record<string, string> = {
    general: 'Configure basic bot settings like prefix and language',
    moderation: 'Set up moderation features and punishments',
    channels: 'Configure logging and special channels',
    roles: 'Manage role assignments and permissions',
    events: 'Configure event logging and notifications',
    'disabled-commands': 'Enable or disable specific bot commands',
  }
  
  const segment = path.split('/').pop()
  return descriptions[segment || ''] || 'Configure your server settings'
})







useHead({
  title: computed(() => `${guildData.value?.name ?? 'Guild'} Settings`),
  meta: [
    {
      name: 'description',
      content: 'Manage your guild settings',
    },
  ],
})

onMounted(fetchData)
</script>

<style scoped>
@reference "@/assets/css/main.css";
.fade-enter-active,
.fade-leave-active {
  @apply transition-all duration-300 ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  @apply translate-y-full opacity-0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  @apply transition-all duration-300 ease-in-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  @apply translate-y-full opacity-0;
}

/* Custom scrollbar for better appearance */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  @apply bg-base-content/20;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  @apply bg-base-content/30;
}

/* Improve navigation link active state */
.nav-link-active {
  @apply bg-primary text-primary-content shadow-sm;
}

/* Feature card hover effects */
.feature-card:hover {
  @apply shadow-lg transform scale-[1.02] transition-all duration-200;
}

/* Loading state improvements */
.settings-loading {
  @apply flex items-center justify-center h-64;
}

/* Mobile responsive improvements */
@media (max-width: 768px) {
  .w-64 {
    @apply w-16;
  }

  .sidebar-text {
    @apply hidden;
  }

  .sidebar-icon {
    @apply mx-auto;
  }
}

/* Sidebar animation */
.sidebar-enter-active,
.sidebar-leave-active {
  @apply transition-transform duration-300 ease-in-out;
}

.sidebar-enter-from,
.sidebar-leave-to {
  @apply -translate-x-full;
}
</style>
