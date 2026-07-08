<template>
	<UHeader
		class="app-navbar"
		:ui="{
			root: 'w-full border-b border-base-content/5',
			container: 'max-w-7xl mx-auto px-4 sm:px-6',
		}"
	>
		<template #left>
			<NuxtLink
				class="flex items-center gap-2.5"
				:to="currentApp.explore"
				:aria-label="`${currentApp.name} home`"
			>
				<AppLogoMark v-if="currentApp.name === 'WolfStar'" class="h-20 w-45" />
				<span v-else class="text-xl font-bold text-base-content">{{
					currentApp.name
				}}</span>
				<UBadge
					v-if="env === 'preview' || env === 'canary'"
					color="warning"
					label="Beta"
					size="xs"
				/>
				<UBadge v-else-if="env === 'dev'" color="error" label="Dev" size="xs" />
			</NuxtLink>
		</template>

		<div class="hidden rounded-full bg-base-200 px-5 py-1.5 lg:inline-flex">
			<UNavigationMenu
				:items="desktopLinks"
				variant="link"
				aria-label="Main navigation"
				:ui="{
					link: 'rounded-full px-4 py-1.5 text-sm text-muted hover:text-base-content',
					root: 'gap-1',
				}"
			/>
		</div>

		<template #right>
			<div class="flex items-center gap-2">
				<UButton
					v-if="currentApp.invite !== '#'"
					label="Add App"
					size="md"
					color="primary"
					:to="currentApp.invite"
					class="hidden rounded-lg font-semibold md:inline-flex"
				/>
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
			</div>
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
	width: 100%;
	border-radius: 0;
	background: var(--color-base-300);
}

[data-theme="light"] .app-navbar {
	background: var(--color-base-200);
}
</style>
