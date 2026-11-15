<template>
	<UModal
		v-model:open="isOpen"
		:title="ts('profile.settings_title')"
		:description="ts('profile.settings_tagline')"
		:ui="{
			content:
				'h-dvh max-h-dvh w-full max-w-none rounded-none bg-(--ink-600) theme-light:bg-base-100 md:h-[calc(100dvh-2.5rem)] md:max-h-302 md:w-[calc(100vw-3rem)] md:max-w-437 md:rounded-[12px]',
		}"
	>
		<template #content>
			<div class="settings" :class="{ 'settings--detail': detailOpen }">
				<nav class="settings-nav" :aria-label="ts('profile.sections_aria')">
					<div class="settings-mobile-header md:hidden">
						<button
							type="button"
							class="settings-mobile-close"
							:aria-label="ts('profile.close')"
							@click="isOpen = false"
						>
							<UIcon name="ic:round-close" class="size-5" aria-hidden="true" />
						</button>
						<h2 class="text-xl font-bold">{{ ts("profile.settings_title") }}</h2>
					</div>
					<!-- Discord's settings open on who is signed in, with the way to edit it. -->
					<div v-if="account" class="settings-profile">
						<AppUserAvatar :src="discordAvatar" :decoration avatar-class="size-14" />
						<div class="min-w-0">
							<p class="flex min-w-0 text-base font-semibold">
								<AppDisplayName :name="account.display" :styles="nameStyles" />
							</p>
							<a
								href="https://discord.com/channels/@me"
								target="_blank"
								rel="noopener noreferrer"
								class="settings-profile-edit"
							>
								{{ ts("profile.edit_on_discord") }}
								<UIcon name="ic:round-edit" class="size-3.5" aria-hidden="true" />
							</a>
						</div>
					</div>
					<div class="settings-search">
						<UInput
							v-model="searchQuery"
							icon="ic:round-search"
							size="lg"
							:placeholder="ts('common.search')"
							:aria-label="ts('common.search')"
							class="w-full"
						/>
					</div>
					<p class="settings-nav-label md:hidden" aria-hidden="true">
						{{ ts("profile.sections_aria") }}
					</p>
					<p
						v-if="searchQuery.trim() && !pageGroups.length && !reportSection"
						class="settings-empty"
						role="status"
					>
						{{ ts("profile.search_empty") }}
					</p>
					<template v-for="(group, index) in pageGroups" :key="group.items[0]!.id">
						<div v-if="index > 0" class="settings-nav-divider"></div>
						<p v-if="group.label" class="settings-group-label">{{ group.label }}</p>
						<div class="settings-nav-group">
							<button
								v-for="item in group.items"
								:key="item.id"
								type="button"
								class="settings-nav-item"
								:class="{ 'settings-nav-item--current': item.id === section }"
								:aria-current="item.id === section ? 'page' : undefined"
								@click="openSection(item.id)"
							>
								<UIcon
									:name="item.icon"
									class="size-5.5 shrink-0"
									aria-hidden="true"
								/>
								<span class="grow">{{ item.label }}</span>
								<UIcon
									name="ic:round-chevron-right"
									class="size-4.5 text-muted md:hidden"
									aria-hidden="true"
								/>
							</button>
						</div>
					</template>
					<div
						v-if="pageGroups.length && (reportSection || !searchQuery.trim())"
						class="settings-nav-divider"
					></div>
					<!-- Help and the cookie choice have a group; leaving is alone under it, as on Discord. -->
					<p v-if="!searchQuery.trim()" class="settings-group-label">
						{{ ts("profile.group_support") }}
					</p>
					<div v-if="reportSection || !searchQuery.trim()" class="settings-nav-group">
						<button
							v-if="reportSection"
							type="button"
							class="settings-nav-item"
							:class="{ 'settings-nav-item--current': section === 'report' }"
							:aria-current="section === 'report' ? 'page' : undefined"
							@click="openSection('report')"
						>
							<UIcon
								:name="reportSection.icon"
								class="size-5.5 shrink-0"
								aria-hidden="true"
							/>
							<span class="grow">{{ reportSection.label }}</span>
							<UIcon
								name="ic:round-chevron-right"
								class="size-4.5 text-muted md:hidden"
								aria-hidden="true"
							/>
						</button>
						<!-- The dashboard has no footer: the cookie choice is changed or withdrawn from here. -->
						<button
							v-if="!searchQuery.trim()"
							type="button"
							class="settings-nav-item"
							@click="openCookieSettings"
						>
							<UIcon
								name="ic:round-cookie"
								class="size-5.5 shrink-0"
								aria-hidden="true"
							/>
							<span class="grow">{{ ts("consent.footer_link") }}</span>
						</button>
					</div>
					<template v-if="account && !searchQuery.trim()">
						<div class="settings-nav-divider"></div>
						<div class="settings-nav-group">
							<button
								type="button"
								class="settings-nav-item text-error!"
								@click="logOut"
							>
								<UIcon
									name="ic:round-logout"
									class="size-5.5 shrink-0"
									aria-hidden="true"
								/>
								<span class="grow">{{ ts("user_menu.sign_out") }}</span>
							</button>
						</div>
					</template>
				</nav>

				<section class="settings-page" :aria-labelledby="headingId">
					<!-- Discord's title bar: the page's name, and the way out on its right. -->
					<header class="settings-page-header">
						<UButton
							color="neutral"
							variant="ghost"
							icon="ic:round-arrow-back"
							class="-ml-2 md:hidden"
							:aria-label="ts('profile.back')"
							@click="detailOpen = false"
						/>
						<h2
							:id="headingId"
							class="min-w-0 grow truncate text-[1.0625rem] font-semibold"
						>
							{{ current.label }}
						</h2>
						<button
							type="button"
							class="settings-close"
							:aria-label="ts('profile.close')"
							@click="isOpen = false"
						>
							<UIcon name="ic:round-close" class="size-6" aria-hidden="true" />
						</button>
					</header>

					<div class="settings-page-body">
						<div class="settings-page-column">
							<p
								v-if="current.description"
								class="mb-6 text-sm leading-[1.55] text-muted"
							>
								{{ current.description }}
							</p>
							<template v-if="section === 'account' && account">
								<div class="settings-card overflow-hidden p-0!">
									<div class="settings-banner" aria-hidden="true"></div>
									<div class="flex flex-wrap items-end gap-x-4 gap-y-2 px-5 pb-4">
										<AppUserAvatar
											:src="discordAvatar"
											:decoration
											class="-mt-9"
											avatar-class="size-20 ring-6 ring-(--console-surface,var(--ink-700))"
										/>
										<div class="min-w-0 grow pb-1">
											<p class="flex min-w-0 text-xl font-bold">
												<AppDisplayName
													:name="account.display"
													:styles="nameStyles"
												/>
											</p>
											<p
												v-if="account.username"
												class="truncate text-[0.8125rem] text-muted"
											>
												@{{ account.username }}
											</p>
											<USkeleton v-else class="mt-1 h-3.5 w-28 rounded" />
										</div>
										<UButton
											color="neutral"
											variant="outline"
											size="sm"
											to="https://discord.com/channels/@me"
											target="_blank"
											rel="noopener noreferrer"
											class="mb-1 rounded-[5px]"
										>
											{{ ts("profile.edit_on_discord") }}
										</UButton>
									</div>
									<dl class="settings-rows">
										<div v-for="row in accountRows" :key="row.label">
											<div class="min-w-0 grow">
												<dt>{{ row.label }}</dt>
												<dd v-if="row.value" class="truncate">
													{{ row.value }}
												</dd>
												<!-- The Discord account is still on its way: no stand-in value. -->
												<USkeleton v-else class="mt-1 h-4 w-40 rounded" />
											</div>
											<UButton
												v-if="row.copy !== undefined"
												:disabled="!row.copy"
												color="neutral"
												variant="ghost"
												size="sm"
												@click="row.copy && copy(row.copy)"
											>
												{{
													copied
														? ts("common.copied")
														: ts("profile.copy")
												}}
											</UButton>
											<span
												v-else
												class="flex items-center gap-1.5 text-xs text-muted"
											>
												<UIcon
													name="ic:round-lock"
													class="size-3.5"
													aria-hidden="true"
												/>
												{{ ts("profile.from_discord") }}
											</span>
										</div>
									</dl>
								</div>

								<!-- What WolfStar keeps about the user, the same in every server. -->
								<h3 class="settings-section-label">
									{{ ts("profile.your_settings") }}
								</h3>
								<p class="mb-3 text-[0.8125rem] text-muted">
									{{ ts("profile.your_settings_description") }}
								</p>
								<div class="settings-card flex items-center gap-4 px-5! py-4!">
									<div class="min-w-0 grow">
										<p :id="moderationDmsLabelId" class="text-sm font-semibold">
											{{ ts("profile.moderation_dms") }}
										</p>
										<p class="mt-0.5 text-xs leading-normal text-muted">
											{{ ts("profile.moderation_dms_description") }}
										</p>
									</div>
									<!-- A failed read says so and offers another try, instead of
								     leaving the skeleton up for good. -->
									<UButton
										v-if="!userSettings && userSettingsStatus === 'error'"
										color="neutral"
										variant="outline"
										size="sm"
										icon="ic:round-refresh"
										:aria-describedby="moderationDmsLabelId"
										@click="refreshUserSettings()"
									>
										{{ ts("common.retry") }}
									</UButton>
									<USkeleton
										v-else-if="!userSettings"
										class="h-6 w-11 shrink-0 rounded-full"
									/>
									<USwitch
										v-else
										:model-value="userSettings.report"
										:aria-label="ts('profile.moderation_dms')"
										@update:model-value="saveReport"
									/>
								</div>
							</template>

							<AppPreferences
								v-else-if="section === 'appearance'"
								only="appearance"
							/>
							<AppPreferences
								v-else-if="section === 'accessibility'"
								only="accessibility"
							/>
							<AppPreferences v-else-if="section === 'language'" only="language" />

							<div v-else-if="section === 'report'" class="settings-card">
								<FeedbackForm
									:id="feedbackFormId"
									v-model:submitting="isSendingFeedback"
								/>
								<div class="mt-5 flex justify-end">
									<UButton
										type="submit"
										:form="feedbackFormId"
										color="primary"
										:loading="isSendingFeedback"
										icon="i-lucide-send"
									>
										{{ ts("feedback.send") }}
									</UButton>
								</div>
							</div>

							<div
								v-else
								class="settings-card flex flex-col items-center gap-3 py-12 text-center"
							>
								<span
									class="flex size-12 items-center justify-center rounded-[8px] bg-base-content/8 text-muted"
									aria-hidden="true"
								>
									<UIcon :name="current.icon" class="size-6" />
								</span>
								<UBadge color="neutral" variant="subtle" class="font-semibold">
									{{ ts("dashboard.coming_soon.badge") }}
								</UBadge>
								<p class="max-w-md text-[0.8125rem] leading-normal text-muted">
									{{ ts("dashboard.coming_soon.body", { name: current.label }) }}
								</p>
							</div>
						</div>
					</div>
				</section>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { PreferencesSection as SettingsSection } from "~/composables/usePreferencesDialog";

