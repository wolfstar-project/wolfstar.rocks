<template>
	<UContainer class="mx-auto max-w-7xl space-y-8 px-4 py-8">
		<h1 class="sr-only">{{ t("profile.title") }}</h1>
		<ProfileHeader
			:user="user"
			:copied="copied"
			:pending="loggedIn && isLoading && !user"
			:effective-reduce-motion="effectiveReduceMotion"
			@copy-user-id="copyUserId"
		/>

		<section
			class="relative flex flex-col items-center justify-center divide-y divide-base-200/50 overflow-hidden rounded-xl border-2 border-base-200 bg-base-200/20 shadow-lg md:border-4"
			:aria-label="t('profile.account_management')"
		>
			<!-- subtle left accent to mirror dashboard sidebar -->
			<div
				class="absolute inset-y-2 left-0 hidden w-1 rounded-r-md bg-secondary/20 md:block"
				aria-hidden="true"
			></div>
			<UTabs
				v-model="activeTab"
				variant="transparent"
				:items
				class="flex w-full flex-col items-center justify-center"
			>
				<template #content="{ item }">
					<div class="p-8">
						<div v-if="item.value === 'servers'" class="space-y-6">
							<template v-if="!loggedIn">
								<div class="mb-4">
									<h2 class="text-2xl font-bold text-base-content">
										{{ t("profile.servers") }}
									</h2>
									<p class="mt-1 text-base-content/60">
										{{ t("profile.servers_guest_description") }}
									</p>
								</div>
								<div class="flex flex-col items-center gap-4 py-10 text-center">
									<UIcon
										name="heroicons:server"
										class="size-12 text-base-content/30"
									/>
									<p class="max-w-md text-base-content/70">
										{{ t("profile.servers_sign_in_prompt") }}
									</p>
									<UButton
										:label="t('header.sign_in')"
										color="primary"
										icon="ic:round-discord"
										to="/login?next=/profile"
										:aria-label="t('header.sign_in_discord')"
									/>
								</div>
							</template>
							<template v-else>
								<!-- Server Section Header -->
								<div class="mb-4">
									<h2 class="text-2xl font-bold text-base-content">
										{{ t("profile.servers") }}
									</h2>
									<div class="mt-1 text-base-content/60">
										<USkeleton v-if="isLoading" class="inline-block h-5 w-48" />
										<span v-else
											>{{ guilds.length ?? 0 }}
											{{ t("profile.servers").toLowerCase() }}</span
										>
									</div>
								</div>

								<!-- Search and Controls Section -->
								<div class="mb-4 flex flex-wrap items-center justify-between gap-4">
									<div class="flex items-end gap-2">
										<UFieldGroup class="flex items-start gap-2">
											<UInput
												ref="input"
												v-model="searchQuery"
												aria-label="Search servers"
												name="search"
												type="text"
												placeholder="Search servers..."
												icon="heroicons:magnifying-glass-circle"
												:is-loading
												is-loading-icon="lucide:loader"
												class="flex max-w-xs items-start"
											>
												<template v-if="searchQuery?.length" #trailing>
													<UButton
														color="neutral"
														variant="link"
														size="sm"
														icon="lucide:circle-x"
														aria-label="Clear input"
														@click="undoSearch()"
													/>
												</template>
											</UInput>
										</UFieldGroup>
										<!-- Mobile Buttons (no view toggle) -->
										<UFieldGroup
											size="sm"
											class="join flex items-end sm:hidden"
										>
											<!-- Manageable Only Toggle Button -->
											<UButton
												class="join-item"
												color="primary"
												:variant="showManageableOnly ? 'solid' : 'outline'"
												:is-loading
												is-loading-icon="lucide:loader"
												icon="heroicons:shield-check"
												aria-label="Toggle manageable servers only"
												:aria-pressed="showManageableOnly"
												@click="handleManageableToggle()"
											/>

											<!-- Sort Button -->
											<UButton
												class="join-item"
												color="primary"
												:is-loading
												aria-label="Toggle sort order"
												@click="handleSortToggle()"
											>
												<template #leading>
													<UIcon
														:name="
															sortAscending
																? 'lucide:arrow-up-a-z'
																: 'lucide:arrow-down-z-a'
														"
														style="
															view-transition-name: sort-icon-mobile;
														"
													/>
												</template>
											</UButton>

											<!-- Refresh Button -->
											<UButton
												v-if="filteredGuilds.length === 0"
												class="join-item"
												color="primary"
												:is-loading
												is-loading-icon="lucide:loader"
												icon="heroicons:arrow-path-20-solid"
												aria-label="Refresh servers"
												@click="refresh()"
											/>
										</UFieldGroup>

										<!-- Desktop Buttons (with view toggle) -->
										<UFieldGroup
											size="sm"
											class="join hidden items-end sm:flex"
										>
											<!--
                    Manageable
                    Only
                    Toggle
                    Button
                    -->
											<UButton
												class="join-item"
												color="primary"
												:variant="showManageableOnly ? 'solid' : 'outline'"
												:is-loading
												is-loading-icon="lucide:loader"
												icon="heroicons:shield-check"
												:aria-pressed="showManageableOnly"
												@click="handleManageableToggle()"
											>
												<span>Manageable</span>
											</UButton>

											<!-- Sort Button -->
											<UButton
												class="join-item"
												color="primary"
												:is-loading
												@click="handleSortToggle()"
											>
												<template #leading>
													<UIcon
														:name="
															sortAscending
																? 'lucide:arrow-up-a-z'
																: 'lucide:arrow-down-z-a'
														"
														style="
															view-transition-name: sort-icon-desktop;
														"
													/>
												</template>
											</UButton>

											<!-- Refresh Button -->
											<UButton
												v-if="filteredGuilds.length === 0"
												class="join-item"
												color="primary"
												:is-loading
												is-loading-icon="lucide:loader"
												icon="heroicons:arrow-path-20-solid"
												@click="refresh()"
											>
												<span>Refresh</span>
											</UButton>
										</UFieldGroup>
									</div>
									<!-- Search Input for Desktop -->
								</div>
								<div class="space-y-4 md:space-y-2">
									<GuildCards
										:error
										:guilds
										:filtered-guilds
										:undo-search
										:search-query
										:loading="isLoading"
										:filter-key="showManageableOnly"
										:is-retrying
										:on-retry="handleRetry"
									/>
								</div>
							</template>
						</div>
						<div v-if="item.value === 'settings'" class="space-y-6">
							<div class="mb-6">
								<h2 class="text-2xl font-bold text-base-content">
									{{ t("profile.settings_title") }}
								</h2>
								<p class="mt-1 text-base-content/60">
									{{ t("profile.settings_tagline") }}
								</p>
							</div>

							<!-- Appearance -->
							<UCard class="border border-base-200/60 bg-base-100 shadow-sm">
								<template #header>
									<div class="flex items-center gap-3">
										<div
											class="flex size-7 items-center justify-center rounded-full bg-primary/10"
										>
											<UIcon
												name="lucide:sun-moon"
												class="size-4 text-primary"
											/>
										</div>
										<div>
											<h3 class="text-lg font-semibold text-base-content">
												{{ t("common.appearance") }}
											</h3>
											<p class="text-sm text-base-content/60">
												{{ t("profile.appearance_description") }}
											</p>
										</div>
									</div>
								</template>

								<div class="space-y-4">
									<div
										class="flex flex-col gap-3 rounded-lg border border-base-300 bg-base-200/50 p-4 sm:flex-row sm:items-center sm:justify-between"
									>
										<div>
											<h4 class="font-medium text-base-content">
												{{ t("profile.theme") }}
											</h4>
											<p class="mt-1 text-sm text-base-content/60">
												{{ t("profile.theme_description") }}
											</p>
										</div>
										<ColorModeButton show-label size="sm" variant="outline" />
									</div>
								</div>
							</UCard>

							<!-- Language -->
							<UCard class="border border-base-200/60 bg-base-100 shadow-sm">
								<template #header>
									<div class="flex items-center gap-3">
										<div
											class="flex size-7 items-center justify-center rounded-full bg-primary/10"
										>
											<UIcon
												name="lucide:languages"
												class="size-4 text-primary"
											/>
										</div>
										<div>
											<h3 class="text-lg font-semibold text-base-content">
												{{ t("common.language") }}
											</h3>
											<p class="text-sm text-base-content/60">
												{{ t("profile.language_description") }}
											</p>
										</div>
									</div>
								</template>

								<div
									class="flex flex-col gap-3 rounded-lg border border-base-300 bg-base-200/50 p-4 sm:flex-row sm:items-center sm:justify-between"
								>
									<div>
										<h4 class="font-medium text-base-content">
											{{ t("common.language") }}
										</h4>
										<p class="mt-1 text-sm text-base-content/60">
											{{ t("profile.language_help") }}
										</p>
									</div>
									<ClientOnly>
										<ULocaleSelect
											v-model="currentLocale"
											:locales="uiLocales"
											color="neutral"
											variant="outline"
											class="w-48"
											:ui="{ content: 'min-w-fit' }"
											@update:model-value="selectLocale"
										/>
										<template #fallback>
											<USkeleton class="h-8 w-48" />
										</template>
									</ClientOnly>
								</div>
							</UCard>

							<!-- Accessibility -->
							<UCard class="border border-base-200/60 bg-base-100 shadow-sm">
								<template #header>
									<div class="flex items-center gap-3">
										<div
											class="flex size-7 items-center justify-center rounded-full bg-primary/10"
										>
											<UIcon
												name="heroicons:eye-20-solid"
												class="size-4 text-primary"
											/>
										</div>
										<div>
											<h3 class="text-lg font-semibold text-base-content">
												{{ t("profile.accessibility") }}
											</h3>
											<p class="text-sm text-base-content/60">
												{{ t("profile.accessibility_description") }}
											</p>
										</div>
									</div>
								</template>

								<div class="space-y-4">
									<div
										class="flex items-center justify-between rounded-lg border border-base-300 bg-base-200/50 p-4"
									>
										<div class="flex-1">
											<div class="flex items-center gap-2">
												<UIcon
													name="heroicons:arrows-right-left"
													class="h-5 w-5 text-base-content/70"
												/>
												<h4 class="font-medium text-base-content">
													{{ t("profile.reduce_motion") }}
												</h4>
											</div>
											<p class="mt-1 text-sm text-base-content/60">
												{{ t("profile.reduce_motion_description") }}
											</p>
										</div>
										<USwitch
											v-model="reduceMotionEnabled"
											size="lg"
											:disabled="systemPreferenceActive"
											@update:model-value="handleSetReduceMotion"
										/>
									</div>

									<div
										v-if="systemPreferenceActive"
										class="flex items-start gap-3 rounded-lg border border-info/30 bg-info/10 p-4"
									>
										<UIcon
											name="heroicons:information-circle"
											class="mt-0.5 h-5 w-5 shrink-0 text-info"
										/>
										<div class="text-sm">
											<p class="font-medium text-info">
												{{ t("profile.system_preference_detected") }}
											</p>
											<p class="mt-1 text-info/80">
												{{ t("profile.system_preference_description") }}
											</p>
										</div>
									</div>

									<div class="flex items-center gap-2 text-sm">
										<span class="text-base-content/60">{{
											t("profile.current_status")
										}}</span>
										<UBadge
											:color="effectiveReduceMotion ? 'primary' : 'neutral'"
											variant="subtle"
										>
											<template #leading>
												<UIcon
													:name="
														effectiveReduceMotion
															? 'heroicons:check-circle'
															: 'heroicons:x-circle'
													"
													class="h-4 w-4"
												/>
											</template>
											{{
												effectiveReduceMotion
													? t("profile.motion_reduced")
													: t("profile.motion_enabled")
											}}
										</UBadge>
									</div>
								</div>
							</UCard>
						</div>
						<!-- Premium tab (disabled for now)
						<div v-if="item.value === 'premium'" class="space-y-6">
							<UCard
								class="border-2 border-primary/30 bg-linear-to-br from-primary/10 via-transparent to-secondary/10 shadow-2xl"
							>
								<template #header>
									<div>
										<h2 class="text-2xl font-bold text-base-content">
											Premium
										</h2>
										<p class="mt-1 text-base-content/60">
											Unlock advanced features and support the project
										</p>
									</div>
								</template>
								<div class="space-y-6">
									<div class="flex flex-col items-center space-y-4 text-center">
										<div
											class="flex size-18 items-center justify-center rounded-full bg-primary/20"
										>
											<UIcon
												name="heroicons:sparkles-20-solid"
												class="size-12 text-primary"
											/>
										</div>
										<div>
											<h3 class="text-3xl font-bold text-base-content">
												Upgrade to Premium
											</h3>
											<p class="mt-2 text-base-content/70">
												Unlock advanced features and get priority support
											</p>
										</div>
									</div>

									<div class="grid gap-4 sm:grid-cols-2">
										<div class="flex items-start gap-3">
											<div
												class="flex size-10 items-center justify-center rounded-full bg-success/20"
											>
												<UIcon
													name="heroicons:check-circle"
													class="mt-0.5 size-7 text-success"
												/>
											</div>
											<div>
												<p class="font-semibold text-base-content">
													Advanced Commands
												</p>
												<p class="text-sm text-base-content/60">
													Access to premium-only commands
												</p>
											</div>
										</div>
										<div class="flex items-start gap-3">
											<div
												class="flex size-10 items-center justify-center rounded-full bg-success/20"
											>
												<UIcon
													name="heroicons:check-circle"
													class="mt-0.5 size-7 text-success"
												/>
											</div>
											<div>
												<p class="font-semibold text-base-content">
													Priority Support
												</p>
												<p class="text-sm text-base-content/60">
													Get help faster from our team
												</p>
											</div>
										</div>
										<div class="flex items-start gap-3">
											<div
												class="flex size-10 items-center justify-center rounded-full bg-success/20"
											>
												<UIcon
													name="heroicons:check-circle"
													class="mt-0.5 size-7 text-success"
												/>
											</div>
											<div>
												<p class="font-semibold text-base-content">
													Custom Settings
												</p>
												<p class="text-sm text-base-content/60">
													Personalize your experience
												</p>
											</div>
										</div>
										<div class="flex items-start gap-3">
											<div
												class="flex size-10 items-center justify-center rounded-full bg-success/20"
											>
												<UIcon
													name="heroicons:check-circle"
													class="mt-0.5 size-7 text-success"
												/>
											</div>
											<div>
												<p class="font-semibold text-base-content">
													Early Access
												</p>
												<p class="text-sm text-base-content/60">
													Try new features first
												</p>
											</div>
										</div>
									</div>
								</div>
								<template #footer>
									<UFieldGroup
										size="md"
										class="z-10 flex w-full justify-center pt-4"
									>
										<UButton color="primary">Get Premium</UButton>
										<UButton color="primary" variant="outline">
											Learn More
										</UButton>
									</UFieldGroup>
								</template>
							</UCard>
						</div>
						-->
					</div>
				</template>
			</UTabs>
		</section>
	</UContainer>
