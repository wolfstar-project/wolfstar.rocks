<!-- oxlint-disable vue/valid-v-else-if -->
<template>
	<UContainer class="mx-auto max-w-7xl space-y-8 px-4 py-8">
		<section
			class="relative flex flex-col items-center justify-center gap-6 overflow-hidden rounded-xl border-2 border-base-200 bg-base-200/30 p-8 md:flex-row md:border-4 md:p-12"
		>
			<!-- decorative left accent (sidebar-like) -->
			<div class="absolute inset-y-2 left-0 hidden w-1 rounded-r-md bg-primary/40 md:block" aria-hidden="true"></div>
			<div v-if="!user" class="flex flex-col items-center justify-center space-y-6">
				<USkeleton class="h-24 w-24 rounded-full ring-2 ring-base-200 ring-offset-4 ring-offset-base-100" />
				<div class="space-y-2 text-center">
					<USkeleton class="h-10 w-48" />
					<USkeleton class="h-7 w-32" />
					<div class="flex items-center justify-center gap-2">
						<USkeleton class="h-6 w-16" />
						<USkeleton class="h-6 w-32 rounded-md" />
					</div>
				</div>
			</div>
			<template v-else>
				<div class="avatar" :class="{ 'avatar-placeholder': isDefault }">
					<div
						class="flex items-center justify-center rounded-full ring-base-300 ring-offset-base-100"
						:class="{ 'transition-transform duration-300 group-hover:scale-105': !effectiveReduceMotion }"
						role="img"
					>
						<NuxtImg
							v-if="isDefault"
							:src="defaultAvatar"
							alt="Default Avatar"
							class="h-full w-full object-cover"
							:width="128"
							:height="128"
							format="png"
							loading="lazy"
							decoding="async"
							crossorigin="anonymous"
						/>
						<NuxtImg
							v-else
							:src="createUrl(preferredFormat, 256)"
							:format="preferredFormat === 'gif' ? undefined : 'webp'"
							:width="128"
							:height="128"
							sizes="128px"
							:alt="`${user?.name} avatar`"
							class="h-full w-full object-cover"
							loading="lazy"
							decoding="async"
							crossorigin="anonymous"
						/>
					</div>
				</div>
				<div class="space-y-2 text-center">
					<h1 class="text-4xl font-bold text-base-content">
						{{ user.globalName ?? user.username }}
					</h1>
					<p class="text-lg font-medium text-base-content/80">@{{ user.username }}</p>
					<p class="text-sm text-base-content/60">
						User ID:
						<UButton
							variant="outline"
							size="xs"
							color="neutral"
							class="text-sm text-base-content/60 hover:text-base-content"
							@click="copyUserId"
						>
							<template #leading>
								<UIcon :name="copied ? 'heroicons:check' : 'heroicons:clipboard-document'" />
							</template>
							{{ user.id }}
						</UButton>
					</p>
				</div>
			</template>
		</section>

		<section
			class="relative flex flex-col items-center justify-center divide-y divide-base-200/50 overflow-hidden rounded-xl border-2 border-base-200 bg-base-200/20 shadow-lg md:border-4"
		>
			<!-- subtle left accent to mirror dashboard sidebar -->
			<div class="absolute inset-y-2 left-0 hidden w-1 rounded-r-md bg-secondary/20 md:block" aria-hidden="true"></div>
			<UTabs v-model="activeTab" variant="transparent" :items class="flex w-full flex-col items-center justify-center">
				<template #content="{ item }">
					<div class="p-8">
						<div v-if="item.value === 'servers'" class="space-y-6">
							<!-- Server Section Header -->
							<div class="mb-4">
								<h2 class="text-2xl font-bold text-base-content">Servers</h2>
								<p class="mt-1 text-base-content/60">
									<USkeleton v-if="isLoading" class="inline-block h-5 w-48" />
									<span v-else>Servers you're in ({{ guilds.length ?? 0 }} servers)</span>
								</p>
							</div>

							<!-- Search and Controls Section -->
							<div class="mb-4 flex flex-wrap items-center justify-between gap-4">
								<div class="flex items-end gap-2">
									<UFieldGroup class="flex items-start gap-2">
										<UInput
											ref="input"
											v-model="searchQuery"
											name="search"
											type="text"
											placeholder="Search servers.."
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
									<UFieldGroup size="sm" class="join flex items-end sm:hidden">
										<!-- Manageable Only Toggle Button -->
										<UButton
											class="join-item"
											color="primary"
											:is-loading
											is-loading-icon="lucide:loader"
											icon="heroicons:shield-check"
											@click="toggleShowManageableOnly()"
										/>

										<!-- Sort Button -->
										<UButton class="join-item" color="primary" :is-loading @click="toggleSortOrder()">
											<template #leading>
												<UIcon
													v-motion
													:initial="{ opacity: 0 }"
													:enter="{ opacity: 1, transition: { duration: 150 } }"
													:leave="{ opacity: 0, transition: { duration: 150 } }"
													:name="sortAscending ? 'lucide:arrow-up-a-z' : 'lucide:arrow-down-z-a'"
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
										/>
									</UFieldGroup>

									<!-- Desktop Buttons (with view toggle) -->
									<UFieldGroup size="sm" class="join hidden items-end sm:flex">
										<!--
                    Manageable
                    Only
                    Toggle
                    Button
                    -->
										<UButton
											class="join-item"
											color="primary"
											:is-loading
											is-loading-icon="lucide:loader"
											icon="heroicons:shield-check"
											@click="toggleShowManageableOnly()"
										>
											<span>Manageable</span>
										</UButton>

										<!-- Sort Button -->
										<UButton class="join-item" color="primary" :is-loading @click="toggleSortOrder()">
											<template #leading>
												<UIcon
													v-motion
													:initial="{ opacity: 0 }"
													:enter="{ opacity: 1, transition: { duration: 150 } }"
													:leave="{ opacity: 0, transition: { duration: 150 } }"
													:name="sortAscending ? 'lucide:arrow-up-a-z' : 'lucide:arrow-down-z-a'"
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
									:is-retrying
									:on-retry="handleRetry"
								/>
							</div>
						</div>
						<div v-if="item.value === 'settings'" class="space-y-6">
							<div class="mb-6">
								<h2 class="text-2xl font-bold text-base-content">Settings</h2>
								<p class="mt-1 text-base-content/60">Manage your profile settings and preferences</p>
							</div>

							<!-- Accessibility Settings Card -->
							<UCard class="border border-base-200/60 bg-base-100 shadow-sm">
								<template #header>
									<div class="flex items-center gap-3">
										<div class="flex size-7 items-center justify-center rounded-full bg-primary/10">
											<UIcon name="heroicons:eye-20-solid" class="size-4 text-primary" />
										</div>

										<div>
											<h3 class="text-lg font-semibold text-base-content">Accessibility</h3>
											<p class="text-sm text-base-content/60">Customize your viewing experience</p>
										</div>
									</div>
								</template>

								<div class="space-y-4">
									<!-- Reduce Motion Toggle -->
									<div class="flex items-center justify-between rounded-lg border border-base-300 bg-base-200/50 p-4">
										<div class="flex-1">
											<div class="flex items-center gap-2">
												<UIcon name="heroicons:arrows-right-left" class="h-5 w-5 text-base-content/70" />
												<h4 class="font-medium text-base-content">Reduce Motion</h4>
											</div>
											<p class="mt-1 text-sm text-base-content/60">
												Minimize animations and transitions for a calmer experience
											</p>
										</div>
										<USwitch
											v-model="reduceMotionEnabled"
											size="lg"
											:disabled="effectiveReduceMotion"
											@update:model-value="setReduceMotion"
										/>
									</div>

									<!-- System Preference Info -->
									<div v-if="effectiveReduceMotion" class="flex items-start gap-3 rounded-lg border border-info/30 bg-info/10 p-4">
										<UIcon name="heroicons:information-circle" class="mt-0.5 h-5 w-5 shrink-0 text-info" />
										<div class="text-sm">
											<p class="font-medium text-info">System Preference Detected</p>
											<p class="mt-1 text-info/80">
												Your system is configured to reduce motion. This setting is automatically applied and cannot be
												overridden for your safety.
											</p>
										</div>
									</div>

									<!-- Motion Status Indicator -->
									<div class="flex items-center gap-2 text-sm">
										<span class="text-base-content/60">Current Status:</span>
										<UBadge :color="effectiveReduceMotion ? 'primary' : 'neutral'" variant="subtle">
											<template #leading>
												<UIcon
													:name="effectiveReduceMotion ? 'heroicons:check-circle' : 'heroicons:x-circle'"
													class="h-4 w-4"
												/>
											</template>
											{{ effectiveReduceMotion ? "Motion Reduced" : "Motion Enabled" }}
										</UBadge>
									</div>
								</div>
							</UCard>

							<!-- Privacy Settings Card -->
							<UCard class="border border-base-200/60 bg-base-100 shadow-sm">
								<template #header>
									<div class="flex items-center gap-3">
										<div class="flex size-7 items-center justify-center rounded-full bg-primary/10">
											<UIcon name="heroicons:lock-closed-20-solid" class="size-4 text-primary" />
										</div>
										<div>
											<h3 class="text-lg font-semibold text-base-content">Privacy</h3>
											<p class="text-sm text-base-content/60">Manage your privacy preferences</p>
										</div>
									</div>
								</template>
								<div class="flex flex-col items-center justify-center py-12">
									<div class="space-y-2 text-center">
										<UIcon name="heroicons:sparkles" class="mx-auto mb-4 size-12 text-base-content/30" />
										<h4 class="text-xl font-semibold text-base-content/60">Coming Soon</h4>
										<p class="text-sm text-base-content/40">Privacy controls and data management options coming soon</p>
									</div>
								</div>
							</UCard>

							<!-- Notifications Settings Card -->
							<UCard class="border border-base-200/60 bg-base-100 shadow-sm">
								<template #header>
									<div class="flex items-center gap-3">
										<div class="flex size-7 items-center justify-center rounded-full bg-primary/10">
											<UIcon name="heroicons:bell-20-solid" class="size-4 text-primary" />
										</div>
										<div>
											<h3 class="text-lg font-semibold text-base-content">Notifications</h3>
											<p class="text-sm text-base-content/60">Configure notification preferences</p>
										</div>
									</div>
								</template>
								<div class="flex flex-col items-center justify-center py-12">
									<div class="space-y-2 text-center">
										<UIcon name="heroicons:sparkles" class="mx-auto mb-4 size-12 text-base-content/30" />
										<h4 class="text-xl font-semibold text-base-content/60">Coming Soon</h4>
										<p class="text-sm text-base-content/40">Notification settings and preferences will be available soon</p>
									</div>
								</div>
							</UCard>
						</div>
						<div v-if="item.value === 'premium'" class="space-y-6">
							<UCard class="border-2 border-primary/30 bg-linear-to-br from-primary/10 via-transparent to-secondary/10 shadow-2xl">
								<template #header>
									<div>
										<h2 class="text-2xl font-bold text-base-content">Premium</h2>
										<p class="mt-1 text-base-content/60">Unlock advanced features and support the project</p>
									</div>
								</template>
								<div class="space-y-6">
									<div class="flex flex-col items-center space-y-4 text-center">
										<div class="flex size-18 items-center justify-center rounded-full bg-primary/20">
											<UIcon name="heroicons:sparkles-20-solid" class="size-12 text-primary" />
										</div>
										<div>
											<h3 class="text-3xl font-bold text-base-content">Upgrade to Premium</h3>
											<p class="mt-2 text-base-content/70">Unlock advanced features and get priority support</p>
										</div>
									</div>

									<!-- Feature List -->
									<div class="grid gap-4 sm:grid-cols-2">
										<div class="flex items-start gap-3">
											<div class="flex size-10 items-center justify-center rounded-full bg-success/20">
												<UIcon name="heroicons:check-circle" class="mt-0.5 size-7 text-success" />
											</div>
											<div>
												<p class="font-semibold text-base-content">Advanced Commands</p>
												<p class="text-sm text-base-content/60">Access to premium-only commands</p>
											</div>
										</div>
										<div class="flex items-start gap-3">
											<div class="flex size-10 items-center justify-center rounded-full bg-success/20">
												<UIcon name="heroicons:check-circle" class="mt-0.5 size-7 text-success" />
											</div>
											<div>
												<p class="font-semibold text-base-content">Priority Support</p>
												<p class="text-sm text-base-content/60">Get help faster from our team</p>
											</div>
										</div>
										<div class="flex items-start gap-3">
											<div class="flex size-10 items-center justify-center rounded-full bg-success/20">
												<UIcon name="heroicons:check-circle" class="mt-0.5 size-7 text-success" />
											</div>
											<div>
												<p class="font-semibold text-base-content">Custom Settings</p>
												<p class="text-sm text-base-content/60">Personalize your experience</p>
											</div>
										</div>
										<div class="flex items-start gap-3">
											<div class="flex size-10 items-center justify-center rounded-full bg-success/20">
												<UIcon name="heroicons:check-circle" class="mt-0.5 size-7 text-success" />
											</div>
											<div>
												<p class="font-semibold text-base-content">Early Access</p>
												<p class="text-sm text-base-content/60">Try new features first</p>
											</div>
										</div>
									</div>
								</div>
								<template #footer>
									<UFieldGroup size="md" class="z-10 flex w-full justify-center pt-4">
										<UButton color="primary">Get Premium</UButton>
										<UButton color="primary" variant="outline"> Learn More </UButton>
									</UFieldGroup>
								</template>
							</UCard>
						</div>
					</div>
				</template>
			</UTabs>
		</section>
	</UContainer>
