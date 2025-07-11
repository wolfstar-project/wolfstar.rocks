<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div ref="navbar" class="app-navbar" :class="y > 100 ? 'bg-base-200/80 backdrop-blur-sm' : 'bg-transparent'">
    <div class="navbar-start">
      <div class="dropdown">
        <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
          <ShadIcon name="ph:list" class="h-5 w-5" />
        </div>
        <ul tabindex="0" class="dropdown-content menu z-[1] mt-3 w-32 menu-sm rounded-box bg-base-100 p-2 shadow-lg">
          <li>
            <a>Features</a>
            <ul class="p-2">
              <li><a>Moderation</a></li>
              <li><a>AutoMod</a></li>
              <li><a>Logging</a></li>
            </ul>
          </li>
          <li>
            <a>Applications</a>
            <ul class="p-2">
              <li>
                <nuxt-link to="/">
                  <ShadIcon name="ph:shield-duotone" class="h-4 w-4 text-branding-wolfstar" />
                  WolfStar
                </nuxt-link>
              </li>
              <li>
                <nuxt-link to="/staryl">
                  <ShadIcon name="ph:books-duotone" class="h-4 w-4 text-branding-staryl" />
                  Staryl
                </nuxt-link>
              </li>
            </ul>
          </li>
          <li>
            <!-- <nuxt-link to="/commands">
              <ShadIcon name="ph:list" class="h-4 w-4" />
              Commands
            </nuxt-link> -->
          </li>
          <li>
            <nuxt-link :to="currentApp.invite">
              <ShadIcon name="ph:plus-circle-duotone" class="h-4 w-4 text-success" />
              Invite App
            </nuxt-link>
          </li>
        </ul>
      </div>
      <nuxt-link class="flex items-center transition-transform hover:scale-105" :to="currentApp.landing">
        <icons-wolfstar class="h-10 w-10" />
        <h1 class="ml-2 text-2xl font-bold">{{ currentApp.name }}</h1>
      </nuxt-link>
    </div>

    <div class="navbar-center hidden lg:flex">
      <div class="group dropdown-hover dropdown">
        <div tabindex="0" role="button" class="btn m-1 items-center btn-ghost transition-all group-hover:text-white">
          Features
          <ShadIcon name="ph:caret-down" class="rotate-0 transition-all group-hover:rotate-180" />
        </div>
        <ul tabindex="0" class="dropdown-content menu z-[1] w-52 rounded-box bg-base-100 p-2 shadow">
          <li><a>Moderation Tools</a></li>
          <li><a>Advanced Logging</a></li>
        </ul>
      </div>

      <div class="group dropdown-hover dropdown">
        <div tabindex="0" role="button" class="btn m-1 items-center btn-ghost transition-all group-hover:text-white">
          Applications
          <ShadIcon name="ph:caret-down" class="rotate-0 transition-all group-hover:rotate-180" />
        </div>
        <ul tabindex="0" class="dropdown-content menu z-[1] w-52 rounded-box bg-base-100 p-2 shadow">
          <li>
            <nuxt-link to="/">
              <ShadIcon name="ph:shield-duotone" class="h-4 w-4 text-branding-wolfstar" />
              WolfStar
            </nuxt-link>
          </li>
          <li>
            <nuxt-link to="/staryl">
              <ShadIcon name="i-lucide-twitch" class="h-4 w-4 text-branding-staryl" />
              Staryl
            </nuxt-link>
          </li>
        </ul>
      </div>

      <!-- <nuxt-link to="/commands" class="btn btn-ghost transition-colors hover:text-primary">
        Commands
        <ShadIcon name="ph:list" />
      </nuxt-link> -->

      <nuxt-link :to="currentApp.invite" class="btn btn-ghost transition-colors hover:text-success">
        Invite App
        <ShadIcon name="ph:plus-circle-duotone" />
      </nuxt-link>
    </div>

    <div class="navbar-end">
      <AuthState>
        <template #default="{ loggedIn, clear }">
          <div v-if="loggedIn" class="group dropdown dropdown-bottom dropdown-end">
            <!-- Avatar Button -->
            <div
              tabindex="0"
              role="button"
              class="group btn relative z-10 flex items-center justify-center gap-x-2 btn-ghost transition-colors hover:bg-base-200 focus-visible:bg-base-200"
              aria-expanded="false"
              aria-haspopup="menu"
            >
              <!-- Avatar Container -->
              <div
                class="size-8 overflow-hidden rounded-full bg-base-300 ring-2 ring-base-100"
              >
                <!-- Default Avatar -->
                <img
                  v-if="isDefault"
                  :src="defaultAvatar"
                  alt="Default Avatar"
                  class="h-full w-full object-cover"
                  decoding="async"
                  crossorigin="anonymous"
                />
                <!-- Custom Avatar -->
                <picture v-else>
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
                    alt="User Avatar"
                    class="h-full w-full object-cover"
                    decoding="async"
                    crossorigin="anonymous"
                  />
                </picture>
              </div>

              <span v-if="user" class="hidden font-semibold sm:inline">{{ user.globalName ?? user.username }}</span>
            </div>

            <!-- Dropdown Menu -->
            <ul tabindex="0" class="dropdown-content menu z-1 w-56 translate-y-2 rounded-box bg-base-100 p-2 shadow-lg">
              <li>
                <nuxt-link to="/profile" class="gap-2 rounded-md px-3 py-2 text-sm font-medium text-base-content hover:bg-base-200">
                  <ShadIcon name="ph:user" class="h-4 w-4 opacity-70" />
                  Profile
                </nuxt-link>
              </li>
              <li>
                <a variant="ghost" class="gap-2 rounded-md px-3 py-2 text-sm font-medium text-error hover:bg-error/10" @click="clear">
                  <ShadIcon name="ph:sign-out" class="h-4 w-4 opacity-70" />
                  Logout
                </a>
              </li>
            </ul>
          </div>
          <ShadButton
            v-else
            color="#5865F2"
            active-color="#5865F2"
            size="md"
            to="/login"
          >
            <template #leading>
              <ShadIcon name="ic:baseline-discord" class="size-[16px] sm:size-[24px]" />
            </template>
            <template #default>
              <span class="hidden sm:inline">Login</span>
            </template>
          </ShadButton>
        </template>
        <template #placeholder>
          <ShadButton
            disabled
            color="#5865F2"
            size="md"
          >
            <template #leading>
              <ShadIcon name="ic:baseline-discord" class="size-[16px] sm:size-[24px]" />
            </template>
            <template #default>
              <span class="hidden sm:inline">Login</span>
            </template>
          </ShadButton>
        </template>
      </AuthState>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/auth'