const { ts } = useI18n();
const { isOpen: dialogOpen, requestedSection, variant } = usePreferencesDialog();
const { isSettingsOpen: cookieSettingsOpen } = useCookieConsent();

/** Hands over to the cookie dialog, which `ConsentManager` mounts next to this one. */
function openCookieSettings() {
	isOpen.value = false;
	cookieSettingsOpen.value = true;
}
// The compact dialog of the other pages shares the open state; this one only
// shows for its own variant.
const isOpen = computed({
	get: () => dialogOpen.value && variant.value === "console",
	set: (value: boolean) => {
		dialogOpen.value = value;
	},
});
const { user: authUser, signOut } = useUserSession();
const { user: discordUser, status: discordStatus, refresh: refreshDiscordUser } = useUser(authUser);
const {
	data: userSettings,
	status: userSettingsStatus,
	setReport,
	refresh: refreshUserSettings,
} = useUserSettings();
const toast = useToast();
const { copy, copied } = useClipboard();
const { avatar: discordAvatar, decoration, nameStyles } = useDiscordAccount();

const headingId = useId();
const feedbackFormId = useId();
const moderationDmsLabelId = useId();
const isSendingFeedback = ref(false);

/** The signed-in admin, as Discord describes them. A guest has no account page. */
const account = computed(() => {
	const session = authUser.value;
	if (!session) return null;
	const discord = discordUser.value;
	return {
		display: discord?.global_name ?? discord?.username ?? session.name,
		email: session.email,
		// Only Discord knows these; the session's name is the display name.
		id: discord?.id ?? "",
		username: discord?.username ?? "",
	};
});