</template>

<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

definePageMeta({ alias: ["/account"] });

useSeoMetadata({
	description: "Manage your profile, servers and settings",
	shouldOgImage: true,
	title: "Profile",
});

const { user } = useAuth();

// Tab Management - inspired by Dyno.gg tab system
const activeTab = ref("servers");
const { copy, copied } = useClipboard();
const searchQuery = ref<null | string>(null);
const isAnimated = ref(false);
const isDefault = ref(false);

// Error handling state
const isRetrying = ref(false);

// Toggles
// Is true by default because we want to show only manageable servers
const [showManageableOnly, toggleShowManageableOnly] = useToggle(true);
// Sort order: true for ascending, false for descending
const [sortAscending, toggleSortOrder] = useToggle(true);

// Accessibility - Reduce Motion
const { reduceMotionEnabled, effectiveReduceMotion, setReduceMotion } = useReduceMotion();

const preferredFormat = computed<"gif" | "png">(() => {
	if (isAnimated.value && !effectiveReduceMotion.value) {
		return "gif";
	}

	return "png";
});

// Use the centralized useUser composable instead of manual useFetch
// Note: Logging hooks from Phase 3 were skipped, so logging is temporarily lost
// Transform and getCachedData are handled internally by useUser (from Phase 2)
const { data, filteredGuilds, status, error, refresh } = useUser(user, {
	timeout: 15_000, // 15 seconds timeout
	retry: 3, // Max retry attempts
	retryDelay: 1000, // 1 second delay between retries
	search: {
		query: searchQuery,
		showManageableOnly,
		sortAscending,
	},
});

