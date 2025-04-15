<template>
	<div ref="navbar" class="app-navbar" :class="y > 100 ? 'bg-base-200/80 backdrop-blur-xs' : 'bg-transparent'">
		<div class="navbar-start">
			<div class="dropdown">
				<div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
					<ShadIcon name="ph:list" class="h-5 w-5" />
				</div>
				<ul tabindex="0" class="menu dropdown-content menu-sm rounded-box bg-base-100 z-[1] mt-3 w-32 p-2 shadow-lg">
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
									<ShadIcon name="ph:shield-duotone" class="text-branding-wolfstar h-4 w-4" />
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
						<nuxt-link :to="App.invite"><ShadIcon name="ph:plus-circle-duotone" class="text-success" /> Invite App</nuxt-link>
					</li>
					<li>
						<nuxt-link to="/commands" class="btn btn-ghost"><ShadIcon name="ph:list" /> Commmands </nuxt-link>
					</li>
				</ul>
			</div>
			<nuxt-link class="flex items-center" :to="App.landing">
				<icons-wolfstar class="h-10 w-10" />
				<h1 class="ml-2 text-2xl font-bold">{{ App.name }}</h1>
			</nuxt-link>
		</div>
		<div class="navbar-center hidden lg:flex">
			<div class="group dropdown dropdown-hover">
				<div tabindex="0" role="button" class="btn btn-ghost m-1 items-center transition-all group-hover:text-white">
					Features
					<ShadIcon name="ph:caret-down" class="rotate-0 transition-all group-hover:rotate-180" />
				</div>
				<ul tabindex="0" class="menu dropdown-content rounded-box bg-base-100 z-[1] w-52 p-2 shadow">
					<li><a>Item 1</a></li>
					<li><a>Item 2</a></li>
				</ul>
			</div>
			<div class="group dropdown dropdown-hover">
				<div tabindex="0" role="button" class="btn btn-ghost m-1 items-center transition-all group-hover:text-white">
					Applications
					<ShadIcon name="ph:caret-down" class="rotate-0 transition-all group-hover:rotate-180" />
				</div>
				<ul tabindex="0" class="menu dropdown-content rounded-box bg-base-100 z-[1] w-52 p-2 shadow">
					<li>
						<nuxt-link to="/">
							<ShadIcon name="ph:shield-duotone" class="text-branding-wolfstar h-4 w-4" />
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

			<nuxt-link :to="App.invite" class="btn btn-ghost hover:text-success transition-colors">
				Invite App
				<ShadIcon name="ph:plus-circle-duotone" />
			</nuxt-link>
			<nuxt-link to="/commands" class="btn btn-ghost">Commmands <ShadIcon name="ph:list" /> </nuxt-link>
		</div>
		<div class="navbar-end">
			<div class="flex gap-2">
				<layout-change-theme />
			</div>
			<div class="flex gap-2">
				<AuthState>
					<template #default="{ loggedIn, clear }">
						<div v-if="loggedIn" class="dropdown dropdown-end">
							<div tabindex="0" class="btn btn-ghost btn-circle avatar">
								<div class="w-10 rounded-full">
									<img v-if="isDefault" :src="defaultAvatar" alt="Default Avatar" decoding="async" crossorigin="anonymous" />
									<picture v-else>
										<source
											v-if="isAnimated"
											media="(prefers-reduced-motion: no-preference), (prefers-reduced-data: no-preference)"
											type="image/gif"
											:srcset="makeSrcset('gif')"
										/>
										<source type="image/webp" :srcset="makeSrcset('webp')" />
										<source type="image/png" :srcset="makeSrcset('png')" />
										<img :src="createUrl('png', 128)" alt="Avatar" decoding="async" crossorigin="anonymous" />
									</picture>
								</div>
							</div>
							<ul tabindex="0" class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
								<li>
									<nuxt-link to="/profile" class="justify-between">
										Profile
										<span class="badge badge-sm">New</span>
									</nuxt-link>
								</li>
								<li><a @click="clear">Logout</a></li>
							</ul>
						</div>
						<NuxtLink v-else class="btn bg-[#5865F2] text-white" to="/login">
							<ShadIcon name="ic:baseline-discord" class="size-[24px]" />
							Login
						</NuxtLink>
					</template>
					<template #placeholder>
						<button disabled class="btn bg-[#5865F2] text-white disabled:opacity-65">
							<ShadIcon name="ic:baseline-discord" class="size-[24px]" />
							Login
						</button>
					</template>
				</AuthState>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useAuth } from '~/composables/auth';

const { y } = useScroll(document);

const appName = inject(ProviderAppNameKey)!;

const Apps = {
	wolfstar: { name: 'WolfStar', invite: Invites.WolfStar, landing: '/' },
	staryl: { name: 'Staryl', invite: Invites.Staryl, landing: '/staryl' }
};

const { session } = useAuth();

const loadingPack = ref(false);
const isAnimated = ref(false);
const isDefault = ref(false);

// Fetch session on mount
onMounted(async () => {
	try {
		// Fetch pack data after successful session
		loadingPack.value = true;
	} finally {
		loadingPack.value = false;
	}
});

const defaultAvatar = computed(() =>
	session.value.user?.id
		? `https://cdn.discordapp.com/embed/avatars/${BigInt(session.value.user.id) % BigInt(5)}.png`
		: 'https://cdn.discordapp.com/embed/avatars/0.png'
);

watch(
	session,
	({ user }) => {
		if (user?.avatar) {
			isDefault.value = false;
			isAnimated.value = user.avatar.startsWith('a_');
		} else {
			isDefault.value = true;
			isAnimated.value = false;
		}
	},
	{ immediate: true }
);

function createUrl(format: 'webp' | 'png' | 'gif', size: number) {
	return `https://cdn.discordapp.com/avatars/${session.value.user!.id}/${session.value.user!.avatar}.${format}?size=${size}`;
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