/** `re•••••••@proton.me`: enough to recognise the address, not to read it. */
function maskEmail(email: string): string {
	const [local = "", domain = ""] = email.split("@");
	return `${local.slice(0, 2)}${"\u2022".repeat(Math.max(local.length - 2, 3))}@${domain}`;
}

const accountRows = computed(() => {
	const current = account.value;
	if (!current) return [];
	return [
		{ label: ts("profile.display_name"), value: current.display },
		{ label: ts("profile.username"), value: current.username },
		...(current.email ? [{ label: ts("profile.email"), value: maskEmail(current.email) }] : []),
		{ copy: current.id, label: ts("profile.discord_id"), value: current.id },
	] satisfies { label: string; value: string; copy?: string }[];
});

async function saveReport(report: boolean) {
	if (await setReport(report)) return;
	toast.add({ color: "error", title: ts("profile.moderation_dms_failed") });
}

const sections = computed(() => {
	const all: { id: SettingsSection; icon: string; label: string; description?: string }[] = [
		{
			description: ts("profile.my_account_description"),
			icon: "ic:round-person",
			id: "account",
			label: ts("profile.my_account"),
		},
		{ icon: "ic:round-palette", id: "appearance", label: ts("common.appearance") },
		{
			description: ts("profile.accessibility_description"),
			icon: "ic:round-accessibility-new",
			id: "accessibility",
			label: ts("profile.accessibility"),
		},
		{ icon: "ic:round-notifications", id: "notifications", label: ts("profile.notifications") },
		{ icon: "ic:round-language", id: "language", label: ts("common.language") },
		{ icon: "ic:round-link", id: "connections", label: ts("profile.connections") },
		{
			description: ts("feedback.description"),
			icon: "ic:round-bug-report",
			id: "report",
			label: ts("user_menu.report_bug"),
		},
	];
	// A guest only has what the browser stores (the look, motion and the
	// language) and can still report a bug.
	return account.value
		? all
		: all.filter((item) =>
				["appearance", "accessibility", "language", "report"].includes(item.id),
			);
});

