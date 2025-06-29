<template>
  <Head>
    <Title>Profile</Title>
    <Meta name="description" content="Manage your profile and servers" />
  </Head>

  <div v-if="user" class="container mx-auto max-w-7xl space-y-8 px-4 py-8">
    <section class="flex flex-col items-center justify-center space-y-6 rounded-xl bg-base-200 p-12 shadow-lg">
      <ShadAvatar
        :src="isDefault ? defaultAvatar : isAnimated ? createUrl('gif', 128) : createUrl('png', 128)"
        :alt="isDefault ? 'Default Avatar' : 'Avatar'"
        size="xl"
        class="ring-4 ring-primary ring-offset-4 ring-offset-base-100 transition-all duration-300 hover:ring-primary/70"
      />
      <div class="space-y-2 text-center">
        <h1 class="text-4xl font-bold text-base-content">{{ user.name }}</h1>
        <p class="text-lg font-medium text-base-content/70">@{{ user.username || user.id }}</p>
        <p class="text-sm text-base-content/50">User ID: {{ user.id }}</p>
      </div>
    </section>

    <section class="overflow-hidden rounded-xl bg-base-200 shadow-lg">
      <div class="border-b border-base-300">
        <nav class="flex" aria-label="Profile Navigation">
          <ShadButton
            v-for="tab in profileTabs"
            :key="tab.id"
            variant="ghost"
            :color="activeTab === tab.id ? 'primary' : 'neutral'"
            class="flex items-center space-x-3 rounded-none border-b-2 px-6 py-4 text-sm font-medium transition-all duration-200"
            :class="[
              activeTab === tab.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-transparent text-base-content/70 hover:bg-base-300/50 hover:text-base-content',
            ]"
            :aria-selected="activeTab === tab.id"
            role="tab"
            @click="activeTab = tab.id"
          >
            <template #leading>
              <ShadIcon :name="tab.icon" class="h-5 w-5" />
            </template>
            {{ tab.label }}
            <span v-if="tab.id === 'servers' && guilds" class="rounded-full bg-base-content/20 px-2 py-1 text-xs">
              {{ guilds.length }}
            </span>
          </ShadButton>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="p-8">
        <!-- Servers Tab -->
        <div v-if="activeTab === 'servers'" class="space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-base-content">Servers</h2>
              <p class="mt-1 text-base-content/60">Servers you're in ({{ guilds?.length ?? 0 }} servers)</p>
            </div>
            <!-- Add Server Button - like Dyno's CTA -->
            <UiButton variant="solid" color="primary" size="sm">
              <template #leading>
                <ShadIcon name="heroicons:plus" class="h-4 w-4" />
              </template>
              Add Bot to Server
            </UiButton>
          </div>

          <ShadAlert
            v-if="error"
            color="error"
            variant="soft"
            title="Error Occurred"
            :description="error.toString()"
            icon="heroicons:exclamation-triangle"
          />

          <!-- Enhanced Server Grid -->
          <div v-else-if="guilds !== undefined" class="space-y-4">
            <guild-cards :guilds="guilds" />
          </div>
          <div v-else class="flex flex-col items-center justify-center space-y-4 py-16">
            <ShadIcon name="heroicons:server" class="h-16 w-16 text-base-content/30" />
            <p class="text-lg text-base-content/60">No servers found</p>
            <UiButton variant="outline" size="sm">Refresh</UiButton>
          </div>
        </div>

        <!-- Settings Tab -->
        <div v-else-if="activeTab === 'settings'" class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-base-content">Settings</h2>
            <p class="mt-1 text-base-content/60">Manage your account preferences</p>
          </div>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ShadCard class="shadow-md">
              <template #header>
                <h3 class="text-lg font-semibold">Theme Preferences</h3>
              </template>
              <p class="text-base-content/60">Customize your visual experience</p>
              <template #footer>
                <div class="flex justify-end">
                  <UiButton variant="solid" color="primary" size="sm">Configure</UiButton>
                </div>
              </template>
            </ShadCard>
            <ShadCard class="shadow-md">
              <template #header>
                <h3 class="text-lg font-semibold">Notification Settings</h3>
              </template>
              <p class="text-base-content/60">Control how you receive updates</p>
              <template #footer>
                <div class="flex justify-end">
                  <UiButton variant="solid" color="primary" size="sm">Manage</UiButton>
                </div>
              </template>
            </ShadCard>
          </div>
        </div>

        <!-- Premium Tab -->
        <div v-else-if="activeTab === 'premium'" class="space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-base-content">Premium</h2>
            <p class="mt-1 text-base-content/60">Unlock advanced features and support the project</p>
          </div>
          <ShadCard class="border-2 border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10">
            <div class="space-y-4 text-center">
              <ShadIcon name="heroicons:star" class="mx-auto h-12 w-12 text-primary" />
              <h3 class="text-2xl font-bold">Upgrade to Premium</h3>
              <p class="text-base-content/70">Get access to exclusive features and priority support</p>
              <div class="flex justify-center space-x-4">
                <ShadButton color="primary">Get Premium</ShadButton>
                <ShadButton variant="outline">Learn More</ShadButton>
              </div>
            </div>
          </ShadCard>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ alias: ['/account'], auth: true })

const { user } = useAuth()
const { start, finish } = useLoadingIndicator({
  duration: 2000,
  throttle: 200,
})

// Tab Management - inspired by Dyno.gg tab system
const activeTab = ref('servers')
const profileTabs = [
  {
    id: 'servers',
    label: 'Servers',
    icon: 'heroicons:server',
  },
  {
    id: 'premium',
    label: 'Premium',
    icon: 'heroicons:star',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'heroicons:cog-6-tooth',
  },
]

const error = ref<Error | null>(null)
const isAnimated = ref(false)
const isDefault = ref(false)

const {
  data: guilds,
  status,
  error: fetchError,
} = await useFetch('/api/users', {
  transform: response => response.transformedGuilds ?? null,
})

watch(fetchError, (newError) => {
  if (newError) {
    error.value = newError
    captureException(newError)
    finish({ error: true })
  }
})

const pending = ref(status.value === 'pending')

watch(pending, (isPending) => {
  if (isPending) {
    start()
  }
  else {
    finish()
  }
})

const defaultAvatar = computed(() =>
  user.value?.id
    ? `https://cdn.discordapp.com/embed/avatars/${BigInt(user.value.id) % BigInt(5)}.png`
    : 'https://cdn.discordapp.com/embed/avatars/0.png',
)

watch(
  user,
  (user) => {
    if (user?.avatar) {
      isDefault.value = false
      isAnimated.value = user.avatar.startsWith('a_')
    }
    else {
      isDefault.value = true
      isAnimated.value = false
    }
  },
  { immediate: true },
)

function createUrl(format: 'webp' | 'png' | 'gif', size: number) {
  return `https://cdn.discordapp.com/avatars/${user.value!.id}/${user.value!.avatar}.${format}?size=${size}`
}
</script>
