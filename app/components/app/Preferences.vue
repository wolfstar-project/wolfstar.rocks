<template>
	<div class="space-y-6">
		<!-- Appearance: the theme, then how dense the log tables are. -->
		<div v-if="shows('appearance')">
			<h3 :id="themeLabelId" class="prefs-label">{{ ts("profile.theme") }}</h3>
			<ClientOnly>
				<div role="radiogroup" :aria-labelledby="themeLabelId" class="flex flex-wrap gap-3">
					<label
						v-for="card in themeCards"
						:key="card.id"
						class="theme-card"
						:class="{ 'theme-card--on': themeChoice === card.id }"
					>
						<input
							v-model="themeChoice"
							type="radio"
							:name="themeLabelId"
							:value="card.id"
							class="sr-only"
						/>
						<span
							class="theme-card-preview"
							:class="`theme-card-preview--${card.id}`"
							aria-hidden="true"
						>
							<span class="theme-card-rail"></span>
							<span class="theme-card-side"></span>
							<span class="theme-card-body">
								<span class="theme-card-line w-[70%]"></span>
								<span class="theme-card-line w-[90%]"></span>
								<span
									class="theme-card-line theme-card-line--accent w-[55%]"
								></span>
							</span>
						</span>
						<span class="theme-card-label">
							<span class="prefs-dot" aria-hidden="true"></span>
							{{ card.label }}
						</span>
					</label>
				</div>
				<template #fallback>
					<div class="flex flex-wrap gap-3">
						<USkeleton
							v-for="card in themeCards"
							:key="card.id"
							class="h-36.5 w-47.5 rounded-[10px]"
						/>
					</div>
				</template>
			</ClientOnly>

			<div class="my-7 h-px bg-(--home-border-subtle)"></div>

			<h3 :id="densityLabelId" class="prefs-label">{{ ts("profile.message_display") }}</h3>
			<ClientOnly>
				<div
					role="radiogroup"
					:aria-labelledby="densityLabelId"
					class="flex max-w-130 flex-col gap-2.5"
				>
					<label
						v-for="option in densityOptions"
						:key="option.id"
						class="prefs-option"
						:class="{ 'prefs-option--on': logDensity === option.id }"
					>
						<input
							v-model="logDensity"
							type="radio"
							:name="densityLabelId"
							:value="option.id"
							class="sr-only"
						/>
						<span class="prefs-dot" aria-hidden="true"></span>
						<span class="grow">
							<span class="block text-sm font-semibold text-highlighted">{{
								option.label
							}}</span>
							<span class="mt-0.5 block text-xs text-muted">{{ option.hint }}</span>
						</span>
					</label>
				</div>
			</ClientOnly>
		</div>

		<!-- Language -->
		<UCard v-if="shows('language')" class="border border-base-200/60 bg-base-100 shadow-sm">
			<template #header>
				<div class="flex items-center gap-3">
					<div class="flex size-7 items-center justify-center rounded-full bg-primary/10">
						<UIcon name="lucide:languages" class="size-4 text-primary" />
					</div>
					<div>
						<h3 class="text-lg font-semibold text-base-content">
							{{ ts("common.language") }}
						</h3>
						<p class="text-sm text-base-content/60">
							{{ ts("profile.language_description") }}
						</p>
					</div>
				</div>
			</template>

			<div
				class="flex flex-col gap-3 rounded-lg border border-base-300 bg-base-200/50 p-4 sm:flex-row sm:items-center sm:justify-between"
			>
				<div>
					<h4 class="font-medium text-base-content">
						{{ ts("common.language") }}
					</h4>
					<p class="mt-1 text-sm text-base-content/60">
						{{ ts("profile.language_help") }}
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

		<!-- Accessibility: motion, with what the system already asks for. -->
		<div v-if="shows('accessibility')" class="flex max-w-155 flex-col gap-4">
			<div class="prefs-rows">
				<div class="prefs-row">
					<div class="min-w-0 grow">
						<p class="text-sm font-semibold text-highlighted">
							{{ ts("profile.reduce_motion") }}
						</p>
						<p class="mt-0.5 text-xs leading-normal text-muted">
							{{ ts("profile.reduce_motion_description") }}
						</p>
					</div>
					<USwitch
						v-model="reduceMotionEnabled"
						:aria-label="ts('profile.reduce_motion')"
						:disabled="systemPreferenceActive"
						@update:model-value="handleSetReduceMotion"
					/>
				</div>
			</div>

			<div v-if="systemPreferenceActive" class="prefs-note" role="status">
				<UIcon
					name="ic:round-info"
					class="mt-0.5 size-4.5 shrink-0 text-info"
					aria-hidden="true"
				/>
				<div class="text-[0.8125rem] leading-normal">
					<p class="font-semibold text-highlighted">
						{{ ts("profile.system_preference_detected") }}
					</p>
					<p class="mt-0.5 text-toned">
						{{ ts("profile.system_preference_description") }}
					</p>
				</div>
			</div>

			<p class="flex items-center gap-2 text-[0.8125rem] text-muted">
				{{ ts("profile.current_status") }}
				<UBadge :color="effectiveReduceMotion ? 'primary' : 'neutral'" variant="subtle">
					{{
						effectiveReduceMotion
							? ts("profile.motion_reduced")
							: ts("profile.motion_enabled")
					}}
				</UBadge>
			</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ColorModePreference, LogDensity } from "~/composables/useSettings";