// The pages, in the list; the bug report has a place of its own under them.
const searchQuery = ref("");
const matchesSearch = (label: string) =>
	label.toLocaleLowerCase().includes(searchQuery.value.trim().toLocaleLowerCase());
const pageSections = computed(() =>
	sections.value.filter((item) => item.id !== "report" && matchesSearch(item.label)),
);
// Discord's list: the account's pages, a rule, then the app's own. A search
// has one list, since a rule between two results says nothing.
const ACCOUNT_PAGES = new Set<SettingsSection>(["account", "notifications", "connections"]);
const pageGroups = computed(() => {
	const pages = pageSections.value;
	const groups: { label?: string; items: typeof pages }[] = searchQuery.value.trim()
		? [{ items: pages }]
		: [
				{ items: pages.filter((item) => ACCOUNT_PAGES.has(item.id)) },
				{
					items: pages.filter((item) => !ACCOUNT_PAGES.has(item.id)),
					label: ts("profile.group_experience"),
				},
			];
	return groups.filter((group) => group.items.length);
});
const reportSection = computed(() =>
	sections.value.find((item) => item.id === "report" && matchesSearch(item.label)),
);

const section = ref<SettingsSection>("appearance");
// On a phone the dialog is one column: the list first, then the page picked.
const detailOpen = ref(false);