</template>

<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";
import { en, es, it } from "@nuxt/ui/locale";
import * as Sentry from "@sentry/nuxt";
import { isAppLocaleCode } from "~/utils/is-app-locale";

definePageMeta({ alias: ["/account"] });

const { t, locale, setLocale } = useI18n();
const { loggedIn, user: authUser, ready } = useUserSession();
const { setPreferredLocale } = usePreferredLocale();
useSeoMetadata({
	description: () => t("profile.seo_description"),
	shouldOgImage: true,
	title: () => t("profile.title"),
});

// Tab Management - inspired by Dyno.gg tab system
const activeTab = ref(loggedIn.value ? "servers" : "settings");
watch(loggedIn, (isLoggedIn) => {
	if (!isLoggedIn && activeTab.value === "servers") {
		activeTab.value = "settings";
	}
});

const { copy, copied } = useClipboard();
const searchQuery = ref<string | undefined>(undefined);

// Error handling state
const isRetrying = ref(false);

// Toggles
// Is true by default because we want to show only manageable servers
const [showManageableOnly, toggleShowManageableOnly] = useToggle(true);
// Sort order: true for ascending, false for descending
const [sortAscending, toggleSortOrder] = useToggle(true);

// Local preferences (work for guests and signed-in users)
const { reduceMotionEnabled, effectiveReduceMotion, setReduceMotion, systemPreferenceActive } =
	useReduceMotion();

