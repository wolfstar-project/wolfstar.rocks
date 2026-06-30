<template>
	<UHeader class="app-navbar">
		<template #left>
			<NuxtLink
				class="mr-4 flex items-center transition-transform hover:scale-105"
				:to="currentApp.explore"
				:aria-label="`${currentApp.name} home`"
			>
				<AppLogoMark v-if="currentApp.name === 'WolfStar'" class="h-20 w-45" />
				<span v-else class="text-ui-100 ml-2 text-2xl font-bold">{{
					currentApp.name
				}}</span>
				<UBadge
					v-if="env === 'preview' || env === 'canary'"
					color="warning"
					label="Beta"
					size="xs"
					class="ml-2"
				/>
				<UBadge
					v-else-if="env === 'dev'"
					color="error"
					label="Dev"
					size="xs"
					class="ml-2"
				/>
			</NuxtLink>
		</template>

		<UNavigationMenu
			:items="desktopLinks"
			variant="link"
			class="hidden lg:inline-flex"
			aria-label="Main navigation"
			:ui="{
				link: 'text-base-content/80 hover:text-base-content/100',
				root: 'text-base-content/70',
			}"
		/>

		<template #right>
			<ClientOnly>
				<LazyAppHeaderAuth />
				<template #fallback>
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
						label="Sign in"
						size="md"
						color="primary"
						variant="subtle"
						block
						class="invisible hidden md:inline-flex"
						icon="ic:round-discord"
						tabindex="-1"
					/>
				</template>
			</ClientOnly>
		</template>
		<template #body>
			<UNavigationMenu
				orientation="vertical"
				:items="mobileLinks"
				class="-mx-2.5"
				aria-label="Mobile navigation"
			/>
		</template>
	</UHeader>
</template>

<script setup lang="ts">
const { env } = useAppConfig();
const { desktopLinks, mobileLinks, currentApp } = useHeader();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.app-navbar {
	position: relative; /* needed for ::after gradient bottom border */
	backdrop-filter: blur(16px);
	-webkit-backdrop-filter: blur(16px);
	transition: all 0.3s ease;
	box-shadow: 0 4px 30px oklch(0% 0 0 / 0.1);
	/* border-bottom handled by ::after pseudo-element */
	border-right: 1px solid oklch(0% 0 0 / 0.05);
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
	margin-bottom: -0.5rem; /* align with bottom of navbar */
	border-bottom: 1px solid oklch(100% 0 0 / 0.1);
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
