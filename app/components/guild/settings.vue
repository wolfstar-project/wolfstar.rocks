<template>
  <div>
    <div class="flex h-screen">
      <div class="mt-16 flex flex-grow flex-col overflow-y-scroll bg-base-300 p-4 text-base-content sm:mt-0">
        <component
          :is="settingsComponent"
          v-if="readyToRender"
          :commands="commands"
          :languages="languages"
          :guild-data="guildData"
          :guild-settings="settings"
          :guild-settings-changes="changes"
          @update:settings="changes"
        />

        <Transition name="fade">
          <div v-if="hasChanges" class="fixed right-0 bottom-0 left-0 flex justify-end gap-4 bg-base-300 p-4 shadow-lg">
            <button class="btn btn-outline" :class="{ loading }" :disabled="loading" @click="resetAllChanges">Reset Changes</button>

            <button class="btn btn-primary" :class="{ loading }" :disabled="loading" @click="submitChanges">Save Changes</button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'
import type { GuildData } from '~~/shared/types/database'
import { useRouteParams } from '@vueuse/router'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const guildId = useRouteParams('guildId')

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

    if (!guildId.value) {
      throw createError({
        statusCode: 400,
        message: 'Guild ID not found',
      })
    }

    const [guildDataResult, guildSettings] = await Promise.all([
      $fetch(`/api/guilds/${guildId.value}`),
      $fetch(`/api/guilds/${guildId.value}/settings`),
    ])

    // Set guild data using the composable
    guildData.value = guildDataResult

    // Fetch commands and languages from stores
    await Promise.all([commandsStore.fetchCommands(), languagesStore.fetchLanguages()])

    // Update settings state with the received settings
    if (guildSettings && typeof guildSettings === 'object') {
      changes(guildSettings as GuildData)
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

async function handleError(error: NuxtError<unknown>) {
  if (error.statusCode === 401) {
    // Check if clear method exists in auth
    const auth = useAuth()
    await auth.clear()
    await router.push('/')
  }
  else {
    toast.error('An error occurred. Please try again.')
  }
}

async function submitChanges() {
  try {
    loading.value = true

    if (!guildId.value) {
      throw createError({
        statusCode: 500,
        message: 'Guild ID not found',
      })
    }

    if (typeof guildId.value === 'string') {
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
        changes(data as GuildData)
      }

      resetAllChanges()
      toast.success('Settings updated successfully')
    }
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

const settingsComponent = computed(() =>
  defineAsyncComponent(() => import(`@/app/components/guild/Settings/${route.fullPath.split('/').slice(2).join('/')}.vue`)),
)

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
.fade-enter-active,
.fade-leave-active {
  @apply transition-all duration-300 ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  @apply translate-y-full opacity-0;
}
</style>
