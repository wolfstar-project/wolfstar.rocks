<template>
	<div class="space-y-6">
		<!-- Appearance: the theme, then how dense the log tables are. -->
		<div v-if="shows('appearance')">
			<!-- Discord's theme picker: its base themes, then the colour themes
			     painted behind the dashboard, all one choice. -->
			<h3 class="prefs-label">{{ ts("profile.theme") }}</h3>
			<ClientOnly>
				<div class="flex flex-col gap-5">
					<div>
						<p :id="baseThemesLabelId" class="prefs-sublabel">
							{{ ts("profile.themes.default") }}
						</p>
						<div
							role="radiogroup"
							:aria-labelledby="baseThemesLabelId"
							class="theme-swatches"
						>
							<label
								v-for="theme in baseThemes"
								:key="theme.id"
								class="theme-swatch"
								:class="[
									`theme-swatch--${theme.id}`,
									{ 'theme-swatch--on': baseTheme === theme.id },
								]"
								:title="theme.label"
							>
								<input
									type="radio"
									:name="themeGroupName"
									:value="theme.id"
									:checked="baseTheme === theme.id"
									:aria-label="theme.label"
									class="sr-only"
									@change="selectBase(theme.id)"
								/>
								<UIcon
									v-if="theme.id === 'system'"
									name="ic:round-sync"
									class="size-6"
									aria-hidden="true"
								/>
								<span
									v-if="baseTheme === theme.id"
									class="theme-swatch-check"
									aria-hidden="true"
								>
									<UIcon name="ic:round-check" class="size-3" />
								</span>
							</label>
						</div>
					</div>

					<div v-if="!quick">
						<p :id="colorThemesLabelId" class="prefs-sublabel">
							{{ ts("profile.themes.color") }}
						</p>
						<div class="theme-swatches">
							<!-- Not a radio: arrow keys pick the radio they reach, and this leaves the settings. -->
							<button
								type="button"
								class="theme-swatch"
								:class="{ 'theme-swatch--on': colorTheme === 'custom' }"
								:style="{ backgroundImage: customThemeSwatch }"
								:title="ts('profile.themes.custom')"
								:aria-label="ts('profile.themes.custom')"
								:aria-current="colorTheme === 'custom' ? 'true' : undefined"
								aria-haspopup="dialog"
								@click="openCustomTheme"
							>
								<UIcon
									name="ic:round-palette"
									class="size-6 text-white"
									aria-hidden="true"
								/>
								<span
									v-if="colorTheme === 'custom'"
									class="theme-swatch-check"
									aria-hidden="true"
								>
									<UIcon name="ic:round-check" class="size-3" />
								</span>
							</button>
							<div
								role="radiogroup"
								:aria-labelledby="colorThemesLabelId"
								class="contents"
							>
								<label
									v-for="theme in colorThemes"
									:key="theme.id"
									class="theme-swatch"
									:class="{ 'theme-swatch--on': colorTheme === theme.id }"
									:style="{ backgroundImage: theme.swatch }"
									:title="theme.label"
								>
									<input
										type="radio"
										:name="themeGroupName"
										:value="theme.id"
										:checked="colorTheme === theme.id"
										:aria-label="theme.label"
										class="sr-only"
										@change="selectColorTheme(theme.id)"
									/>
									<span
										v-if="colorTheme === theme.id"
										class="theme-swatch-check"
										aria-hidden="true"
									>
										<UIcon name="ic:round-check" class="size-3" />
									</span>
								</label>
							</div>
						</div>
						<p class="mt-2 text-xs text-muted">
							{{ ts("profile.themes.color_hint") }}
						</p>
					</div>
				</div>
				<template #fallback>
					<div class="flex flex-wrap gap-2">
						<USkeleton v-for="n in 12" :key="n" class="size-12 rounded-[8px]" />
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
import type { BaseThemeChoice, LogDensity, TimeFormat } from "~/composables/useSettings";
import { COLOR_THEMES, colorThemeSwatch, customColorTheme } from "~/utils/color-themes";

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
	 * The compact set of the pages around the dashboard: the base themes, the
	 * language, and reduced motion. Row density and the clock belong to the
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

const { baseTheme, colorTheme, customTheme, selectBase, selectColorTheme } = useThemeChoice();
// The custom theme is built in a panel beside the page, as Discord's is.
const { open: openCustomTheme } = useCustomThemePanel();
const logDensity = useLogDensity();