// Extract guilds from useUser data
const guilds = computed(() => data.value?.transformedGuilds ?? []);

// Loading state based on status from useUser
const isLoading = computed(() => status.value === "pending");

// Retry handler
async function handleRetry() {
	isRetrying.value = true;
	try {
		await refresh();
	} finally {
		isRetrying.value = false;
	}
}

// Enhanced tabs configuration
const items = computed<TabsItem[]>(() => [
	{
		badge: isLoading.value
			? { color: "primary", trailingIcon: "lucide:loader" }
			: { color: "primary", label: `${guilds.value?.length ?? "N/A"}` },
		icon: "heroicons:server",
		label: "Servers",
		value: "servers",
	},
	{
		icon: "heroicons:cog-6-tooth",
		label: "Settings",
		value: "settings",
	},
	{
		icon: "heroicons:star",
		label: "Premium",
		value: "premium",
	},
]);

const defaultAvatar = computed(() =>
	user.value?.id ? `https://cdn.discordapp.com/embed/avatars/${BigInt(user.value.id) % 5n}.png` : "https://cdn.discordapp.com/embed/avatars/0.png",
);

function undoSearch() {
	searchQuery.value = null;
}

async function copyUserId() {
	if (user.value?.id) {
		await copy(user.value.id);
	}
}

function createUrl(format: "webp" | "png" | "gif", size: number) {
	return `https://cdn.discordapp.com/avatars/${user.value!.id}/${user.value!.avatar}.${format}?size=${size}`;
}

watch(
	user,
	(user) => {
		if (user?.avatar) {
			isDefault.value = false;
			isAnimated.value = user.avatar.startsWith("a_");
		} else {
			isDefault.value = true;
			isAnimated.value = false;
		}
	},
	{ immediate: true },
);
</script>
