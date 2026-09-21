<template>
	<UHeader class="app-navbar" :title="t('header.brand')" :aria-label="t('header.site_header')">
		<template #left>
			<NuxtLink
				class="flex items-center gap-2.5"
				:to="currentApp.explore"
				:aria-label="t('header.home', { name: currentApp.name })"
			>
				<AppLogoMark v-if="currentApp.name === 'WolfStar'" class="h-20 w-45" />
				<span
					v-else
					class="text-lg font-bold tracking-(--home-ls-tight) text-base-content"
					>{{ currentApp.name }}</span
				>
			</NuxtLink>
		</template>

		<div
			class="hidden gap-1 rounded-full border border-(--home-border-subtle) bg-base-200 p-1 lg:inline-flex"
		>
			<UNavigationMenu
				:items="desktopLinks"
				variant="link"
				:aria-label="t('nav.main_navigation')"
				:ui="{
					link: 'h-9 rounded-full px-4 text-sm font-medium text-muted hover:text-base-content data-[state=open]:bg-base-300 data-[state=open]:text-base-content',
					childLinkIcon: 'size-5 shrink-0 text-primary',
					list: 'gap-0.5',
					root: 'gap-0',
				}"
			/>
		</div>

		<template #right>
			<div class="hidden items-center gap-2 md:flex">
				<UButton
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
						<UButton
							:label="t('header.sign_in')"
							size="md"
							color="primary"
							variant="soft"
							class="invisible rounded-lg"
							icon="ic:round-discord"
							tabindex="-1"
						/>
					</template>
				</ClientOnly>
			</div>
		</template>
		<template #body>
			<nav class="flex min-h-0 flex-1 flex-col gap-6" :aria-label="t('nav.mobile_menu')">
				<UNavigationMenu
					orientation="vertical"
					:items="mobileLinks"
					class="-mx-1"
					:aria-label="t('nav.mobile_navigation')"
					:ui="{
						link: 'rounded-lg px-3 py-3 text-base font-medium',
						childLink: 'rounded-lg px-3 py-2.5 text-sm',
						childLinkIcon: 'size-5 shrink-0 text-primary',
						childList: 'ms-2 border-s border-default ps-2',
					}"
				/>

				<div class="mt-auto flex flex-col items-center gap-3 border-t border-default pt-5">
					<UButton
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
								<UButton
									:label="t('header.sign_in')"
									size="md"
									color="primary"
									variant="soft"
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
const { t } = useI18n();
const { desktopLinks, mobileLinks, currentApp } = useHeader();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.app-navbar {
	--ui-header-height: 5rem;
	width: 100%;
	border-radius: 0;
	border-bottom: 1px solid var(--home-border-subtle);
	background: color-mix(in srgb, var(--ui-bg) 88%, transparent);
	backdrop-filter: blur(12px);
}
</style>
