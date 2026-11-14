<template>
	<div
		class="discord-scrollbar"
		:class="{
			'discord-scrollbar-auto-hide': autoHide,
			'discord-scrollbar-overlay': overlay,
			'discord-scrollbar-themed': themed,
			'discord-scrollbar-scrolling': isScrolling || isDragging,
			'discord-scrollbar-scrollable': isScrollable,
		}"
	>
		<div ref="viewportRef" class="discord-scrollbar-viewport">
			<div ref="contentRef" class="discord-scrollbar-content">
				<slot />
			</div>
		</div>

		<div v-show="isScrollable" class="discord-scrollbar-track" aria-hidden="true">
			<div
				ref="thumbRailRef"
				class="discord-scrollbar-thumb-rail"
				@pointerdown.self="pageTowards"
			>
				<div
					ref="thumbRef"
					class="discord-scrollbar-thumb rounded-full"
					:style="{
						height: `${thumbHeight}px`,
						transform: `translateY(${thumbOffset}px)`,
					}"
				/>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import type { VNode } from "vue";

/*
 * Use newt/ui's `ScrollArea` where a native thin scrollbar is enough. This
 * drawn thumb stays for what `ScrollArea` cannot do: float over the content
 * (`overlay`), stop short of a card laid over the foot (the track's `bottom`),
 * hide until hover (`autoHide`), and clamp the thumb's height.
 */
interface DiscordScrollbarProps {
	/** Maximum thumb height in px: keeps the server rail's thumb short. */
	maxThumbHeight?: number;
	/** Hide the thumb until the scrollbar is hovered or the content scrolls. */
	autoHide?: boolean;
	/**
	 * Float the thumb over the content instead of keeping a lane for it, so a
	 * narrow column (the server rail) keeps its full width.
	 */
	overlay?: boolean;
	/** Tint the thumb from the selected theme's muted text instead of newt/ui's grey. */
	themed?: boolean;
}

interface DiscordScrollbarSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
defineSlots<DiscordScrollbarSlots>();

const MIN_THUMB_HEIGHT = 24;
const SCROLLING_IDLE_MS = 800;

const {
	maxThumbHeight,
	autoHide = false,
	overlay = false,
	themed = false,
} = defineProps<DiscordScrollbarProps>();

const viewportRef = useTemplateRef<HTMLDivElement>("viewportRef");
const contentRef = useTemplateRef<HTMLDivElement>("contentRef");
const thumbRailRef = useTemplateRef<HTMLDivElement>("thumbRailRef");
const thumbRef = useTemplateRef<HTMLDivElement>("thumbRef");

const isScrollable = ref(false);
const thumbHeight = ref(0);
const thumbOffset = ref(0);
const isScrolling = ref(false);
const isDragging = ref(false);

const { start: restartScrollingIdle } = useTimeoutFn(
	() => {
		isScrolling.value = false;
	},
	SCROLLING_IDLE_MS,
	{ immediate: false },
);

function updateThumb() {
	const viewport = viewportRef.value;
	const thumbRail = thumbRailRef.value;
	if (!viewport || !thumbRail || viewport.scrollHeight <= viewport.clientHeight + 1) {
		isScrollable.value = false;
		thumbHeight.value = 0;
		thumbOffset.value = 0;
		return;
	}
	isScrollable.value = true;

	const { scrollTop, scrollHeight, clientHeight } = viewport;
	const railHeight = thumbRail.clientHeight;
	const proportionalHeight = (clientHeight / scrollHeight) * railHeight;
	const capped =
		maxThumbHeight === undefined
			? proportionalHeight
			: Math.min(proportionalHeight, maxThumbHeight);
	const height = Math.max(capped, MIN_THUMB_HEIGHT);
	const maxThumbOffset = Math.max(railHeight - height, 0);
	const maxScrollTop = scrollHeight - clientHeight;

	thumbHeight.value = height;
	thumbOffset.value = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbOffset : 0;
}

const { y } = useScroll(viewportRef, {
	behavior: "smooth",
	onScroll: () => {
		updateThumb();
		if (!autoHide) return;
		isScrolling.value = true;
		restartScrollingIdle();
	},
});

useResizeObserver(viewportRef, updateThumb);
useResizeObserver(contentRef, updateThumb);
useResizeObserver(thumbRailRef, updateThumb);

// The thumb drags the content as the native bar's does: each pixel of the rail
// is worth as much scroll as the rail is shorter than the content.
let drag: { startY: number; startScroll: number; ratio: number } | undefined;

