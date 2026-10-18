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
			<div
				role="radiogroup"
				:aria-labelledby="colorsLabelId"
				class="custom-theme-strip"
				:style="{ backgroundImage: preview }"
			>
				<label
					v-for="(color, index) in theme.colors"
					:key="index"
					class="custom-theme-stop"
					:class="{ 'custom-theme-stop--on': index === selected }"
					:style="{ backgroundColor: color }"
				>
					<input
						type="radio"
						:name="colorsLabelId"
						:value="index"
						:checked="index === selected"
						:aria-label="ts('profile.themes.color_aria', { index: index + 1 })"
						class="sr-only"
						@change="selected = index"
					/>
				</label>
			</div>

			<AppColorPicker
				class="mt-3"
				:model-value="current"
				@update:model-value="setColor(selected, $event)"
			/>

			<div class="custom-theme-hex">
				<span
					class="custom-theme-sample"
					:style="{ backgroundColor: current }"
					aria-hidden="true"
				></span>
				<input
					v-model="hexDraft"
					type="text"
					class="custom-theme-hex-input"
					maxlength="7"
					spellcheck="false"
					autocomplete="off"
					:aria-label="ts('profile.themes.hex_label')"
					:aria-invalid="hexInvalid"
					@input="onHexInput"
					@blur="resetHexDraft"
					@keydown.enter.prevent="resetHexDraft"
				/>
				<UButton
					v-if="eyedropperSupported"
					color="neutral"
					variant="ghost"
					size="sm"
					icon="ic:round-colorize"
					:aria-label="ts('profile.themes.eyedropper')"
					@click="pickFromScreen"
				/>
				<UButton
					color="neutral"
					variant="ghost"
					size="sm"
					icon="ic:round-remove"
					:disabled="theme.colors.length <= 1"
					:aria-label="ts('profile.themes.remove_color', { index: selected + 1 })"
					@click="removeColor(selected)"
				/>
			</div>

			<UButton
				v-if="theme.colors.length < CUSTOM_THEME_MAX_COLORS"
				class="mt-2 w-full justify-center"
				color="neutral"
				variant="soft"
				size="md"
				icon="ic:round-add"
				@click="addColor"
			>
				{{ ts("profile.themes.add_color") }}
			</UButton>
		</div>

		<div class="flex flex-col gap-3.5">
			<p class="custom-theme-label">{{ ts("profile.themes.controls") }}</p>
			<div>
				<p class="mb-2 flex justify-between text-[0.8125rem] font-semibold">
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
				<p class="mb-2 flex justify-between text-[0.8125rem] font-semibold">
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
		</div>

		<div class="flex flex-col gap-2">
			<UButton
				color="neutral"
				variant="soft"
				class="w-full justify-center"
				icon="ic:round-casino"
				@click="surprise"
			>
				{{ ts("profile.themes.surprise") }}
			</UButton>
			<UButton color="neutral" variant="soft" class="w-full justify-center" @click="reset">
				{{ ts("profile.themes.reset") }}
			</UButton>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { ColorThemeBase, CustomColorTheme } from "~/utils/color-themes";
import { normalizeHex } from "~/utils/color-convert";
import {
	colorThemeGradient,
	CUSTOM_THEME_MAX_COLORS,
	customColorTheme,
	DEFAULT_CUSTOM_THEME,
} from "~/utils/color-themes";

/**
 * Builds the custom colour theme, as Discord's "Customize your theme" does: a
 * dark or light base, up to five colours picked on a strip that shows the
 * gradient, the gradient's direction and how much of it shows. Every change
 * applies at once.
 */
interface EyeDropperResult {
	sRGBHex: string;
}

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

// The strip shows the gradient left to right, whatever its direction on the page.
const preview = computed(() => colorThemeGradient({ ...customColorTheme(theme.value), angle: 90 }));

const selected = ref(0);
// A removed colour or a reset can leave the selection past the end.
watch(
	() => theme.value.colors.length,
	(count) => {
		if (selected.value >= count) selected.value = Math.max(0, count - 1);
	},
);
const current = computed(
	() => theme.value.colors[selected.value] ?? DEFAULT_CUSTOM_THEME.colors[0]!,
);

// What is typed in the hex field, kept as it is while it is not a colour yet.
const hexDraft = ref(current.value);
const hexInvalid = ref(false);
watch(current, (hex) => {
	if (normalizeHex(hexDraft.value) !== hex) hexDraft.value = hex;
});

function onHexInput() {
	const hex = normalizeHex(hexDraft.value);
	hexInvalid.value = hex === null;
	if (hex) setColor(selected.value, hex);
}

function resetHexDraft() {
	hexDraft.value = current.value;
	hexInvalid.value = false;
}

const eyedropperSupported = computed(() => import.meta.client && "EyeDropper" in window);

async function pickFromScreen() {
	const Dropper = (
		window as unknown as { EyeDropper?: new () => { open: () => Promise<EyeDropperResult> } }
	).EyeDropper;
	if (!Dropper) return;
	try {
		const { sRGBHex } = await new Dropper().open();
		const hex = normalizeHex(sRGBHex);
		if (hex) setColor(selected.value, hex);
	} catch {
		// Closed without picking a colour.
	}
}

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
	return `#${Math.floor(Math.random() * 0xff_ff_ff)
		.toString(16)
		.padStart(6, "0")
		.toUpperCase()}`;
}

function addColor() {
	update({ colors: [...theme.value.colors, randomColor()] });
	selected.value = theme.value.colors.length - 1;
}

function surprise() {
	const count = 2 + Math.floor(Math.random() * 2);
	update({
		angle: Math.floor(Math.random() * 361),
		colors: Array.from({ length: count }, randomColor),
	});
	selected.value = 0;
}

function reset() {
	const defaults: CustomColorTheme = { ...DEFAULT_CUSTOM_THEME, base: theme.value.base };
	update(defaults);
	selected.value = 0;
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.custom-theme {
	@apply flex max-w-86 flex-col gap-4.5 rounded-[10px] p-4;
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
.custom-theme-stop:has(input:focus-visible) {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

/* The gradient as it will run, with a square on it for each colour. */
.custom-theme-strip {
	@apply flex h-10 items-center justify-between rounded-[8px] px-1.5;
	box-shadow: inset 0 0 0 1px var(--field-border);
}

.custom-theme-strip:has(.custom-theme-stop:only-child) {
	@apply justify-center;
}

.custom-theme-stop {
	@apply size-7 cursor-pointer rounded-[6px] transition-transform;
	border: 2px solid var(--color-white);
	box-shadow: 0 0 0 1px color-mix(in oklab, var(--color-black) 35%, transparent);
}

.custom-theme-stop--on {
	@apply scale-110;
	border-width: 3px;
}

.custom-theme-hex {
	@apply mt-3 flex items-center gap-1.5 rounded-[8px] py-1 pr-1 pl-2;
	background-color: var(--console-input, var(--field-surface));
}

.custom-theme-sample {
	@apply size-5 shrink-0 rounded-[4px];
	box-shadow: inset 0 0 0 1px var(--field-border);
}

.custom-theme-hex-input {
	@apply min-w-0 grow border-0 bg-transparent px-1 font-mono text-sm uppercase outline-none;
	color: var(--ui-text-highlighted);
}

.custom-theme-hex-input:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
	border-radius: 4px;
}

.custom-theme-hex-input[aria-invalid="true"] {
	color: var(--color-error);
}
</style>