const current = computed(
	() => sections.value.find((item) => item.id === section.value) ?? sections.value[0]!,
);

function openSection(id: SettingsSection) {
	section.value = id;
	detailOpen.value = true;
}

// Every opening starts from the first page the visitor has, on the list.
// The dialog is mounted on its first opening, already open, hence `immediate`.
watch(
	isOpen,
	(open) => {
		if (!open) return;
		searchQuery.value = "";
		// A page asked for opens straight away, past the list on a phone.
		const requested = requestedSection.value;
		requestedSection.value = null;
		const available = requested && sections.value.some((item) => item.id === requested);
		section.value = available ? requested : account.value ? "account" : "appearance";
		detailOpen.value = Boolean(available);
		if (!account.value) return;
		// The account page needs the Discord account; ask for it again if an
		// earlier request failed (the route is rate limited).
		if (!discordUser.value && discordStatus.value !== "pending") void refreshDiscordUser();
		void refreshUserSettings();
	},
	{ immediate: true },
);

async function logOut() {
	isOpen.value = false;
	// `auth.redirects.logout` in nuxt.config sends the user home afterwards.
	await signOut();
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.settings {
	@apply flex h-full min-h-0;
}

.settings-nav {
	@apply relative flex w-full shrink-0 flex-col overflow-auto px-4 pb-4 md:w-64 md:gap-0.5 md:px-3 md:pt-6 lg:w-79 lg:px-5;
	background-color: var(--ink-800);
}

.settings-mobile-header {
	@apply sticky top-0 z-10 -mx-4 mb-4 flex items-center gap-3 px-4 py-3;
	background-color: var(--ink-800);
}

.settings-mobile-close {
	@apply flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-muted;
}

.settings-mobile-close:hover {
	color: var(--ui-text-highlighted);
}

.settings-profile {
	@apply hidden items-center gap-3.5 px-2 pb-5 md:flex;
}

.settings-profile-edit {
	@apply mt-0.5 inline-flex items-center gap-1.5 rounded-[4px] text-sm text-muted;
}

.settings-profile-edit:hover {
	color: var(--ui-text-highlighted);
}

.settings-search {
	@apply mb-5 px-1 md:mb-3 md:px-0;
}

.settings-empty {
	@apply px-1 py-4 text-sm text-muted md:px-3;
}

.settings-nav-group {
	@apply flex shrink-0 flex-col overflow-hidden rounded-xl md:contents;
	background-color: var(--ink-700);
}

.settings-nav-divider {
	@apply h-5 shrink-0 md:mx-2 md:my-3 md:h-px;
}

.settings-page {
	@apply hidden min-w-0 flex-1 flex-col md:flex;
}

.settings-page-header {
	@apply flex h-15.5 shrink-0 items-center gap-3 px-5 md:px-6;
	border-bottom: 1px solid var(--home-border-subtle);
}

.settings-page-body {
	@apply min-h-0 flex-1 overflow-auto px-5 py-6 md:px-10 md:py-14;
}

/* Discord keeps a page to one centred column, however wide the dialog is. */
.settings-page-column {
	@apply mx-auto w-full max-w-217.5;
}

/* One column below `md`: the list, or the page that was picked from it. */
.settings--detail .settings-nav {
	@apply hidden md:flex;
}

.settings--detail .settings-page {
	@apply flex;
}

/* Discord's group names: small and quiet, in sentence case, over their group. */
.settings-group-label {
	@apply px-1 pb-2 text-sm font-medium text-muted md:px-3 md:pb-1.5 md:text-[0.8125rem];
}

.settings-nav-label {
	@apply px-1 pb-2 text-sm font-medium text-muted;
}

.settings-nav-item {
	@apply flex min-h-11 w-full shrink-0 cursor-pointer items-center gap-3 rounded-lg border-0 bg-transparent px-3 py-2 text-left text-base font-medium;
	color: var(--ui-text-toned);
}

.settings-nav-item:hover {
	background-color: oklch(100% 0 0 / 0.06);
}

/* Only the two-pane layout has a page open next to the list. */
@variant max-md {
	.settings-nav-item {
		@apply min-h-14 gap-4 rounded-none px-4;
		color: var(--ui-text-highlighted);
	}

	.settings-nav-item + .settings-nav-item {
		border-top: 1px solid var(--home-border-subtle);
	}
}

@variant md {
	.settings-mobile-header {
		display: none;
	}

	.settings-nav {
		background-color: var(--ink-700);
		border-right: 1px solid var(--home-border-subtle);
	}

	.settings-nav-divider {
		background-color: var(--home-border-subtle);
	}

	.settings-nav-item--current,
	.settings-nav-item--current:hover {
		background-color: oklch(100% 0 0 / 0.1);
		color: var(--ui-text-highlighted);
	}
}

.settings-nav-item:focus-visible,
.settings-close:focus-visible,
.settings-mobile-close:focus-visible,
.settings-profile-edit:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: -2px;
}