const uiLocales = [en, { ...es, code: "es-ES" }, { ...it, code: "it-IT" }];
const currentLocale = computed({
	get: () => locale.value,
	set: (code: string) => {
		selectLocale(code);
	},
});

function selectLocale(code: string) {
	if (!isAppLocaleCode(code)) return;
	setPreferredLocale(code);
	void setLocale(code);
}

const isTransitioning = ref(false);
const isFilterTransitioning = ref(false);

function handleManageableToggle() {
	if (!document.startViewTransition || effectiveReduceMotion.value) {
		toggleShowManageableOnly();
		return;
	}
	if (isFilterTransitioning.value || isTransitioning.value) return;
	if (document.activeViewTransition) {
		document.activeViewTransition.skipTransition();
	}
	isFilterTransitioning.value = true;
	try {
		document
			.startViewTransition(async () => {
				toggleShowManageableOnly();
				await nextTick();
			})
			.finished.finally(() => {
				isFilterTransitioning.value = false;
			});
	} catch {
		isFilterTransitioning.value = false;
		toggleShowManageableOnly();
	}
}

function handleSortToggle() {
	if (!document.startViewTransition || effectiveReduceMotion.value) {
		toggleSortOrder();
		return;
	}
	if (isTransitioning.value || isFilterTransitioning.value) return;
	if (document.activeViewTransition) {
		document.activeViewTransition.skipTransition();
	}
	isTransitioning.value = true;
	try {
		document
			.startViewTransition(async () => {
				toggleSortOrder();
				await nextTick();
			})
			.finished.finally(() => {
				isTransitioning.value = false;
			});
	} catch {
		isTransitioning.value = false;
		toggleSortOrder();
	}
}

