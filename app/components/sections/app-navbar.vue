<!-- eslint-disable vue/no-unused-refs -->
<template>
    <div ref="navbar" class="app-navbar" :class="y > 100 ? 'bg-base-200/80 backdrop-blur-xs' : 'bg-transparent'">
        <div class="navbar-start">
            <div class="dropdown">
                <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
                    <ShadIcon name="ph:list" class="h-5 w-5" />
                </div>
                <ul tabindex="0" class="dropdown-content menu z-[1] mt-3 w-32 menu-sm rounded-box bg-base-100 p-2 shadow-lg">
                    <li>
                        <a>Features</a>
                        <ul class="p-2">
                            <li><a>Submenu 1</a></li>
                            <li><a>Submenu 2</a></li>
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
                                    <ShadIcon name="ph:books-duotone" class="text-branding-teryl h-4 w-4" />
                                    Starly
                                </nuxt-link>
                            </li>
                        </ul>
                    </li>
                    <li>
                        <nuxt-link to="/commands"> <ShadIcon name="ph:list" /> Commands </nuxt-link>
                    </li>
                    <li>
                        <nuxt-link :to="App.invite"> <ShadIcon name="ph:plus-circle-duotone" class="text-success" /> Invite App </nuxt-link>
                    </li>
                </ul>
            </div>
            <nuxt-link class="flex items-center" :to="App.landing">
                <icons-wolfstar class="h-10 w-10" />
                <h1 class="ml-2 text-2xl font-bold">{{ App.name }}</h1>
            </nuxt-link>
        </div>
        <div class="navbar-center hidden lg:flex">
            <div class="group dropdown-hover dropdown">
                <div tabindex="0" role="button" class="btn m-1 items-center btn-ghost transition-all group-hover:text-white">
                    Features
                    <ShadIcon name="ph:caret-down" class="rotate-0 transition-all group-hover:rotate-180" />
                </div>
                <ul tabindex="0" class="dropdown-content menu z-[1] w-52 rounded-box bg-base-100 p-2 shadow">
                    <li><a>Item 1</a></li>
                    <li><a>Item 2</a></li>
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
                            <ShadIcon name="i-lucide-twitch" class="text-branding-staryl h-4 w-4" />
                            Teryl
                        </nuxt-link>
                    </li>
                </ul>
            </div>

            <nuxt-link :to="App.invite" class="btn btn-ghost transition-colors hover:text-success">
                Invite App
                <ShadIcon name="ph:plus-circle-duotone" />
            </nuxt-link>
            <nuxt-link to="/commands" class="btn btn-ghost">
                Commmands
                <ShadIcon name="ph:list" />
            </nuxt-link>
        </div>
        <div class="navbar-end">
            <div><layout-change-theme /></div>
            <AuthState>
                <template #default="{ loggedIn, clear }">
                    <div v-if="loggedIn" class="group dropdown dropdown-end">
                        <!-- Avatar Button -->
                        <div
                            tabindex="0"
                            role="button"
                            class="group btn relative z-10 flex btn-circle h-10 w-10 items-center justify-center p-0.5 btn-ghost transition-colors hover:bg-base-200 focus-visible:bg-base-200"
                            aria-expanded="false"
                            aria-haspopup="menu"
                        >
                            <!-- Avatar Container -->
                            <div
                                class="size-full overflow-hidden rounded-full bg-base-300 ring-2 ring-base-100 transition-transform group-hover:scale-95"
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
                    <button v-else class="btn bg-[#5865F2] text-white hover:bg-[#5865F2]/50" @click="() => $router.push('/login')">
                        <ShadIcon name="ic:baseline-discord" class="size-[16px] sm:size-[24px]" />
                        <span class="hidden sm:inline">Login</span>
                    </button>
                </template>
                <template #placeholder>
                    <button disabled class="btn bg-[#5865F2] text-white disabled:opacity-65">
                        <ShadIcon name="ic:baseline-discord" class="size-[16px] sm:size-[24px]" />
                        <span class="hidden sm:inline">Login</span>
                    </button>
                </template>
            </AuthState>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/auth';
import { Invites } from '~/utils/constants';

const { y } = useScroll(document);

const appName = inject(ProviderAppNameKey)!;

const Apps = {
    wolfstar: { name: 'WolfStar', invite: Invites.WolfStar, landing: '/' },
    staryl: { name: 'Staryl', invite: Invites.Staryl, landing: '/staryl' },
};

const { user } = useAuth();

const isAnimated = ref(false);
const isDefault = ref(false);

const defaultAvatar = computed(() =>
    user.value?.id
        ? `https://cdn.discordapp.com/embed/avatars/${BigInt(user.value.id) % BigInt(5)}.png`
        : 'https://cdn.discordapp.com/embed/avatars/0.png',
);

watch(
    user,
    (user) => {
        if (user?.avatar) {
            isDefault.value = false;
            isAnimated.value = user.avatar.startsWith('a_');
        }
        else {
            isDefault.value = true;
            isAnimated.value = false;
        }
    },
    { immediate: true },
);

function createUrl(format: 'webp' | 'png' | 'gif', size: number) {
    return `https://cdn.discordapp.com/avatars/${user.value!.id}/${user.value!.avatar}.${format}?size=${size}`;
}

function makeSrcset(format: 'webp' | 'png' | 'gif') {
    return `${createUrl(format, 64)} 1x, ${createUrl(format, 128)} 2x, ${createUrl(format, 256)} 3x, ${createUrl(format, 512)} 4x`;
}

const App = computed(() => Apps[appName.value] ?? Apps.wolfstar);
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
