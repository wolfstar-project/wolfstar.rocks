<template>
	<UContainer
		class="w-full max-w-7xl px-4 py-4 text-base-content sm:px-6 sm:py-6 lg:px-8"
		role="region"
		:aria-label="t('profile.server_list_aria')"
	>
		<div class="mb-4 flex flex-col justify-between gap-4 sm:flex-row">
			<div class="flex items-start">
				<div v-if="loading || filterLoading" class="text-sm text-base-content/60 sm:block">
					<div class="flex animate-pulse items-center">
						<div class="h-4 w-24 rounded bg-base-content/20"></div>
						<div class="mx-1 h-4 w-4 rounded bg-base-content/20"></div>
						<div class="h-4 w-24 rounded bg-base-content/20"></div>
					</div>
				</div>
				<div
					v-else-if="guilds"
					class="text-sm text-base-content/60 sm:block"
					role="status"
					aria-live="polite"
					aria-atomic="true"
				>
					<span>{{
						t("profile.servers_count", {
							filtered: filteredGuilds.length,
							total: guilds?.length || 0,
						})
					}}</span>
					<span v-if="searchQuery" class="sr-only">{{
						t("profile.search_matching", { query: searchQuery })
					}}</span>
				</div>
			</div>
		</div>

		<div class="w-full">
			<!-- Loading Skeleton Grid -->
			<div ref="scrollComponent">
				<!-- Loading Skeleton Grid -->
				<div
					v-if="loading || filterLoading"
					class="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5"
					role="status"
					:aria-label="
						filterLoading ? t('profile.applying_filters') : t('profile.loading_servers')
					"
				>
					<guild-card v-for="n in INITIAL_COUNT" :key="n" :loading="true" />
				</div>

				<!-- Guild Cards Grid -->
				<TransitionGroup
					v-else-if="paginatedGuilds.length > 0"
					:key="String(filterKey)"
					name="guild-list"
					tag="div"
					class="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5"
					role="list"
					:aria-label="t('profile.servers_list_aria')"
				>
					<guild-card
						v-for="guild in paginatedGuilds"
						:key="guild.id"
						v-memo="[guild.id, guild.name, guild.manageable, guild.wolfstarIsIn]"
						:guild
						role="listitem"
					/>
				</TransitionGroup>
			</div>

			<!-- Loading Indicator for Infinite Scroll -->
			<div
				v-if="!loading && loadingMore"
				class="flex justify-center py-4"
				role="status"
				:aria-label="t('profile.loading_more')"
			>
				<span
					class="loading loading-lg loading-spinner text-primary"
					aria-hidden="true"
				></span>
			</div>

			<!-- Error State with Enhanced UX -->
			<div v-if="errorVisible" style="view-transition-name: guild-error-state" class="py-8">
				<div
					class="mx-auto max-w-2xl rounded-xl border p-6"
					:class="[
						errorState.color === 'warning'
							? 'border-warning/30 bg-warning/10 text-warning'
							: 'border-error/30 bg-error/10 text-error',
					]"
				>
					<div class="flex items-start gap-4">
						<div class="shrink-0">
							<UIcon :name="errorState.icon" class="size-6" />
						</div>
						<div class="flex-1 space-y-2">
							<h3 class="text-lg font-semibold">{{ errorState.title }}</h3>
							<p class="opacity-90">{{ errorState.description }}</p>
							<p v-if="errorState.suggestion" class="text-sm opacity-70">
								{{ errorState.suggestion }}
							</p>
						</div>
					</div>
					<div class="mt-4 flex justify-end">
						<UButton
							v-if="error?.status === 401"
							color="error"
							variant="outline"
							size="sm"
							icon="heroicons:arrow-path"
							to="/login"
						>
							{{ t("profile.reload_page") }}
						</UButton>
						<UButton
							v-else-if="onRetry"
							:color="errorState.color"
							variant="outline"
							size="sm"
							icon="heroicons:arrow-path"
							:loading="isRetrying"
							@click="onRetry"
						>
							{{ isRetrying ? t("errors.retrying") : t("common.retry") }}
						</UButton>
					</div>
				</div>
			</div>

			<!-- Empty State -->
			<div v-if="!loading && !error && filteredGuilds.length === 0">
				<div class="flex flex-col items-center justify-center space-y-6 py-16">
					<div class="py-16 text-center" role="status" aria-live="polite">
						<h2 class="mb-2 text-xl font-bold text-base-content/80">
							{{
								searchQuery
									? t("profile.no_matching_servers")
									: t("profile.no_servers")
							}}
						</h2>
						<p class="mx-auto max-w-md text-base-content/60">
							{{
								searchQuery
									? t("profile.no_matching_description")
									: t("profile.no_servers_description")
							}}
						</p>
					</div>

					<UButton
						v-if="searchQuery"
						variant="outline"
						size="sm"
						class="gap-2 transition-all duration-200 hover:scale-105"
						icon="heroicons:x-mark"
						:aria-label="t('profile.clear_search')"
						@click="undoSearch"
					>
						{{ t("profile.clear_search") }}
					</UButton>
				</div>
			</div>
		</div>
	</UContainer>
</template>

<script setup lang="ts">
import type { FetchError } from "ofetch";
import { useInfiniteScroll } from "@vueuse/core";