import { getNuxtUiLocales } from "~/utils/nuxt-ui-locales";

type PreferenceGroup = "appearance" | "accessibility" | "language";

/**
 * The browser-local preferences every visitor has, signed in or not: theme,
 * log density, reduced motion and language. They are stored through
 * `useSettings()`, so this component only renders the controls.
 */
const { only } = defineProps<{
	/**
	 * Shows one group instead of all of them, for the settings dialog, which
	 * gives each its own page.
	 */
	only?: PreferenceGroup;
}>();

function shows(group: PreferenceGroup) {
	return only === undefined || only === group;
}

const { ts } = useI18n();
const { locale, selectLocale } = useAppLocale();
const { reduceMotionEnabled, effectiveReduceMotion, setReduceMotion, systemPreferenceActive } =
	useReduceMotion();

const { preference, setColorMode } = useAppColorMode();
const logDensity = useLogDensity();

const themeLabelId = useId();
const densityLabelId = useId();

// The design's three choices, then the experimental midnight theme the app also has.
const themeCards = computed<{ id: ColorModePreference; label: string }[]>(() => [
	{ id: "dark", label: ts("common.dark") },
	{ id: "light", label: ts("common.light") },
	{ id: "system", label: ts("profile.theme_sync_system") },
	{ id: "midnight", label: ts("common.midnight_experimental") },
]);
const themeChoice = computed({
	get: () => preference.value,
	set: (value: ColorModePreference) => setColorMode(value),
});

const densityOptions = computed<{ id: LogDensity; label: string; hint: string }[]>(() => [
	{ hint: ts("profile.density_cozy_hint"), id: "cozy", label: ts("profile.density_cozy") },
	{
		hint: ts("profile.density_compact_hint"),
		id: "compact",
		label: ts("profile.density_compact"),
	},
]);

const uiLocales = getNuxtUiLocales();
const currentLocale = computed({
	get: () => locale.value,
	set: (code: string) => {
		void selectLocale(code);
	},
});

