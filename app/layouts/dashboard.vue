<template>
	<!-- On a phone one screen shows at a time: the list (servers and sections) or the page. -->
	<div class="console" :class="{ 'console--page': screen === 'page' }">
		<GuildServerRail
			:current-guild-id="guildId ?? undefined"
			:guilds="userGuilds"
			:pending="userGuildsPending"
			@select="goToGuild"
			@home="goToGuild(null)"
		/>

		<aside
			v-if="guildId"
			ref="consoleList"
			class="console-sidebar"
			:aria-label="ts('dashboard.nav_aria')"
		>
			<DashboardSidebar floating @navigate="openPageOnPhone" />
		</aside>
		<!-- No server open: the Home, with the bots' direct messages. -->
		<aside
			v-else
			ref="consoleList"
			class="console-sidebar"
			:aria-label="ts('dashboard.dm.title')"
		>
			<DashboardDirectMessages floating @navigate="openPageOnPhone" />
		</aside>

		<div ref="consoleMain" class="console-main">
			<!-- The page shows its own skeleton until the server's data is in. -->
			<slot v-if="!guildId || !nuxtError"></slot>
			<div
				v-else
				class="flex w-full flex-1 flex-col items-center justify-center space-y-4 px-4 text-center"
				role="alert"
				:aria-label="ts('dashboard.error_aria')"
			>
				<UIcon name="ph:warning-duotone" class="size-12 text-error" aria-hidden="true" />
				<div class="space-y-2">
					<h2 class="text-xl font-semibold text-base-content">
						{{ nuxtError.statusMessage || ts("dashboard.error_title") }}
					</h2>
					<p v-if="nuxtError.status === 403">
						{{ ts("dashboard.error_forbidden") }}
					</p>
					<p class="text-sm text-base-content/60">
						{{ nuxtError.message || ts("dashboard.error_fallback") }}
					</p>
				</div>
			</div>
			<div
				v-if="showSaveChangesBar"
				style="view-transition-name: save-changes-bar"
				role="region"
				:aria-label="ts('dashboard.unsaved_title')"
				class="console-savebar"
			>
				<span class="size-2 shrink-0 rounded-full bg-warning" aria-hidden="true"></span>
				<span class="console-savebar-status">{{ ts("dashboard.unsaved_bar") }}</span>
				<UButton
					color="primary"
					icon="heroicons:check"
					class="console-savebar-action"
					@click="submitChanges"
				>
					{{ ts("dashboard.save_changes") }}
				</UButton>
				<UButton
					color="neutral"
					variant="outline"
					icon="heroicons:arrow-path"
					class="console-savebar-action"
					@click="resetChanges"
				>
					{{ ts("dashboard.reset_changes") }}
				</UButton>
			</div>

			<!-- The phone's page names its server and section here; the save bar takes its place. -->
			<DashboardContextCard v-if="guildId && !showSaveChangesBar" />
		</div>

		<UModal
			:open="leaveDialogOpen"
			:title="ts('dashboard.unsaved_title')"
			:description="ts('dashboard.unsaved_description')"
			:dismissible="false"
		>
			<template #footer>
				<div class="flex justify-end gap-2">
					<UButton
						color="neutral"
						variant="outline"
						class="dialog-cancel"
						@click="stayOnPage"
					>
						{{ ts("dashboard.stay_on_page") }}
					</UButton>
					<UButton color="error" @click="discardAndLeave">
						{{ ts("dashboard.discard_changes") }}
					</UButton>
				</div>
			</template>
		</UModal>

		<Transition name="dashboard-loader">
			<DashboardLoader v-if="booting" />
		</Transition>
	</div>
</template>

<script setup lang="ts">
import type { GuildData } from "#server/database";
import { objectValues } from "@sapphire/utilities";
import { isNullOrUndefined } from "@sapphire/utilities/isNullish";
import { objectToTuples } from "@sapphire/utilities/objectToTuples";
import { parseError } from "evlog";
import {
	parseGuildSettings,
	classifyGuildError,
	parseGuildSettingsSaveResponse,
	guildSettingsSaveFailureToast,
} from "~/utils/guild-dashboard";

function isSafeUrl(url: unknown): url is string {
	if (typeof url !== "string") return false;
	try {
		const { protocol } = new URL(url);
		return protocol === "https:";
	} catch {
		return false;
	}
}

const { ts } = useI18n();

// The guild is dashboard state, not a route param: `/app` is one page.
const {
	activeGuildId: guildId,
	cancelPendingNavigation,
	confirmPendingNavigation,
	goToGuild,
	pendingNavigation,
} = useDashboardNavigation();
const { selectGuild } = useActiveGuild();

