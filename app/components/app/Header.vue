<template>
	<StarHeader class="app-navbar" :title="t('header.brand')" :aria-label="t('header.site_header')">
		<template #left>
			<NuxtLink
				class="gap-2.5 flex items-center"
				:to="currentApp.explore"
				:aria-label="t('header.home', { name: currentApp.name })"
			>
				<AppLogoMark v-if="currentApp.name === 'WolfStar'" class="h-20 w-45" />
				<span v-else class="text-base font-bold text-base-content">{{
					currentApp.name
				}}</span>
			</NuxtLink>
		</template>

		<nav
			class="gap-1 bg-base-200 p-1 lg:inline-flex hidden rounded-full"
			:aria-label="t('nav.main_navigation')"
		>
			<StarNavigationMenu
				:items="desktopLinks"
				variant="link"
				:ui="{
					link: 'rounded-full px-4 py-2 text-sm font-medium text-muted hover:text-base-content',
					root: 'gap-0',
				}"
			/>
		</nav>

		<template #right>
			<div class="gap-2 md:flex hidden items-center">
				<StarButton
					v-if="currentApp.invite !== '#'"
					:label="t('header.add_app')"
					size="sm"
					color="primary"
					:to="currentApp.invite"
					class="rounded-lg font-semibold"
				/>
				<ClientOnly>
					<LazyAppHeaderAuth />
					<template #fallback>
						<StarButton
							:label="t('header.sign_in')"
							size="md"
							color="primary"
							variant="subtle"
							class="rounded-lg invisible"
							icon="ic:round-discord"
							tabindex="-1"
						/>
					</template>
				</ClientOnly>
			</div>
		</template>
		<template #body>
			<nav class="min-h-0 gap-6 flex flex-1 flex-col" :aria-label="t('nav.mobile_menu')">
				<StarNavigationMenu
					orientation="vertical"
					:items="mobileLinks"
					class="-mx-1"
					:aria-label="t('nav.mobile_navigation')"
					:ui="{
						link: 'rounded-lg px-3 py-3 text-base font-medium',
						childLink: 'rounded-lg px-3 py-2.5 text-sm',
						childList: 'ms-2 border-s border-default ps-2',
					}"
				/>

				<div class="gap-3 border-default pt-5 mt-auto flex flex-col items-center border-t">
					<StarButton
						v-if="currentApp.invite !== '#'"
						:label="t('header.add_app')"
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
									:label="t('header.sign_in')"
									size="md"
									color="primary"
									variant="subtle"
									class="rounded-lg invisible"
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
const { t } = useI18n();
const { desktopLinks, mobileLinks, currentApp } = useHeader();
</script>

<style scoped>
.app-navbar {
	--ui-header-height: 5rem;
	width: 100%;
	border-radius: 0;
	border-bottom: 1px solid var(--home-border-subtle);
}
</style>