const { user, guilds, filteredGuilds, status, error, refresh } = useUser(authUser, {
	timeout: 15_000, // 15 seconds timeout
	retry: 3, // Max retry attempts
	retryDelay: 1000, // 1 second delay between retries
	search: {
		query: searchQuery,
		showManageableOnly,
		sortAscending,
	},
});

const isLoading = computed(
	() => loggedIn.value && (status.value === "idle" || status.value === "pending"),
);

// Retry handler
async function handleRetry() {
	isRetrying.value = true;
	log.info({ tag: "profile", action: "retry_guild_fetch" });
	Sentry.metrics.count("profile.guild_fetch.retry", 1);
	try {
		await Sentry.startSpan({ name: "profile.guild_fetch.retry", op: "ui.action" }, () =>
			refresh(),
		);
	} finally {
		isRetrying.value = false;
	}
}

// Enhanced tabs configuration
const items = computed<TabsItem[]>(() => [
	{
		badge: loggedIn.value
			? isLoading.value
				? {
						color: "primary",
						trailingIcon: "lucide:loader",
						ui: { trailingIcon: "animate-spin" },
					}
				: { color: "primary", label: `${guilds.value?.length ?? "N/A"}` }
			: undefined,
		icon: "heroicons:server",
		label: t("profile.servers"),
		value: "servers",
	},
	{
		icon: "heroicons:cog-6-tooth",
		label: t("profile.settings_title"),
		value: "settings",
	},
]);