const toast = useToast();
const router = useRouter();
const { isPhone, openPage, screen } = usePhoneScreen();
usePhoneScreenFocus(
	useTemplateRef<HTMLElement>("consoleList"),
	useTemplateRef<HTMLElement>("consoleMain"),
);
const nuxtError = useError();
const { setGuildData } = useGuildData();
const { setGuildSettings, guildSettings } = useGuildSettings();
const { setGuildSettingsChanges, guildSettingsChanges, resetGuildSettingsChanges } =
	useGuildSettingsChanges();

const { user } = useUserSession();
const { guilds: userGuilds, status: userGuildsStatus } = useUser(user);
// `useUser()` only fetches on the client, so the rail renders placeholders until
// the guild list lands rather than appearing late and shifting the page.
const userGuildsPending = computed(
	() => userGuildsStatus.value === "idle" || userGuildsStatus.value === "pending",
);
watch(
	[guildId, userGuilds],
	([newGuildId, newUserGuilds]) => {
		const seedGuild = newUserGuilds?.find((g) => g.id === newGuildId);
		if (seedGuild) {
			setGuildData(seedGuild);
		}
	},
	{ immediate: true },
);

const requestFetch = useRequestFetch();
const route = useRoute();
const refreshGuildCache = computed(() => route.query.refresh === "true");

// A server card's link carries its guild so that opening it in a new tab lands
// on that server. The id moves into state here and leaves the URL.
watch(
	() => route.query.guild,
	(requestedGuildId) => {
		if (!isValidGuildId(requestedGuildId)) {
			return;
		}
		goToGuild(requestedGuildId);
		void router.replace({ query: { ...route.query, guild: undefined } });
	},
	{ immediate: true },
);

// Kept in the browser, so a reload opens on the server as it was last seen
// while it is fetched again.
const { data, error } = usePersistedAsyncData(
	() => `dashboard:guild:${guildId.value ?? "none"}`,
	() => {
		if (!guildId.value) {
			return Promise.resolve(null);
		}
		const refreshQuery = refreshGuildCache.value ? { refresh: "true" } : undefined;
		return Promise.all([
			requestFetch<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>(
				`/api/guilds/${guildId.value}`,
				{ query: refreshQuery },
			),
			requestFetch<string>(`/api/guilds/${guildId.value}/settings`, {
				query: refreshQuery,
			}),
		]);
	},
	{ watch: [guildId] },
);

// The first entry shows the bot's mark until the server list and the open
// server are in, or the server failed to load. It does not come back when the
// admin switches servers: the page shows its skeleton for that.
const booting = ref(true);
watch(
	[userGuildsPending, guildId, () => data.value, () => error.value],
	([pending, id, loaded, failed]) => {
		if (!pending && (!id || loaded || failed)) {
			booting.value = false;
		}
	},
	{ immediate: true },
);

watch(
	data,
	(newData) => {
		if (newData) {
			setGuildData(newData[0]);

			const parsedSettings = parseGuildSettings(
				newData[1],
				guildSettings.value ?? {},
				(parseErr) => {
					log.error({
						tag: "wolfstar:dashboard",
						message: `Failed to parse guild settings payload for guild Id: ${guildId.value}`,
						error: parseError(parseErr),
					});
				},
			);

			setGuildSettings(parsedSettings as GuildData);

			// One uncached load is enough after the bot was invited: left in the
			// URL, the flag would bypass the cache for every guild opened later.
			if (refreshGuildCache.value) {
				void router.replace({ query: { ...route.query, refresh: undefined } });
			}

			if (nuxtError.value) {
				clearError();
			}
		}
	},
	{ immediate: true },
);

watch(
	error,
	async (err) => {
		if (err) {
			const parsedError = parseError(err);

			log.error({
				tag: "wolfstar:dashboard",
				message: `Error loading guild data or settings for guild Id: ${guildId.value}`,
				error: parsedError,
			});

			const failure = classifyGuildError(parsedError.status);
			// The selection is restored from storage on the next visit: left in
			// place, a guild the admin can no longer open would fail every time.
			// A signed-out session keeps it, to come back to after signing in.
			if (failure !== "unauthorized") {
				selectGuild(null);
			}

			switch (failure) {
				case "forbidden": {
					if (import.meta.client) {
						toast.add({
							title: ts("dashboard.access_denied_title"),
							description: ts("dashboard.access_denied_description"),
							color: "error",
							icon: "heroicons:x-circle",
						});
					}
					if (import.meta.client && window.history.length > 1) {
						router.back();
					} else {
						await navigateTo("/");
					}
					break;
				}
				case "unauthorized": {
					if (import.meta.client) {
						toast.add({
							title: ts("dashboard.unauthorized_title"),
							description: ts("dashboard.unauthorized_description"),
							color: "error",
							icon: "heroicons:x-circle",
						});
					}
					if (import.meta.client && window.history.length > 1) {
						router.back();
					} else {
						await navigateTo("/");
					}
					break;
				}
				default: {
					if (import.meta.client) {
						const link = isSafeUrl(parsedError.link) ? parsedError.link : null;
						toast.add({
							title: parsedError.message,
							description: parsedError.why,
							color: "error",
							actions: link
								? [
										{
											label: ts("common.learn_more"),
											onClick: () => {
												window.open(link, "_blank", "noopener,noreferrer");
											},
										},
									]
								: undefined,
							icon: "heroicons:x-circle",
						});
					}
					showError({
						status: parsedError.status || 500,
						message: parsedError.message,
						data: {
							why: parsedError.why,
							fix: parsedError.fix,
							link: parsedError.link,
						},
					});
				}
			}
		}
	},
	{ immediate: true },
);

