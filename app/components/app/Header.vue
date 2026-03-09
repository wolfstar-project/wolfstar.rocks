<template>
	<UHeader
		class="app-navbar card-glass"
		:ui="{
			root: 'rounded-full px-6 py-2',
		}"
	>
		<template #left>
			<NuxtLink
				class="mr-4 flex items-center transition-transform hover:scale-105"
				:to="currentApp.explore"
				:aria-label="`${currentApp.name} home page`"
			>
				<IconsWolfstar class="h-10 w-10" aria-hidden="true" />
				<span class="text-ui-100 ml-2 text-2xl font-bold">{{ currentApp.name }}</span>
			</NuxtLink>
		</template>

		<nav aria-label="Main navigation">
			<UNavigationMenu
				:items="desktopLinks"
				variant="link"
				class="hidden lg:inline-flex"
				:ui="{
					link: 'text-base-content/80 hover:text-base-content/100',
					root: 'text-base-content/70',
				}"
			/>
		</nav>

		<template #right>
			<AuthState>
				<template #default="{ loggedIn }">
					<div v-if="loggedIn && user">
						<LazyUDropdownMenu
							:items
							arrow
							:content="{
								align: 'start',
								side: 'bottom',
								sideOffset: 8,
							}"
							:ui="{
								content: 'w-48',
							}"
						>
							<div
								class="flex cursor-pointer items-center gap-2"
								role="button"
								aria-label="User menu"
								aria-haspopup="menu"
								tabindex="0"
							>
								<LazyUAvatar
									v-motion
									:initial="{ scale: 1 }"
									:hover="{ scale: 1.1, rotate: 5 }"
									:src="src"
									icon="lucide:image"
									size="2xs"
								/>
								<span class="hidden font-semibold sm:inline">{{ user?.name }}</span>
							</div>
						</LazyUDropdownMenu>
					</div>
					<div v-else>
						<UButton
							size="md"
							color="primary"
							variant="subtle"
							to="/login"
							block
							class="md:hidden"
							icon="ic:round-discord"
							aria-label="Login with Discord"
						/>
						<UButton
							label="Login"
							size="md"
							color="primary"
							variant="subtle"
							to="/login"
							block
							class="hidden md:inline-flex"
							icon="ic:round-discord"
							aria-label="Login with Discord"
						/>
					</div>
				</template>
				<template #placeholder>
					<div aria-hidden="true">
						<UButton
							size="md"
							color="primary"
							variant="subtle"
							block
							class="invisible md:hidden"
							icon="ic:round-discord"
							tabindex="-1"
						/>
						<UButton
							label="Login"
							size="md"
							color="primary"
							variant="subtle"
							block
							class="invisible hidden md:inline-flex"
							icon="ic:round-discord"
							tabindex="-1"
						/>
					</div>
				</template>
			</AuthState>
		</template>
		<template #body>
			<UNavigationMenu orientation="vertical" :items="mobileLinks" class="-mx-2.5" />
		</template>
	</UHeader>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";
const { desktopLinks, mobileLinks } = useHeader();
const { user, logout } = useAuth();
const { currentApp } = useHeader();

const items = ref<DropdownMenuItem[]>([
	{
		icon: "lucide:user",
		label: "Profile",
		to: "/profile",
	},
	{
		icon: "lucide:log-out",
		label: "Log Out",
		onSelect: logout,
		ui: {
			itemLeadingIcon: "bg-red-500",
		},
	},
]);

const src = computed(() => avatarURL(user.value!));
</script>

<style scoped>
@reference "@/assets/css/main.css";

.app-navbar {
	position: relative; /* Ensure pseudo-element is positioned relative to this */
	backdrop-filter: blur(16px);
	-webkit-backdrop-filter: blur(16px);
	transition: all 0.3s ease;
	box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
	border-right: 1px solid oklch(100% 0 0 / 0.1);
	border-right: 1px solid oklch(0% 0 0 / 0.05);
	/* border-bottom removed, handled by ::after */
	border-left: 1px solid oklch(100% 0 0 / 0.1);
	border-left: 1px solid oklch(0% 0 0 / 0.05);
	background: oklch(20% 0 0 / 0.6);
	width: min(calc(100% - 2rem), var(--container-7xl));
}

.app-navbar::after {
	position: absolute;
	right: 0;
	bottom: 0;
	left: 0;
	/* Start border after ~230px (Logo width + padding) */
	background: linear-gradient(to right, transparent 230px, oklch(100% 0 0 / 0.1) 230px);
	height: 1px;
	pointer-events: none;
	content: "";
}

.branding-container {
	display: inline-flex;
	align-items: center;
	margin-bottom: -0.5rem; /* Align with bottom of navbar */
	/* border-bottom removed from here if it was conflicting or needed removal */
	border-bottom: 1px solid oklch(100% 0 0 / 0.1); /* Keep or remove? The user request is about the main border. */
	padding-bottom: 0.5rem;
}

[data-theme="light"] .app-navbar {
	border-color: oklch(0% 0 0 / 0.05);
	background: oklch(98% 0 0 / 0.6);
}

[data-theme="light"] .app-navbar::after {
	background: linear-gradient(to right, transparent 230px, oklch(0% 0 0 / 0.05) 230px);
}

[data-theme="light"] .branding-container {
	border-bottom-color: oklch(0% 0 0 / 0.1);
}
</style>
