<template>
	<UHeader class="app-navbar">
		<template #left>
			<NuxtLink
				class="flex items-center gap-2.5"
				:to="currentApp.explore"
				:aria-label="`${currentApp.name} home`"
			>
				<AppLogoMark v-if="currentApp.name === 'WolfStar'" class="h-20 w-45" />
				<span v-else class="text-base font-bold text-base-content">{{
					currentApp.name
				}}</span>
			</NuxtLink>
		</template>

		<div class="hidden gap-1 rounded-full bg-base-200 p-1 lg:inline-flex">
			<UNavigationMenu
				:items="desktopLinks"
				variant="link"
				aria-label="Main navigation"
				:ui="{
					link: 'rounded-full px-4 py-2 text-sm font-medium text-muted hover:text-base-content',
					root: 'gap-0',
				}"
			/>
		</div>

		<template #right>
			<div class="flex items-center gap-2">
				<UButton
					v-if="currentApp.invite !== '#'"
					label="Add App"
					size="sm"
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
const { desktopLinks, mobileLinks, currentApp } = useHeader();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.app-navbar {
	--ui-header-height: 5rem;
	width: 100%;
	border-radius: 0;
	border-bottom: 1px solid var(--home-border-subtle);
}
</style>