const { effectiveReduceMotion } = useReduceMotion();

const isReadyToSubmit = computed(
	() =>
		!isNullOrUndefined(guildSettingsChanges.value) &&
		objectValues(guildSettingsChanges.value).length > 0,
);

// The bar's own view transition (see `view-transitions.css`) animates it in and
// out, so its visibility is committed inside one instead of a Vue transition.
// Leaving a guild with staged changes hides the bar from the `guildId` watcher
// below, mid-navigation: a navigation transition owns the screen, so the bar
// rides along with it rather than interrupting it for one of its own.
const showSaveChangesBar = ref(isReadyToSubmit.value);
watch(isReadyToSubmit, () => {
	// Read the state when the transition commits, not when it was requested: a
	// later change that bypasses a running transition must not be overwritten.
	startViewTransition(() => (showSaveChangesBar.value = isReadyToSubmit.value), {
		reduceMotion: effectiveReduceMotion.value,
		whenActive: "bypass",
	});
});

const { discardAll: discardCommandPermissionDrafts, hasDrafts: hasCommandPermissionDrafts } =
	useCommandPermissionDrafts();
// Unsent command permission edits are lost on a reload too, like staged settings.
const { showDialog, confirmLeave, cancelLeave } = useUnsavedChanges(
	computed(() => isReadyToSubmit.value || hasCommandPermissionDrafts.value),
);

// One dialog covers both ways of leaving staged edits behind: a route change
// (router guard) and a guild/section switch inside `/app` (pending navigation).
const leaveDialogOpen = computed(() => showDialog.value || pendingNavigation.value !== null);

function stayOnPage() {
	cancelPendingNavigation();
	cancelLeave();
}

function discardAndLeave() {
	if (pendingNavigation.value) {
		resetGuildSettingsChanges();
		discardCommandPermissionDrafts();
		confirmPendingNavigation();
		return;
	}
	// The active guild outlives the route, so a draft left in place would be
	// back on the next visit to `/app` after the admin chose to discard it.
	resetGuildSettingsChanges();
	discardCommandPermissionDrafts();
	confirmLeave();
}

// A section picked in the phone's list opens its page; on a wider screen both show.
function openPageOnPhone() {
	if (isPhone.value) void openPage();
}

async function submitChanges() {
	// The admin can confirm a guild switch while this PATCH is in flight, so the
	// id is captured here and every later write targets it. Reading
	// `guildId.value` after the await would apply this guild's response to
	// whichever guild is active by then, and clear that guild's staged edits.
	const targetGuildId = guildId.value;
	if (!targetGuildId) {
		return;
	}

	let data: GuildData;
	try {
		const response = await $fetch(`/api/guilds/${targetGuildId}/settings`, {
			body: {
				data: objectToTuples(guildSettingsChanges.value as Partial<GuildData>),
			},
			method: "PATCH",
		});
		data = parseGuildSettingsSaveResponse(response) as GuildData;
	} catch (error) {
		log.error({
			tag: "wolfstar:dashboard",
			message: `Failed to save settings update for guild Id: ${targetGuildId}`,
			error: parseError(error),
		});
		// Preserve staged edits; only notify so the admin can retry.
		toast.add(guildSettingsSaveFailureToast(ts, error));
		return;
	}

	if (isNullOrUndefined(data) || objectValues(data).length === 0) {
		return;
	}

	const savedSettings = data;
	startViewTransition(
		() => {
			setGuildSettings(savedSettings, targetGuildId);
			setGuildSettingsChanges(undefined, targetGuildId);
		},
		{ reduceMotion: effectiveReduceMotion.value },
	);

	log.info(
		"wolfstar:dashboard",
		`Guild settings changes saved successfully for guild Id: ${targetGuildId}`,
	);

	toast.add({
		color: "success",
		description: ts("dashboard.settings_saved_description"),
		icon: "i-heroicons-check-circle",
		title: ts("dashboard.settings_saved_title"),
	});
}

