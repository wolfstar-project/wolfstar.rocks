<template>
	<UModal
		v-model:open="isOpen"
		:title="ts('profile.settings_title')"
		:description="ts('profile.settings_tagline')"
		:ui="{
			content:
				'h-dvh max-h-dvh w-full max-w-none rounded-none bg-(--ink-600) theme-light:bg-base-100 md:h-190 md:max-h-[96dvh] md:w-280 md:max-w-[98vw] md:rounded-[12px]',
		}"
	>
		<template #content>
			<div class="settings" :class="{ 'settings--detail': detailOpen }">
				<nav class="settings-nav" :aria-label="ts('profile.sections_aria')">
					<div v-if="account" class="flex items-center gap-2.5 px-2 pt-1.5 pb-3">
						<UAvatar :src="account.avatar" alt="" size="md" icon="ic:round-person" />
						<div class="min-w-0">
							<p class="truncate text-[0.8125rem] font-bold">{{ account.display }}</p>
							<p class="truncate text-[0.6875rem] text-muted">
								@{{ account.username }}
							</p>
						</div>
					</div>
					<p class="settings-nav-label" aria-hidden="true">
						{{ ts("profile.settings_title") }}
					</p>
					<button
						v-for="item in pageSections"
						:key="item.id"
						type="button"
						class="settings-nav-item"
						:class="{ 'settings-nav-item--current': item.id === section }"
						:aria-current="item.id === section ? 'page' : undefined"
						@click="openSection(item.id)"
					>
						<UIcon :name="item.icon" class="size-4.25 shrink-0" aria-hidden="true" />
						<span class="grow">{{ item.label }}</span>
						<UIcon
							name="ic:round-chevron-right"
							class="size-4.5 text-muted md:hidden"
							aria-hidden="true"
						/>
					</button>
					<div class="mx-2 my-2.5 h-px bg-(--home-border-subtle)"></div>
					<!-- Reporting a bug and leaving sit together, apart from the pages. -->
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
							class="size-4.25 shrink-0"
							aria-hidden="true"
						/>
						<span class="grow">{{ reportSection.label }}</span>
						<UIcon
							name="ic:round-chevron-right"
							class="size-4.5 text-muted md:hidden"
							aria-hidden="true"
						/>
					</button>
					<template v-if="account">
						<button type="button" class="settings-nav-item text-error!" @click="logOut">
							<UIcon
								name="ic:round-logout"
								class="size-4.25 shrink-0"
								aria-hidden="true"
							/>
							<span class="grow">{{ ts("user_menu.sign_out") }}</span>
						</button>
					</template>
					<UButton
						color="neutral"
						variant="ghost"
						icon="ic:round-close"
						class="absolute top-3 right-3 md:hidden"
						:aria-label="ts('profile.close')"
						@click="isOpen = false"
					/>
				</nav>

				<section class="settings-page" :aria-labelledby="headingId">
					<div class="flex items-start gap-3">
						<UButton
							color="neutral"
							variant="ghost"
							icon="ic:round-arrow-back"
							class="-ml-2 md:hidden"
							:aria-label="ts('profile.back')"
							@click="detailOpen = false"
						/>
						<div class="min-w-0 grow">
							<h2 :id="headingId" class="text-xl font-bold">{{ current.label }}</h2>
							<p
								v-if="current.description"
								class="mt-1.5 max-w-140 text-[0.8125rem] leading-[1.55] text-muted"
							>
								{{ current.description }}
							</p>
						</div>
						<button
							type="button"
							class="settings-close"
							:aria-label="ts('profile.close')"
							@click="isOpen = false"
						>
							<span
								><UIcon name="ic:round-close" class="size-4.5" aria-hidden="true"
							/></span>
							<span
								class="text-[0.625rem] font-bold tracking-[0.06em]"
								aria-hidden="true"
							>
								ESC
							</span>
						</button>
					</div>

					<div class="mt-6">
						<template v-if="section === 'account' && account">
							<div class="settings-card overflow-hidden p-0!">
								<div class="settings-banner" aria-hidden="true"></div>
								<div class="flex flex-wrap items-end gap-x-4 gap-y-2 px-5 pb-4">
									<UAvatar
										:src="account.avatar"
										alt=""
										icon="ic:round-person"
										class="-mt-9 size-20 ring-6 ring-(--console-surface,var(--ink-700))"
									/>
									<div class="min-w-0 grow pb-1">
										<p class="truncate text-xl font-bold">
											{{ account.display }}
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
											{{ copied ? ts("common.copied") : ts("profile.copy") }}
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
									<p class="text-sm font-semibold">
										{{ ts("profile.moderation_dms") }}
									</p>
									<p class="mt-0.5 text-xs leading-normal text-muted">
										{{ ts("profile.moderation_dms_description") }}
									</p>
								</div>
								<USkeleton
									v-if="!userSettings"
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

						<AppPreferences v-else-if="section === 'appearance'" only="appearance" />
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
				</section>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { PreferencesSection as SettingsSection } from "~/composables/usePreferencesDialog";