useEventListener(thumbRef, "pointerdown", (event: PointerEvent) => {
	const viewport = viewportRef.value;
	const thumbRail = thumbRailRef.value;
	const thumb = thumbRef.value;
	if (event.button !== 0 || !viewport || !thumbRail || !thumb) return;
	event.preventDefault();

	const travel = Math.max(thumbRail.clientHeight - thumbHeight.value, 1);
	drag = {
		startY: event.clientY,
		startScroll: viewport.scrollTop,
		ratio: (viewport.scrollHeight - viewport.clientHeight) / travel,
	};
	// A pointer the browser no longer tracks cannot be captured; the drag then
	// follows it only while it stays over the thumb.
	try {
		thumb.setPointerCapture(event.pointerId);
	} catch {}
	isDragging.value = true;
});

useEventListener(thumbRef, "pointermove", (event: PointerEvent) => {
	const viewport = viewportRef.value;
	if (!drag || !viewport) return;
	viewport.scrollTop = drag.startScroll + (event.clientY - drag.startY) * drag.ratio;
});

useEventListener(thumbRef, ["pointerup", "pointercancel"], () => {
	drag = undefined;
	isDragging.value = false;
});

// A click on the rail moves a page towards it, as the native bar's track does.
function pageTowards(event: PointerEvent) {
	const viewport = viewportRef.value;
	const thumbRail = thumbRailRef.value;
	if (event.button !== 0 || !viewport || !thumbRail || !isScrollable.value) return;
	const offset = event.clientY - thumbRail.getBoundingClientRect().top;
	y.value += (offset < thumbOffset.value ? -1 : 1) * viewport.clientHeight;
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-scrollbar {
	/*
	 * Discord's floating pill: a 5px thumb, 3px from the right edge, 4px from
	 * the ends. The thumb takes newt/ui's scrollbar colour, as `ScrollArea` does.
	 */
	--discord-scrollbar-thumb: var(--newt-bg-active);
	--discord-scrollbar-thumb-width: 5px;
	--discord-scrollbar-edge-inset: 3px;
	--discord-scrollbar-end-inset: 4px;
	/* Gutter = thumb + right inset + small left breathing room. */
	--discord-scrollbar-gutter: calc(
		var(--discord-scrollbar-thumb-width) + var(--discord-scrollbar-edge-inset) + 2px
	);

	@apply grid max-h-[inherit] min-h-0 min-w-0;
	/* Collapse the track lane until content overflows. */
	grid-template-columns: minmax(0, 1fr) 0;
}

.discord-scrollbar-scrollable {
	grid-template-columns: minmax(0, 1fr) var(--discord-scrollbar-gutter);
}

.discord-scrollbar.discord-scrollbar-themed {
	--discord-scrollbar-thumb: color-mix(in oklab, var(--ui-text-muted) 45%, transparent);
}

/* The thumb floats over the content's right edge: no lane is kept for it. */
.discord-scrollbar.discord-scrollbar-overlay {
	@apply relative;
	grid-template-columns: minmax(0, 1fr);
}

/* Over the content only the thumb takes the pointer, so the content under the
   lane stays clickable. */
.discord-scrollbar-overlay .discord-scrollbar-track {
	@apply pointer-events-none absolute inset-y-0 right-0 z-1;
}

.discord-scrollbar-overlay .discord-scrollbar-thumb {
	@apply pointer-events-auto;
}

.discord-scrollbar-viewport {
	@apply max-h-[inherit] min-h-0 min-w-0 overflow-x-hidden overflow-y-auto;
	scrollbar-width: none;
}

.discord-scrollbar-viewport::-webkit-scrollbar {
	display: none;
}

.discord-scrollbar-content {
	@apply min-w-0;
}

.discord-scrollbar-track {
	@apply relative flex min-h-0 flex-col self-stretch;
	width: var(--discord-scrollbar-gutter);
}

.discord-scrollbar-thumb-rail {
	@apply relative min-h-0 w-full flex-1;
	margin-block: var(--discord-scrollbar-end-inset);
}

.discord-scrollbar-thumb {
	/* `rounded-full` is a template class so the pill shape is assertable. */
	@apply absolute top-0;
	right: var(--discord-scrollbar-edge-inset);
	width: var(--discord-scrollbar-thumb-width);
	background-color: var(--discord-scrollbar-thumb);
	touch-action: none;
	will-change: transform;
}

.discord-scrollbar-auto-hide .discord-scrollbar-thumb {
	opacity: 0;
	transition: opacity 0.1s linear;
}

.discord-scrollbar-auto-hide:hover .discord-scrollbar-thumb,
.discord-scrollbar-auto-hide.discord-scrollbar-scrolling .discord-scrollbar-thumb {
	opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
	.discord-scrollbar-auto-hide .discord-scrollbar-thumb {
		transition: none;
	}
}
</style>