interface GuildCardsProps {
	filteredGuilds: NonNullable<TransformedLoginData["transformedGuilds"]>;
	guilds: TransformedLoginData["transformedGuilds"] | null;
	undoSearch: () => void;
	searchQuery: string | undefined;
	loading: boolean;
	filterLoading?: boolean;
	filterKey?: boolean;
	error: FetchError<any> | undefined;
	isRetrying?: boolean;
	onRetry?: () => void;
}

interface DocumentWithActiveVT extends Document {
	readonly activeViewTransition: ViewTransition | null;
}

const {
	filteredGuilds,
	guilds,
	undoSearch,
	searchQuery,
	loading,
	filterLoading = false,
	filterKey,
	error,
	isRetrying = false,
	onRetry,
} = defineProps<GuildCardsProps>();

const { t } = useI18n();
const { effectiveReduceMotion } = useReduceMotion();

// Error handling computed properties
const isTimeoutError = computed(() => error?.status === 408);
const isNetworkError = computed(
	() =>
		(error?.status === 0 ||
			error?.message?.includes("network") ||
			error?.message?.includes("fetch")) ??
		false,
);

const errorState = computed(() => ({
	color: (() => {
		if (isTimeoutError.value || isNetworkError.value || error?.status === 429) {
			return "warning";
		}
		return "error";
	})() as "error" | "warning",
	description: (() => {
		if (!error) {
			return t("errors.unexpected");
		}
		if (isTimeoutError.value) {
			return t("errors.request_timeout_description");
		}
		if (error.status === 401) {
			return t("errors.session_expired_description");
		}
		if (error.status === 403) {
			return t("errors.access_denied_description");
		}
		if (error.status === 429) {
			return t("errors.too_many_requests_description");
		}
		if (error.status && error.status >= 500) {
			return t("errors.server_error");
		}
		if (isNetworkError.value) {
			return t("errors.network_error_description");
		}
		return error.statusText ?? error.message ?? t("errors.failed_to_load_servers");
	})(),
	icon: (() => {
		if (isTimeoutError.value) {
			return "heroicons:clock";
		}
		if (error?.status === 401) {
			return "heroicons:lock-closed";
		}
		if (error?.status === 403) {
			return "heroicons:shield-exclamation";
		}
		if (error?.status === 429) {
			return "heroicons:hand-raised";
		}
		if (error?.status && error.status >= 500) {
			return "heroicons:server";
		}
		if (isNetworkError.value) {
			return "heroicons:signal-slash";
		}
		return "heroicons:exclamation-triangle";
	})(),
	suggestion: (() => {
		if (isTimeoutError.value) {
			return t("errors.request_timeout_suggestion");
		}
		if (error?.status === 429) {
			return t("errors.rate_limit");
		}
		if (error?.status && error.status >= 500) {
			return t("errors.if_persists");
		}
		if (isNetworkError.value) {
			return t("errors.check_connection");
		}
		return undefined;
	})(),
	title: (() => {
		if (!error) {
			return t("common.error");
		}
		if (isTimeoutError.value) {
			return t("errors.request_timeout");
		}
		if (error.status === 401) {
			return t("errors.session_expired");
		}
		if (error.status === 403) {
			return t("errors.access_denied");
		}
		if (error.status === 429) {
			return t("errors.too_many_requests");
		}
		if (error.status && error.status >= 500) {
			return t("errors.server_error_title");
		}
		if (isNetworkError.value) {
			return t("errors.network_error");
		}
		return t("errors.loading_servers");
	})(),
}));

const INITIAL_COUNT = 20;

const showError = computed(() => !loading && !!error);
const errorVisible = ref(showError.value);

if (import.meta.client) {
	watch(showError, (newVal) => {
		if (!document.startViewTransition) {
			errorVisible.value = newVal;
			return;
		}
		if (effectiveReduceMotion.value) {
			errorVisible.value = newVal;
			return;
		}
		if ((document as DocumentWithActiveVT).activeViewTransition) {
			errorVisible.value = newVal;
			return;
		}
		document.startViewTransition(async () => {
			errorVisible.value = newVal;
			await nextTick();
		});
	});
}
const LOAD_MORE_COUNT = 10;

const visibleCount = ref(INITIAL_COUNT);
const scrollComponent = useTemplateRef<HTMLElement>("scrollComponent");

const paginatedGuilds = computed(() => filteredGuilds.slice(0, visibleCount.value));

const { isLoading: loadingMore, reset } = useInfiniteScroll(
	scrollComponent,
	() => {
		visibleCount.value += LOAD_MORE_COUNT;
	},
	{
		canLoadMore: () => visibleCount.value < filteredGuilds.length,
		distance: 10,
	},
);

watch(
	() => filteredGuilds,
	() => {
		visibleCount.value = INITIAL_COUNT;
		reset();
	},
);
</script>

<style scoped>
.guild-list-move,
.guild-list-enter-active,
.guild-list-leave-active {
	transition-duration: 0.3s;
	transition-property: transform, opacity;
	transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.guild-list-enter-from,
.guild-list-leave-to {
	transform: scale(0.95);
	opacity: 0;
}

.guild-list-leave-active {
	position: absolute;
}
</style>
