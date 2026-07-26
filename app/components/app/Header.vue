<template>
	<StarHeader class="app-navbar" title="WolfStar" aria-label="Site header">
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

		<nav
			class="hidden gap-1 rounded-full bg-base-200 p-1 lg:inline-flex"
			aria-label="Main navigation"
		>
			<StarNavigationMenu
				:items="desktopLinks"
				variant="link"
				:ui="{
					link: 'rounded-full px-4 py-2 text-sm font-medium text-base-content/60 hover:text-base-content',
					root: 'gap-0',
				}"
			/>
		</nav>

		<template #right>
			<div class="hidden items-center gap-2 md:flex">
				<StarButton
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
						<StarButton
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
				<StarNavigationMenu
					orientation="vertical"
					:items="mobileLinks"
					class="-mx-1"
					aria-label="Mobile navigation"
					:ui="{
						link: 'rounded-lg px-3 py-3 text-base font-medium',
						childLink: 'rounded-lg px-3 py-2.5 text-sm',
						childList: 'ms-2 border-s border-base-200 ps-2',
					}"
				/>

				<div class="mt-auto flex flex-col items-center gap-3 border-t border-base-200 pt-5">
					<StarButton
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
								<StarButton
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
	</StarHeader>
</template>

<script setup lang="ts">
const { desktopLinks, mobileLinks, currentApp } = useHeader();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.app-navbar {
	width: 100%;
	border-radius: 0;
	border-bottom: 1px solid var(--home-border-subtle);
}
</style>
