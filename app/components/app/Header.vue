<template>
	<UHeader class="app-navbar" title="WolfStar" aria-label="Site header">
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
			<div class="hidden items-center gap-2 md:flex">
				<UButton
					v-if="currentApp.invite !== '#'"
					label="Add App"
					size="sm"
					color="primary"
					:to="currentApp.invite"
					class="rounded-lg font-semibold"
				/>
				<ClientOnly>
					<LazyAppHeaderAuth />
					<template #fallback>
						<UButton
							label="Sign in"
							size="md"
							color="primary"
							variant="subtle"
							class="invisible rounded-lg"
							icon="ic:round-discord"
							tabindex="-1"
						/>
					</template>
				</ClientOnly>
			</div>
		</template>
		<template #body>
			<nav class="flex min-h-0 flex-1 flex-col gap-6" aria-label="Mobile menu">
				<UNavigationMenu
					orientation="vertical"
					:items="mobileLinks"
					class="-mx-1"
					aria-label="Mobile navigation"
					:ui="{
						link: 'rounded-lg px-3 py-3 text-base font-medium',
						childLink: 'rounded-lg px-3 py-2.5 text-sm',
						childList: 'ms-2 border-s border-default ps-2',
					}"
				/>

				<div class="mt-auto flex flex-col items-center gap-3 border-t border-default pt-5">
					<UButton
						v-if="currentApp.invite !== '#'"
						label="Add App"
						size="md"
						color="primary"
						:to="currentApp.invite"
						class="rounded-lg font-semibold"
					/>
					<ClientOnly>
						<LazyAppHeaderAuth mobile />
						<template #fallback>
							<div class="flex justify-center">
								<UButton
									label="Sign in"
									size="md"
									color="primary"
									variant="subtle"
									class="invisible rounded-lg"
									icon="ic:round-discord"
									tabindex="-1"
								/>
							</div>
						</template>
					</ClientOnly>
				</div>
			</nav>
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
