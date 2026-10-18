<template>
	<div class="color-picker">
		<div
			ref="area"
			class="color-picker-area"
			role="slider"
			tabindex="0"
			:aria-label="ts('profile.themes.picker_area')"
			:aria-valuetext="
				ts('profile.themes.picker_area_value', {
					brightness: Math.round(hsv.v),
					saturation: Math.round(hsv.s),
				})
			"
			aria-valuemin="0"
			aria-valuemax="100"
			:aria-valuenow="Math.round(hsv.v)"
			:style="{ '--picker-hue': `hsl(${hsv.h} 100% 50%)` }"
			@pointerdown="startDrag"
			@pointermove="drag"
			@pointerup="endDrag"
			@pointercancel="endDrag"
			@keydown="onAreaKey"
		>
			<span
				class="color-picker-thumb"
				:style="{ left: `${hsv.s}%`, top: `${100 - hsv.v}%` }"
				aria-hidden="true"
			></span>
		</div>
		<input
			class="color-picker-hue"
			type="range"
			min="0"
			max="360"
			step="1"
			:aria-label="ts('profile.themes.picker_hue')"
			:value="Math.round(hsv.h)"
			@input="onHue"
		/>
	</div>
</template>

<script setup lang="ts">
import { type Hsv, hexToHsv, hsvToHex } from "~/utils/color-convert";

/**
 * A colour picker, as Discord's theme editor has it: a square for the
 * saturation and the brightness over the hue, and a slider for the hue. The
 * square answers the pointer and the arrow keys (a step of 1, of 10 with Shift).
 */
const model = defineModel<string>({ required: true });

const { ts } = useI18n();
const area = useTemplateRef<HTMLElement>("area");

// The hue and the saturation of white, grey and black are not in their hex, so
// they are kept here while the picker is in use.
const hsv = ref<Hsv>(hexToHsv(model.value));
watch(model, (hex) => {
	if (hex !== hsvToHex(hsv.value)) hsv.value = hexToHsv(hex);
});

function set(next: Hsv) {
	hsv.value = {
		h: next.h,
		s: Math.min(100, Math.max(0, next.s)),
		v: Math.min(100, Math.max(0, next.v)),
	};
	model.value = hsvToHex(hsv.value);
}

let dragging = false;

function fromPointer(event: PointerEvent) {
	const rect = area.value?.getBoundingClientRect();
	if (!rect || rect.width === 0 || rect.height === 0) return;
	set({
		h: hsv.value.h,
		s: ((event.clientX - rect.left) / rect.width) * 100,
		v: 100 - ((event.clientY - rect.top) / rect.height) * 100,
	});
}

function startDrag(event: PointerEvent) {
	dragging = true;
	area.value?.setPointerCapture(event.pointerId);
	area.value?.focus();
	fromPointer(event);
}

function drag(event: PointerEvent) {
	if (dragging) fromPointer(event);
}

function endDrag(event: PointerEvent) {
	dragging = false;
	area.value?.releasePointerCapture(event.pointerId);
}

function onAreaKey(event: KeyboardEvent) {
	const step = event.shiftKey ? 10 : 1;
	const moves: Record<string, [number, number]> = {
		ArrowDown: [0, -step],
		ArrowLeft: [-step, 0],
		ArrowRight: [step, 0],
		ArrowUp: [0, step],
	};
	const move = moves[event.key];
	if (!move) return;

	event.preventDefault();
	set({ h: hsv.value.h, s: hsv.value.s + move[0], v: hsv.value.v + move[1] });
}

function onHue(event: Event) {
	set({ h: Number((event.target as HTMLInputElement).value), s: hsv.value.s, v: hsv.value.v });
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.color-picker {
	@apply flex flex-col gap-3;
}

.color-picker-area {
	@apply relative h-30 w-full cursor-crosshair touch-none rounded-[6px];
	background-color: var(--picker-hue);
	background-image:
		linear-gradient(to top, var(--color-black), transparent),
		linear-gradient(to right, var(--color-white), transparent);
}

.color-picker-area:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 2px;
}

.color-picker-thumb {
	@apply pointer-events-none absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full;
	border: 2px solid var(--color-white);
	box-shadow: 0 0 0 1px color-mix(in oklab, var(--color-black) 40%, transparent);
}

.color-picker-hue {
	@apply h-3 w-full cursor-pointer appearance-none rounded-full;
	background: var(--picker-hue-track);
}

.color-picker-hue::-webkit-slider-thumb {
	@apply size-4 appearance-none rounded-full;
	background-color: transparent;
	border: 2px solid var(--color-white);
	box-shadow: 0 0 0 1px color-mix(in oklab, var(--color-black) 40%, transparent);
}

.color-picker-hue::-moz-range-thumb {
	@apply size-4 rounded-full;
	background-color: transparent;
	border: 2px solid var(--color-white);
	box-shadow: 0 0 0 1px color-mix(in oklab, var(--color-black) 40%, transparent);
}

.color-picker-hue:focus-visible {
	outline: 2px solid var(--color-primary);
	outline-offset: 3px;
}
</style>
