<template>
	<div class="space-y-6">
		<!-- Appearance -->
		<UCard v-if="shows('appearance')" class="border border-base-200/60 bg-base-100 shadow-sm">
			<template #header>
				<div class="flex items-center gap-3">
					<div class="flex size-7 items-center justify-center rounded-full bg-primary/10">
						<UIcon name="lucide:sun-moon" class="size-4 text-primary" />
					</div>
					<div>
						<h3 class="text-lg font-semibold text-base-content">
							{{ ts("common.appearance") }}
						</h3>
						<p class="text-sm text-base-content/60">
							{{ ts("profile.appearance_description") }}
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
							{{ ts("profile.theme") }}
						</h4>
						<p class="mt-1 text-sm text-base-content/60">
							{{ ts("profile.theme_description") }}
						</p>
					</div>
					<ColorModeButton show-label size="sm" variant="outline" />
				</div>
			</div>
		</UCard>

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

		<!-- Accessibility -->
		<UCard v-if="shows('appearance')" class="border border-base-200/60 bg-base-100 shadow-sm">
			<template #header>
				<div class="flex items-center gap-3">
					<div class="flex size-7 items-center justify-center rounded-full bg-primary/10">
						<UIcon name="heroicons:eye-20-solid" class="size-4 text-primary" />
					</div>
					<div>
						<h3 class="text-lg font-semibold text-base-content">
							{{ ts("profile.accessibility") }}
						</h3>
						<p class="text-sm text-base-content/60">
							{{ ts("profile.accessibility_description") }}
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
								{{ ts("profile.reduce_motion") }}
							</h4>
						</div>
						<p class="mt-1 text-sm text-base-content/60">
							{{ ts("profile.reduce_motion_description") }}
						</p>
					</div>
					<USwitch
						v-model="reduceMotionEnabled"
						:aria-label="ts('profile.reduce_motion')"
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
							{{ ts("profile.system_preference_detected") }}
						</p>
						<p class="mt-1 text-info/80">
							{{ ts("profile.system_preference_description") }}
						</p>
					</div>
				</div>

				<div class="flex items-center gap-2 text-sm">
					<span class="text-base-content/60">{{ ts("profile.current_status") }}</span>
					<UBadge :color="effectiveReduceMotion ? 'primary' : 'neutral'" variant="subtle">
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
								? ts("profile.motion_reduced")
								: ts("profile.motion_enabled")
						}}
					</UBadge>
				</div>
			</div>
		</UCard>
	</div>
</template>

<script setup lang="ts">
import { getNuxtUiLocales } from "~/utils/nuxt-ui-locales";

/**
 * The browser-local preferences every visitor has, signed in or not: theme,
 * language and reduced motion. They are stored through `useSettings()`, so
 * this component only renders the controls.
 */
const { only } = defineProps<{
	/**
	 * Shows one group instead of all of them, for the settings dialog, which
	 * gives each its own page. Reduced motion belongs with the appearance.
	 */
	only?: "appearance" | "language";
}>();

function shows(group: "appearance" | "language") {
	return only === undefined || only === group;
}

const { ts } = useI18n();
const { locale, selectLocale } = useAppLocale();
const { reduceMotionEnabled, effectiveReduceMotion, setReduceMotion, systemPreferenceActive } =
	useReduceMotion();

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
