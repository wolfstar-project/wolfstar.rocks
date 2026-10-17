<template>
	<section class="custom-theme" :aria-labelledby="headingId">
		<h4 :id="headingId" class="text-sm font-semibold text-highlighted">
			{{ ts("profile.themes.customize") }}
		</h4>

		<div>
			<p :id="baseLabelId" class="custom-theme-label">
				{{ ts("profile.themes.appearance") }}
			</p>
			<div role="radiogroup" :aria-labelledby="baseLabelId" class="custom-theme-segments">
				<label
					v-for="option in baseOptions"
					:key="option.id"
					class="custom-theme-segment"
					:class="{ 'custom-theme-segment--on': theme.base === option.id }"
				>
					<input
						type="radio"
						:name="baseLabelId"
						:value="option.id"
						:checked="theme.base === option.id"
						:aria-label="option.label"
						class="sr-only"
						@change="update({ base: option.id })"
					/>
					<UIcon :name="option.icon" class="size-4.5" aria-hidden="true" />
				</label>
			</div>
		</div>

		<div>
			<p :id="colorsLabelId" class="custom-theme-label">{{ ts("profile.themes.colors") }}</p>
			<ul
				class="custom-theme-preview"
				:style="{ backgroundImage: preview }"
				:aria-labelledby="colorsLabelId"
			>
				<li v-for="(color, index) in theme.colors" :key="index" class="custom-theme-color">
					<label class="custom-theme-color-swatch" :style="{ backgroundColor: color }">
						<input
							type="color"
							:value="color"
							:aria-label="ts('profile.themes.color_aria', { index: index + 1 })"
							class="sr-only"
							@input="setColor(index, ($event.target as HTMLInputElement).value)"
						/>
					</label>
					<span class="font-mono text-xs uppercase">{{ color }}</span>
					<UButton
						v-if="theme.colors.length > 1"
						color="neutral"
						variant="ghost"
						size="xs"
						icon="ic:round-remove"
						:aria-label="ts('profile.themes.remove_color', { index: index + 1 })"
						@click="removeColor(index)"
					/>
				</li>
			</ul>
			<UButton
				v-if="theme.colors.length < CUSTOM_THEME_MAX_COLORS"
				class="mt-2"
				color="neutral"
				variant="outline"
				size="sm"
				icon="ic:round-add"
				@click="addColor"
			>
				{{ ts("profile.themes.add_color") }}
			</UButton>
		</div>

		<div>
			<p class="custom-theme-label flex justify-between">
				<span :id="angleLabelId">{{ ts("profile.themes.direction") }}</span>
				<span class="font-mono">{{ theme.angle }}°</span>
			</p>
			<USlider
				:model-value="theme.angle"
				:min="0"
				:max="360"
				:aria-labelledby="angleLabelId"
				@update:model-value="(value) => update({ angle: toNumber(value) })"
			/>
		</div>

		<div>
			<p class="custom-theme-label flex justify-between">
				<span :id="intensityLabelId">{{ ts("profile.themes.intensity") }}</span>
				<span class="font-mono">{{ theme.intensity }}%</span>
			</p>
			<USlider
				:model-value="theme.intensity"
				:min="0"
				:max="100"
				:aria-labelledby="intensityLabelId"
				@update:model-value="(value) => update({ intensity: toNumber(value) })"
			/>
		</div>

		<div class="flex flex-wrap gap-2">
			<UButton
				color="neutral"
				variant="outline"
				size="sm"
				icon="ic:round-casino"
				@click="surprise"
			>
				{{ ts("profile.themes.surprise") }}
			</UButton>
			<UButton color="neutral" variant="ghost" size="sm" @click="reset">
				{{ ts("profile.themes.reset") }}
			</UButton>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { ColorThemeBase, CustomColorTheme } from "~/utils/color-themes";
import {
	colorThemeGradient,
	CUSTOM_THEME_MAX_COLORS,
	customColorTheme,
	DEFAULT_CUSTOM_THEME,
} from "~/utils/color-themes";

/**
 * Builds the custom colour theme, as Discord's "Customize your theme" does:
 * a light or dark base, up to five colours, the gradient's direction and how
 * much of it shows. Every change applies at once.
 */
const { ts } = useI18n();
const { customTheme: theme, updateCustomTheme: update } = useThemeChoice();

const headingId = useId();
const baseLabelId = useId();
const colorsLabelId = useId();
const angleLabelId = useId();
const intensityLabelId = useId();

const baseOptions = computed<{ id: ColorThemeBase; icon: string; label: string }[]>(() => [
	{ icon: "ic:round-dark-mode", id: "dark", label: ts("profile.themes.base_dark") },
	{ icon: "ic:round-light-mode", id: "light", label: ts("profile.themes.base_light") },
]);

const preview = computed(() => colorThemeGradient({ ...customColorTheme(theme.value), angle: 90 }));

function toNumber(value: number | number[] | undefined): number {
	return Array.isArray(value) ? (value[0] ?? 0) : (value ?? 0);
}

function setColor(index: number, color: string) {
	const colors = [...theme.value.colors];
	colors[index] = color;
	update({ colors });
}

function removeColor(index: number) {
	update({ colors: theme.value.colors.filter((_, i) => i !== index) });
}

function randomColor(): string {
	return `#${Math.floor(Math.random() * 0xffffff)
		.toString(16)
		.padStart(6, "0")}`;
}

function addColor() {
	update({ colors: [...theme.value.colors, randomColor()] });
}

function surprise() {
	const count = 2 + Math.floor(Math.random() * 2);
	update({
		angle: Math.floor(Math.random() * 361),
		colors: Array.from({ length: count }, randomColor),
	});
}

function reset() {
	const defaults: CustomColorTheme = { ...DEFAULT_CUSTOM_THEME, base: theme.value.base };
	update(defaults);
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.custom-theme {
	@apply flex max-w-110 flex-col gap-4 rounded-[10px] p-4;
	background-color: var(--console-surface, var(--color-base-200));
	border: 1px solid var(--home-border-subtle);
}

.custom-theme-label {
	@apply mb-2 text-xs font-bold tracking-[0.04em] text-muted uppercase;
}

.custom-theme-segments {
	@apply grid grid-cols-2 gap-1 rounded-[8px] p-1;
	background-color: var(--console-input, var(--field-surface));
}

.custom-theme-segment {
	@apply flex h-8 cursor-pointer items-center justify-center rounded-[6px] text-muted;
}

.custom-theme-segment--on {
	@apply text-highlighted;
	background-color: var(--console-active, var(--color-base-100));
}

.custom-theme-segment:has(input:focus-visible),
.custom-theme-color-swatch:has(input:focus-visible) {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.custom-theme-preview {
	@apply flex flex-col gap-1 rounded-[8px] p-1;
}

.custom-theme-color {
	@apply flex items-center gap-2.5 rounded-[6px] p-1.5;
	background-color: var(--console-surface, var(--color-base-100));
}

.custom-theme-color-swatch {
	@apply size-7 shrink-0 cursor-pointer rounded-[6px];
	box-shadow: inset 0 0 0 1px var(--field-border);
}
</style>