const { ts } = useI18n();
const { isOpen, requestedSection } = usePreferencesDialog();
const { user: authUser, signOut } = useUserSession();
const { user: discordUser, status: discordStatus, refresh: refreshDiscordUser } = useUser(authUser);
const { data: userSettings, setReport, refresh: refreshUserSettings } = useUserSettings();
const toast = useToast();
const { copy, copied } = useClipboard();

const headingId = useId();
const feedbackFormId = useId();
const isSendingFeedback = ref(false);

/** The signed-in admin, as Discord describes them. A guest has no account page. */
const account = computed(() => {
	const session = authUser.value;
	if (!session) return null;
	const discord = discordUser.value;
	return {
		avatar: session.image ?? undefined,
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
const pageSections = computed(() => sections.value.filter((item) => item.id !== "report"));
const reportSection = computed(() => sections.value.find((item) => item.id === "report"));

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
	@apply relative flex w-full shrink-0 flex-col gap-0.5 overflow-auto pt-5 pr-2.5 pb-4 pl-4 md:w-60;
	background-color: var(--ink-800);
}

.settings-page {
	@apply hidden min-w-0 flex-1 overflow-auto p-5 md:block md:px-10 md:py-8;
}

/* One column below `md`: the list, or the page that was picked from it. */
.settings--detail .settings-nav {
	@apply hidden md:flex;
}

.settings--detail .settings-page {
	@apply block;
}

.settings-nav-label {
	@apply px-2 pt-1 pb-1.5 text-[0.6875rem] font-bold tracking-[0.04em] text-muted uppercase;
}

.settings-nav-item {
	@apply flex min-h-10 w-full cursor-pointer items-center gap-2.5 rounded-[5px] border-0 bg-transparent px-2.5 py-2 text-left text-sm font-medium;
	color: var(--ui-text-toned);
}

.settings-nav-item:hover {
	background-color: oklch(100% 0 0 / 0.06);
}

/* Only the two-pane layout has a page open next to the list. */
@variant md {
	.settings-nav-item--current,
	.settings-nav-item--current:hover {
		background-color: oklch(100% 0 0 / 0.08);
		color: var(--ui-text-highlighted);
	}
}

.settings-nav-item:focus-visible,
.settings-close:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: -2px;
}

.settings-close {
	@apply hidden shrink-0 cursor-pointer flex-col items-center gap-1 border-0 bg-transparent p-0 text-muted md:flex;
}

.settings-close > span:first-child {
	@apply flex size-9.5 items-center justify-center rounded-full;
	border: 2px solid currentcolor;
}

.settings-close:hover {
	color: var(--ui-text-highlighted);
}

.settings-section-label {
	@apply mt-8 mb-1.5 text-[0.6875rem] font-bold tracking-[0.04em] uppercase;
	color: var(--ui-text-muted);
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
	.settings-nav {
		background-color: var(--color-base-200);
	}

	.settings-card {
		background-color: var(--color-base-100);
	}

	.settings-rows {
		background-color: var(--color-base-200);
	}

	.settings-nav-item:hover {
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