function handleSetReduceMotion(value: boolean) {
	setReduceMotion(value);
	// Imported on use, so rendering the preferences never pulls the SDK in at
	// module load (the component test runner cannot import it).
	void import("@sentry/nuxt").then((Sentry) =>
		Sentry.metrics.count("preferences.reduce_motion", 1, {
			attributes: { enabled: String(value) },
		}),
	);
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.prefs-label {
	@apply mb-2.5 text-[0.6875rem] font-bold tracking-[0.04em] uppercase;
	color: var(--ui-text-muted);
}

/* The radio of a card or an option, drawn: a ring, filled in when picked. */
.prefs-dot {
	@apply flex size-4 shrink-0 items-center justify-center rounded-full border-2;
	border-color: var(--field-border);
}

.theme-card--on .prefs-dot,
.prefs-option--on .prefs-dot {
	border-color: var(--color-primary);
}

.theme-card--on .prefs-dot::after,
.prefs-option--on .prefs-dot::after {
	@apply size-1.75 rounded-full bg-primary;
	content: "";
}

.theme-card {
	@apply w-47.5 cursor-pointer overflow-hidden rounded-[10px] border-2 text-left;
	border-color: var(--field-border);
	background-color: var(--ink-700);
}

.theme-card--on {
	border-color: var(--color-primary);
}

.theme-card:has(input:focus-visible),
.prefs-option:has(input:focus-visible) {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.theme-card-preview {
	@apply flex h-23;
	background: var(--preview-app);
}

.theme-card-rail {
	@apply w-5;
	background: var(--preview-rail);
}

.theme-card-side {
	@apply w-11;
	background: var(--preview-side);
}

.theme-card-body {
	@apply flex grow flex-col gap-1.5 px-2 py-2.5;
}

.theme-card-line {
	@apply h-2 rounded-[3px];
	background-color: var(--preview-line);
}

.theme-card-line--accent {
	@apply bg-primary;
}

.theme-card-preview--dark {
	--preview-app: var(--ink-600);
	--preview-rail: var(--ink-800);
	--preview-side: var(--ink-700);
	--preview-line: var(--ink-300);
}

.theme-card-preview--light {
	--preview-app: var(--theme-preview-light-app);
	--preview-rail: var(--theme-preview-light-rail);
	--preview-side: var(--theme-preview-light-side);
	--preview-line: var(--theme-preview-light-line);
}

/* Half dark, half light, split on the same slant as the design. */
.theme-card-preview--system {
	--preview-app: linear-gradient(115deg, var(--ink-600) 52%, var(--theme-preview-light-app) 52%);
	--preview-rail: var(--ink-800);
	--preview-side: linear-gradient(
		115deg,
		var(--ink-700) 60%,
		var(--theme-preview-light-side) 60%
	);
	--preview-line: var(--theme-preview-system-line);
}

.theme-card-preview--midnight {
	--preview-app: var(--theme-preview-midnight-app);
	--preview-rail: var(--theme-preview-midnight-rail);
	--preview-side: var(--theme-preview-midnight-side);
	--preview-line: var(--theme-preview-midnight-line);
}

.theme-card-label {
	@apply flex items-center gap-2 px-3 py-2.5 text-sm font-semibold;
	color: var(--ui-text-highlighted);
	border-top: 1px solid var(--home-border-subtle);
}

.prefs-option {
	@apply flex cursor-pointer items-center gap-3 rounded-[8px] border px-3.5 py-3;
	border-color: var(--field-border);
}

.prefs-option--on {
	border-color: var(--color-primary);
	background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
}

/* Switch rows on one card, as the design's notification settings. */
.prefs-rows {
	@apply rounded-[10px] px-4.5 py-1;
	background-color: var(--ink-700);
	border: 1px solid var(--home-border-subtle);
}

.prefs-row {
	@apply flex items-center gap-4 py-4;
}

.prefs-row + .prefs-row {
	border-top: 1px solid var(--home-border-subtle);
}

/* The dialog is portaled out of the dashboard; its cards follow its own colours. */
@variant theme-light {
	.theme-card,
	.prefs-rows {
		background-color: var(--color-base-100);
	}
}

.prefs-note {
	@apply flex items-start gap-3 rounded-[8px] px-4 py-3.5;
	background-color: color-mix(in oklab, var(--color-info) 12%, transparent);
	border: 1px solid color-mix(in oklab, var(--color-info) 35%, transparent);
}
</style>
