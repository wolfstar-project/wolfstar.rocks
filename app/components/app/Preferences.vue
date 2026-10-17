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

			<template v-if="!quick">
				<div class="my-7 h-px bg-(--home-border-subtle)"></div>

				<h3 :id="densityLabelId" class="prefs-label">
					{{ ts("profile.message_display") }}
				</h3>
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
								<span class="mt-0.5 block text-xs text-muted">{{
									option.hint
								}}</span>
							</span>
						</label>
					</div>
				</ClientOnly>
			</template>
		</div>

		<!-- Language: which one, then the clock times are read on. -->
		<div v-if="shows('language')" class="flex max-w-140 flex-col gap-7">
			<section>
				<h3 :id="languageLabelId" class="prefs-heading">
					{{ ts("profile.select_language") }}
				</h3>
				<p :id="languageHelpId" class="prefs-description">
					{{ ts("profile.select_language_description") }}
				</p>
				<ClientOnly>
					<SelectBase
						v-model="currentLocale"
						:options="languageOptions"
						:clearable="false"
						variant="field"
						class="w-full"
						:aria-label="ts('profile.select_language')"
						:aria-describedby="languageHelpId"
					/>
					<template #fallback>
						<USkeleton class="h-12 w-full rounded-[6px]" />
					</template>
				</ClientOnly>
			</section>

			<section v-if="!quick">
				<h3 :id="timeFormatLabelId" class="prefs-heading">
					{{ ts("profile.time_format") }}
				</h3>
				<p class="prefs-description">{{ ts("profile.time_format_description") }}</p>
				<ClientOnly>
					<div
						role="radiogroup"
						:aria-labelledby="timeFormatLabelId"
						class="flex flex-col gap-0.5"
					>
						<label
							v-for="option in timeFormatOptions"
							:key="option.id"
							class="time-format"
							:class="{ 'time-format--on': timeFormat === option.id }"
						>
							<input
								v-model="timeFormat"
								type="radio"
								:name="timeFormatLabelId"
								:value="option.id"
								class="sr-only"
							/>
							<span class="time-format-radio" aria-hidden="true"></span>
							<span>{{ option.label }}</span>
							<span class="font-mono text-xs text-muted">{{ option.sample }}</span>
						</label>
					</div>
					<template #fallback>
						<div class="flex flex-col gap-0.5">
							<USkeleton
								v-for="option in timeFormatOptions"
								:key="option.id"
								class="my-2 h-7 w-48"
							/>
						</div>
					</template>
				</ClientOnly>
			</section>
		</div>

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
import type { SelectOption } from "~/components/select/Base.vue";
import type { ColorModePreference, LogDensity, TimeFormat } from "~/composables/useSettings";

type PreferenceGroup = "appearance" | "accessibility" | "language";

/**
 * The browser-local preferences every visitor has, signed in or not: theme,
 * log density, reduced motion and language. They are stored through
 * `useSettings()`, so this component only renders the controls.
 */
const { only, quick = false } = defineProps<{
	/**
	 * Shows one group instead of all of them, for the settings dialog, which
	 * gives each its own page.
	 */
	only?: PreferenceGroup;
	/**
	 * The compact set of the pages around the dashboard: the three base themes,
	 * the language, and reduced motion. Row density and the clock belong to the
	 * dashboard's logs, so they stay out.
	 */
	quick?: boolean;
}>();

function shows(group: PreferenceGroup) {
	return only === undefined || only === group;
}

const { ts } = useI18n();
const { locale, locales, localeLabel, selectLocale } = useAppLocale();
const { reduceMotionEnabled, effectiveReduceMotion, setReduceMotion, systemPreferenceActive } =
	useReduceMotion();

const { preference, setColorMode } = useAppColorMode();
const logDensity = useLogDensity();

const themeLabelId = useId();
const densityLabelId = useId();
const languageLabelId = useId();
const languageHelpId = useId();
const timeFormatLabelId = useId();

// The design's three choices, then the experimental midnight theme the app also
// has. The compact set lists midnight only while it is the one in use, so the
// current choice never goes missing from the picker.
const themeCards = computed<{ id: ColorModePreference; label: string }[]>(() => {
	const base: { id: ColorModePreference; label: string }[] = [
		{ id: "dark", label: ts("common.dark") },
		{ id: "light", label: ts("common.light") },
		{ id: "system", label: ts("profile.theme_sync_system") },
	];
	if (quick && preference.value !== "midnight") return base;
	return [...base, { id: "midnight", label: ts("common.midnight_experimental") }];
});
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

// Each language by its own name, with its name in the language on screen at
// the far end, as Discord lists them.
const languageOptions = computed<SelectOption[]>(() => {
	const names = new Intl.DisplayNames([locale.value], { type: "language" });
	return locales.value.map((entry) => {
		const language = names.of(entry.code.split("-")[0] ?? entry.code) ?? entry.code;
		return {
			aside: `${language.charAt(0).toLocaleUpperCase(locale.value)}${language.slice(1)}`,
			flag: localeFlagSrc(entry.code),
			label: localeLabel(entry),
			value: entry.code,
		};
	});
});
const currentLocale = computed<string | string[] | null>({
	get: () => locale.value,
	set: (code) => {
		if (typeof code === "string") void selectLocale(code);
	},
});

const timeFormat = useTimeFormat();
// 14:05 on each clock, in the language on screen.
const timeFormatOptions = computed<{ id: TimeFormat; label: string; sample: string }[]>(() => {
	const sample = new Date(2026, 0, 1, 14, 5);
	const format = (id: TimeFormat) =>
		sample.toLocaleTimeString(withHourCycle(locale.value, id), {
			hour: "numeric",
			minute: "2-digit",
		});
	return [
		{
			id: "auto",
			label: ts("profile.time_format_auto"),
			sample: ts("profile.time_format_auto_hint"),
		},
		{ id: "12h", label: ts("profile.time_format_12h"), sample: format("12h") },
		{ id: "24h", label: ts("profile.time_format_24h"), sample: format("24h") },
	];
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

.prefs-heading {
	@apply text-base font-bold text-highlighted;
}

.prefs-description {
	@apply mt-1 mb-3 text-sm leading-normal text-muted;
}

/* A row of the time format's radio group: a 24px ring, filled when picked. */
.time-format {
	@apply flex min-h-11 cursor-pointer items-center gap-3.5 rounded-[6px] px-1 text-base text-highlighted;
}

.time-format:has(input:focus-visible) {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.time-format-radio {
	@apply flex size-6 shrink-0 items-center justify-center rounded-full border-2;
	border-color: var(--field-border);
}

.time-format--on .time-format-radio {
	@apply border-primary bg-primary;
}

.time-format--on .time-format-radio::after {
	@apply size-2 rounded-full bg-primary-content;
	content: "";
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