const themeGroupName = useId();
const baseThemesLabelId = useId();
const colorThemesLabelId = useId();
const densityLabelId = useId();
const languageLabelId = useId();
const languageHelpId = useId();
const timeFormatLabelId = useId();

// Discord's four themes and following the device, in its order.
const baseThemes = computed<{ id: BaseThemeChoice; label: string }[]>(() => [
	{ id: "light", label: ts("profile.themes.light") },
	{ id: "ash", label: ts("profile.themes.ash") },
	{ id: "dark", label: ts("profile.themes.dark") },
	{ id: "onyx", label: ts("profile.themes.onyx") },
	{ id: "system", label: ts("profile.theme_sync_system") },
]);

// The custom theme first, as its own gradient, then Discord's presets.
const COLOR_THEME_LABEL_KEYS: Record<string, string> = {
	"aurora": "profile.themes.presets.aurora",
	"blurple-twilight": "profile.themes.presets.blurple_twilight",
	"candyfloss": "profile.themes.presets.candyfloss",
	"chroma-glow": "profile.themes.presets.chroma_glow",
	"citrus-sherbert": "profile.themes.presets.citrus_sherbert",
	"crimson-moon": "profile.themes.presets.crimson_moon",
	"desert-khaki": "profile.themes.presets.desert_khaki",
	"dusk": "profile.themes.presets.dusk",
	"forest": "profile.themes.presets.forest",
	"hanami": "profile.themes.presets.hanami",
	"lofi-vibes": "profile.themes.presets.lofi_vibes",
	"mars": "profile.themes.presets.mars",
	"memory-lane": "profile.themes.presets.memory_lane",
	"midnight-blurple": "profile.themes.presets.midnight_blurple",
	"mint-apple": "profile.themes.presets.mint_apple",
	"neon-nights": "profile.themes.presets.neon_nights",
	"retro-raincloud": "profile.themes.presets.retro_raincloud",
	"retro-storm": "profile.themes.presets.retro_storm",
	"sepia": "profile.themes.presets.sepia",
	"strawberry-lemonade": "profile.themes.presets.strawberry_lemonade",
	"sunrise": "profile.themes.presets.sunrise",
	"sunset": "profile.themes.presets.sunset",
	"under-the-sea": "profile.themes.presets.under_the_sea",
};
const customThemeSwatch = computed(() => colorThemeSwatch(customColorTheme(customTheme.value)));
const colorThemes = computed(() =>
	COLOR_THEMES.map((theme) => ({
		id: theme.id,
		label: ts(COLOR_THEME_LABEL_KEYS[theme.id] ?? "profile.themes.custom"),
		swatch: colorThemeSwatch(theme),
	})),
);

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

.prefs-option--on .prefs-dot {
	border-color: var(--color-primary);
}

.prefs-option--on .prefs-dot::after {
	@apply size-1.75 rounded-full bg-primary;
	content: "";
}

/* Discord's theme swatches: 48px tiles, the picked one ringed in blurple with
   a check on its corner. */
.prefs-sublabel {
	@apply mb-2 text-sm font-semibold text-highlighted;
}

.theme-swatches {
	@apply flex flex-wrap gap-2;
}

.theme-swatch {
	@apply relative flex size-12 cursor-pointer items-center justify-center rounded-[8px] bg-cover;
	box-shadow: inset 0 0 0 1px var(--field-border);
}

.theme-swatch--on {
	box-shadow:
		inset 0 0 0 2px var(--color-primary),
		inset 0 0 0 4px var(--console-surface, var(--color-base-100));
}

.theme-swatch:focus-visible,
.theme-swatch:has(input:focus-visible),
.prefs-option:has(input:focus-visible) {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.theme-swatch-check {
	@apply absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-content;
}

/* Discord's own base colours: Light, Ash, Dark, Onyx, and the device's. */
.theme-swatch--light {
	--swatch: #ffffff;
	background-color: var(--swatch);
	color: var(--ink-600);
}

.theme-swatch--ash {
	--swatch: #323339;
	background-color: var(--swatch);
}

.theme-swatch--dark {
	--swatch: #1d1d21;
	background-color: var(--swatch);
}

.theme-swatch--onyx {
	--swatch: #000000;
	background-color: var(--swatch);
}

/* Half light, half Ash: it follows the device. */
.theme-swatch--system {
	--swatch-light: #ffffff;
	--swatch-dark: #323339;
	--swatch-icon: #949ba4;
	background-image: linear-gradient(135deg, var(--swatch-light) 50%, var(--swatch-dark) 50%);
	color: var(--swatch-icon);
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
