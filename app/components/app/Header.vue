<template>
	<UHeader class="app-navbar" :title="ts('header.brand')" :aria-label="ts('header.site_header')">
		<template #left>
			<NuxtLink
				class="flex items-center gap-2.5"
				:to="currentApp.explore"
				:aria-label="ts('header.home', { name: currentApp.name })"
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
			class="hidden gap-0.5 rounded-full border border-(--home-border-subtle) bg-base-200 p-1 lg:inline-flex"
		>
			<UNavigationMenu
				v-model="openMenu"
				:items="desktopLinks"
				variant="link"
				content-orientation="vertical"
				:aria-label="ts('nav.main_navigation')"
				:ui="{
					link: 'h-9 gap-1 rounded-full pr-3 pl-4 text-sm font-medium text-muted hover:text-base-content data-[state=open]:bg-base-300 data-[state=open]:text-base-content',
					linkTrailingIcon: 'size-3.5',
					content: 'w-auto bg-transparent backdrop-blur-none',
					viewport: 'app-navbar-viewport',
					list: 'gap-0.5',
					root: 'gap-0',
				}"
			>
				<template #features-content>
					<ul class="app-navbar-panel w-105">
						<li v-for="feature of featureLinks" :key="feature.to">
							<NuxtLink
								:to="feature.to"
								class="app-navbar-row items-start"
								@click="openMenu = ''"
							>
								<span class="app-navbar-row-icon">
									<UIcon
										:name="feature.icon"
										class="size-4.5"
										aria-hidden="true"
									/>
								</span>
								<span class="flex flex-col gap-0.5">
									<span class="text-sm font-semibold text-base-content">
										{{ feature.label }}
									</span>
									<span class="app-navbar-row-description">
										{{ feature.description }}
									</span>
								</span>
							</NuxtLink>
						</li>
					</ul>
				</template>

				<template #applications-content>
					<ul class="app-navbar-panel w-75">
						<li v-for="application of applicationLinks" :key="application.to">
							<NuxtLink
								:to="application.to"
								class="app-navbar-row items-center"
								@click="openMenu = ''"
							>
								<NuxtImg
									:src="application.avatar.src"
									width="32"
									height="32"
									alt=""
									class="size-8 shrink-0 rounded-lg"
								/>
								<span class="flex flex-col">
									<span class="text-sm font-semibold text-base-content">
										{{ application.label }}
									</span>
									<span class="app-navbar-row-description text-xs">
										{{ application.description }}
									</span>
								</span>
							</NuxtLink>
						</li>
					</ul>
				</template>
			</UNavigationMenu>
		</div>

		<template #right>
			<div class="hidden items-center gap-2 md:flex">
				<UButton
					v-if="currentApp.invite !== '#'"
					:label="ts('header.add_app')"
					size="sm"
					color="primary"
					:to="currentApp.invite"
					class="rounded-lg font-semibold"
				/>
				<ClientOnly>
					<LazyAppHeaderAuth />
					<template #fallback>
						<UButton
							:label="ts('header.sign_in')"
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
			<nav class="flex min-h-0 flex-1 flex-col gap-6" :aria-label="ts('nav.mobile_menu')">
				<UNavigationMenu
					orientation="vertical"
					:items="mobileLinks"
					class="-mx-1"
					:aria-label="ts('nav.mobile_navigation')"
					:ui="{
						link: 'rounded-lg px-3 py-3 text-base font-medium',
						childLink: 'rounded-lg px-3 py-2.5 text-sm',
						childLinkIcon: 'size-5 shrink-0 text-primary group-hover:text-primary',
						childList: 'ms-2 border-s border-default ps-2',
					}"
				/>

				<div class="mt-auto flex flex-col items-center gap-3 border-t border-default pt-5">
					<UButton
						v-if="currentApp.invite !== '#'"
						:label="ts('header.add_app')"
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
									:label="ts('header.sign_in')"
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
const { ts } = useI18n();
const { applicationLinks, currentApp, desktopLinks, featureLinks, mobileLinks } = useHeader();

/**
 * Value of the open desktop dropdown, `""` when none is open. The rows in the
 * custom content slots are plain links rather than `NavigationMenuLink`, so
 * nothing dismisses the panel on its own — and since the header survives
 * navigation, an in-page `#` target would otherwise stay covered by it.
 */
const openMenu = ref("");
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

/* The dropdown chrome lives on the viewport so the panel below can size itself;
   `app/themes/navigation-menu.ts` dresses both for the dashboard's sidebar menu,
   which is a different surface, so the header undoes that here. */
.app-navbar :deep(.app-navbar-viewport) {
	@apply rounded-xl shadow-2xl ring-0;
	background-color: var(--color-base-300);
	border: 1px solid var(--ui-border);
}

.app-navbar-panel {
	@apply flex max-w-[calc(100vw-2rem)] flex-col gap-0.5 p-2;
}

.app-navbar-row {
	@apply flex gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200;
}

.app-navbar-row:hover,
.app-navbar-row:focus-visible {
	background-color: var(--color-base-200);
}

.app-navbar-row-icon {
	@apply flex size-9 shrink-0 items-center justify-center rounded-lg text-primary;
	background: var(--home-blurple-soft);
}

.app-navbar-row-description {
	@apply text-[0.8125rem] leading-snug text-muted;
}
</style>