watch([activeTab, guilds, error], ([tab, value, err], [prevTab, prevValue, prevErr]) => {
	if (tab !== prevTab) {
		Sentry.metrics.count("profile.tab.switch", 1, { attributes: { tab } });
		Sentry.addBreadcrumb({
			category: "navigation",
			message: `Profile tab: ${tab}`,
			level: "info",
		});
	}
	if (value !== prevValue && Array.isArray(value) && value.length > 0) {
		Sentry.metrics.distribution("profile.guilds.count", value.length);
	}
	if (err && err !== prevErr) {
		Sentry.metrics.count("profile.guild_fetch.error", 1);
	}
});

function undoSearch() {
	searchQuery.value = undefined;
}

async function copyUserId() {
	if (user.value?.id) {
		await copy(user.value.id);
		log.info({ tag: "profile", action: "copy_user_id" });
		Sentry.metrics.count("profile.user_id.copy", 1);
	}
}

function handleSetReduceMotion(value: boolean) {
	setReduceMotion(value);
	Sentry.metrics.count("profile.settings.reduce_motion", 1, {
		attributes: { enabled: String(value) },
	});
}

watch(
	ready,
	(isReady) => {
		if (!isReady) return;
		if (!loggedIn.value && activeTab.value === "servers") {
			activeTab.value = "settings";
		}
	},
	{ immediate: true },
);
</script>