import { Invites } from '~/utils/constants'

const { y } = useScroll(document)

// Safely inject appName with fallback to prevent SSR issues
const appName = inject(ProviderAppNameKey, ref<'wolfstar' | 'staryl'>('wolfstar'))

const Apps = {
  wolfstar: { name: 'WolfStar', invite: Invites.WolfStar, landing: '/' },
  staryl: { name: 'Staryl', invite: Invites.Staryl, landing: '/staryl' },
}

const { user } = useAuth()

const isAnimated = ref(false)
const isDefault = ref(false)

// Computed properties for consistent state
const defaultAvatar = computed(
  () => `https://cdn.discordapp.com/embed/avatars/${user.value && user.value.id ? BigInt(user.value.id) % BigInt(5) : '0'}.png`,
)

const currentApp = computed(() => {
  const appKey = unref(appName)
  return Apps[appKey] || Apps.wolfstar
})

// Watch user changes for avatar state
watch(
  user,
  (user) => {
    if (user && user.avatar) {
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

function makeSrcset(format: 'webp' | 'png' | 'gif') {
  return `${createUrl(format, 64)} 1x, ${createUrl(format, 128)} 2x, ${createUrl(format, 256)} 3x, ${createUrl(format, 512)} 4x`
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.app-navbar {
  @apply navbar sticky top-2 z-50 rounded-xl drop-shadow-lg;
  align-self: center;
  transition-duration: 250ms;
  transition-property: background-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  width: calc(100% - 1rem);
}
</style>
