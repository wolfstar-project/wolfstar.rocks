<template>
  <div class="container mx-auto px-4 py-8">
    <template v-if="!guildId">
      <ShadAlert variant="solid" color="error" title="Missing Guild ID" icon="emojione:warning">
        <template #description>
          Please use the <code>Login</code> button instead or click <NuxtLink to="/login" class="font-medium underline">here</NuxtLink>.
        </template>
      </ShadAlert>
    </template>
    <template v-else-if="error">
      <ShadAlert variant="solid" color="error" title="Authentication Error" icon="emojione:cross-mark">
        <template #description>
          {{ error }}
        </template>
        <template #actions>
          <ShadButton to="/login" size="sm" variant="outline"> Return to Login </ShadButton>
        </template>
      </ShadAlert>
    </template>
    <template v-else>
      <ShadAlert color="info" icon="emojione:hourglass-done" title="Redirecting">
        <template #description> Redirecting you to the guild page... </template>
      </ShadAlert>
    </template>
  </div>
</template>

<script setup lang="ts">
import { promiseTimeout } from '@vueuse/core'
const route = useRoute()
const { user } = useAuth()
const guildId = computed(() => (route.query.guildid as string) || null)
const error = ref<string | null>(null)

const { start, finish } = useLoadingIndicator({
  duration: 2000, 
})

if (!user.value) {
  error.value = 'You must be logged in to add the bot to a server'
}

if (import.meta.client && guildId.value && !error.value) {
  start()
  navigateToGuild()
}

async function navigateToGuild() {
  try {
    if (!guildId.value) {
      error.value = 'No guild ID provided'
      finish()
      return
    }

    if (!user.value) {
      error.value = 'Authentication required'
      finish()
      return
    }
    await promiseTimeout(1500);

    await navigateTo(`/guilds/${guildId.value}`)
  }
  catch (err) {
    error.value = 'Failed to navigate to guild page, please try again later.'
    console.error('Guild navigation error:', err)
  }
  finally {
    finish()
  }
}

useSeoMeta({
  title: 'Auth Guild Callback',
  robots: { none: true },
  ogTitle: 'OAuth Guild Callback',
  ogDescription: 'A landing page for the OAuth2.0 guild callback flow.',
})
</script>