.settings-close {
	@apply -mr-1.5 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent p-0 text-muted;
}

.settings-close:hover {
	background-color: oklch(100% 0 0 / 0.06);
	color: var(--ui-text-highlighted);
}

/* Discord's section headings: large and in sentence case, on this dialog's
   own label and on the ones the preferences bring. */
.settings-section-label,
.settings-page-column :deep(.prefs-label) {
	@apply mb-3 text-2xl font-semibold tracking-normal normal-case;
	color: var(--ui-text-highlighted);
}

.settings-section-label {
	@apply mt-10 mb-1.5;
}

.settings-card {
	@apply rounded-[10px] p-5;
	background-color: var(--ink-700);
	border: 1px solid var(--home-border-subtle);
}

.settings-banner {
	@apply h-26;
	background-image: linear-gradient(100deg, var(--color-primary), var(--color-error));
}

.settings-rows {
	@apply mx-5 mb-5 rounded-[8px] px-4;
	background-color: var(--ink-800);
}

.settings-rows > div {
	@apply flex items-center gap-3 py-3;
}

.settings-rows > div + div {
	border-top: 1px solid var(--home-border-subtle);
}

.settings-rows dt {
	@apply text-[0.6875rem] font-bold tracking-[0.06em] text-muted uppercase;
}

.settings-rows dd {
	@apply text-sm;
}

@variant theme-light {
	.settings-nav,
	.settings-mobile-header {
		background-color: var(--color-base-200);
	}

	.settings-nav-group {
		background-color: var(--color-base-100);
	}

	.settings-card {
		background-color: var(--color-base-100);
	}

	.settings-rows {
		background-color: var(--color-base-200);
	}

	.settings-nav-item:hover,
	.settings-close:hover {
		background-color: oklch(0% 0 0 / 0.05);
	}

	@variant md {
		.settings-nav-item--current,
		.settings-nav-item--current:hover {
			background-color: oklch(0% 0 0 / 0.07);
		}
	}
}
</style>