function resetChanges() {
	startViewTransition(resetGuildSettingsChanges, { reduceMotion: effectiveReduceMotion.value });

	log.info("wolfstar:dashboard", `Guild settings changes reset for guild Id: ${guildId.value}`);

	toast.add({
		color: "info",
		description: ts("dashboard.changes_reset_description"),
		icon: "heroicons:arrow-path",
		title: ts("dashboard.changes_reset_title"),
	});
}

// Clear staged changes when guild ID changes (prevents cross-guild leakage)
watch(guildId, (newGuildId, oldGuildId) => {
	if (oldGuildId && newGuildId !== oldGuildId) {
		resetGuildSettingsChanges();
		log.info(
			"wolfstar:dashboard",
			`Cleared staged changes due to guild switch from ${oldGuildId} to ${newGuildId}`,
		);
	}
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

/*
 * Surfaces of the dashboard, from the rail (darkest) over the sidebar and cards
 * to the page. In the light theme the cards and the sidebar are as bright as the
 * page and only the rail is tinted. Components inside read these variables.
 */
.console {
	--console-main: var(--ink-600);
	--console-surface: var(--ink-700);
	--console-rail: var(--ink-800);
	--console-input: var(--ink-500);
	/* What floats or must not show through: the account card, the save bar, the
	   server tiles. A colour theme turns the others into veils over its gradient. */
	--console-solid: var(--ink-700);
	--console-border: var(--ink-400);
	--console-hover: oklch(100% 0 0 / 0.04);
	--console-active: oklch(100% 0 0 / 0.08);
	--console-shadow-low:
		0 1px 0 oklch(0% 0 0 / 0.2), 0 1.5px 0 oklch(0% 0 0 / 0.05), 0 2px 0 oklch(0% 0 0 / 0.05);

	color: var(--ui-text);
}

.console {
	@apply relative flex h-dvh min-h-0 w-full overflow-hidden;
	background-color: var(--console-main);

	/* The server rail and the sidebar read these; the account card floating
	   over both is as wide as their sum. */
	--console-rail-width: 3.75rem;
	--console-sidebar-width: 12.25rem;
}

@variant md {
	.console {
		--console-rail-width: 4rem;
		--console-sidebar-width: 13.25rem;
	}
}

@variant lg {
	.console {
		--console-rail-width: 4.25rem;
		--console-sidebar-width: 14.75rem;
	}
}

@variant theme-light {
	.console {
		--console-main: var(--color-base-100);
		--console-surface: var(--color-base-100);
		--console-rail: oklch(92.1% 0.005 258.3);
		--console-input: oklch(94.5% 0.003 247.9);
		--console-solid: oklch(94.5% 0.003 247.9);
		--console-border: oklch(91% 0.006 275);
		--console-hover: oklch(0% 0 0 / 0.03);
		--console-active: oklch(0% 0 0 / 0.07);
		--console-shadow-low: 0 1px 2px oklch(0% 0 0 / 0.08);
	}
}

.console-sidebar {
	@apply hidden h-full shrink-0 sm:block;
	width: var(--console-sidebar-width);
	background-color: var(--console-surface);
	border-right: 1px solid var(--home-border-subtle);
}

.console-main {
	@apply relative flex h-full min-h-0 min-w-0 flex-1 flex-col;
	background-color: var(--console-main);
}

/* The phone's two screens. The list is the server rail and the sidebar, the
   sidebar taking the width the page leaves; the page is the page alone. */
@variant max-sm {
	.console:not(.console--page) :deep(.guild-rail) {
		display: flex;
	}

	.console:not(.console--page) .console-sidebar {
		@apply block min-w-0 flex-1;
	}

	.console:not(.console--page) .console-main {
		display: none;
	}
}

/* A floating card rather than a docked strip. On phones it sits in the flow at
   the foot of the page, where the context card was; from `sm` up it floats over
   the end of the page, which gets room to scroll clear of it (see below). */
.console-savebar {
	@apply z-10 mx-3 my-2 flex shrink-0 items-center gap-2.5 rounded-[10px] py-2.5 pr-3 pl-4 sm:absolute sm:inset-x-4 sm:bottom-4 sm:m-0;
	background-color: var(--console-solid);
	border: 1px solid var(--console-border);
	box-shadow:
		0 8px 24px oklch(0% 0 0 / 0.28),
		0 2px 6px oklch(0% 0 0 / 0.2);
}

/* Below desktop the two actions share the card and the dot says the rest. */
.console-savebar-status {
	@apply hidden min-w-0 flex-1 text-sm lg:block;
}

.console-savebar-action {
	@apply h-9 flex-1 justify-center rounded-md px-4 lg:flex-none;
}

.console-main:has(> .console-savebar) :deep(.console-content) {
	@variant sm {
		padding-bottom: 5.5rem;
	}
}
</style>
