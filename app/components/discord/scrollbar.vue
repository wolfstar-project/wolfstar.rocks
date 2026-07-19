<template>
	<div class="discord-scrollbar" :class="{ 'discord-scrollbar-with-arrows': showArrows }">
		<div ref="viewportRef" class="discord-scrollbar-viewport">
			<div ref="contentRef" class="discord-scrollbar-content">
				<slot />
			</div>
		</div>

		<div
			v-show="isScrollable || alwaysShowTrack"
			class="discord-scrollbar-track"
			aria-hidden="true"
		>
			<button
				v-if="showArrows"
				type="button"
				class="discord-scrollbar-arrow discord-scrollbar-arrow-up"
				tabindex="-1"
				aria-hidden="true"
				@click="scrollByStep(-1)"
			>
				<span class="discord-scrollbar-arrow-icon" />
			</button>

			<div ref="thumbRailRef" class="discord-scrollbar-thumb-rail">
				<div
					v-show="isScrollable"
					class="discord-scrollbar-thumb"
					:style="{
						height: `${thumbHeight}px`,
						transform: `translateY(${thumbOffset}px)`,
					}"
				/>
			</div>

			<button
				v-if="showArrows"
				type="button"
				class="discord-scrollbar-arrow discord-scrollbar-arrow-down"
				tabindex="-1"
				aria-hidden="true"
				@click="scrollByStep(1)"
			>
				<span class="discord-scrollbar-arrow-icon" />
			</button>
		</div>
	</div>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface DiscordScrollbarProps {
	alwaysShowTrack?: boolean;
	showArrows?: boolean;
	/** Minimum thumb height in px. */
	minThumbHeight?: number;
	/** Maximum thumb height in px — keeps Discord picker thumbs short and chunky. */
	maxThumbHeight?: number;
}

interface DiscordScrollbarSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
defineSlots<DiscordScrollbarSlots>();

const SCROLL_STEP = 40;

const {
	alwaysShowTrack = false,
	showArrows = false,
	minThumbHeight = 24,
	maxThumbHeight,
} = defineProps<DiscordScrollbarProps>();

const viewportRef = useTemplateRef<HTMLDivElement>("viewportRef");
const contentRef = useTemplateRef<HTMLDivElement>("contentRef");
const thumbRailRef = useTemplateRef<HTMLDivElement>("thumbRailRef");

const isScrollable = ref(false);
const thumbHeight = ref(0);
const thumbOffset = ref(0);

function updateThumb() {
	const viewport = viewportRef.value;
	const thumbRail = thumbRailRef.value;
	if (!viewport || !thumbRail) {
		isScrollable.value = false;
		thumbHeight.value = 0;
		thumbOffset.value = 0;
		return;
	}

	const { scrollTop, scrollHeight, clientHeight } = viewport;
	const overflow = scrollHeight > clientHeight + 1;
	isScrollable.value = overflow;

	if (!overflow) {
		thumbHeight.value = 0;
		thumbOffset.value = 0;
		return;
	}

	const railHeight = thumbRail.clientHeight;
	const proportionalHeight = (clientHeight / scrollHeight) * railHeight;
	const cappedMax =
		maxThumbHeight === undefined
			? proportionalHeight
			: Math.min(proportionalHeight, maxThumbHeight);
	const computedThumbHeight = Math.max(cappedMax, minThumbHeight);
	const maxThumbOffset = Math.max(railHeight - computedThumbHeight, 0);
	const maxScrollTop = scrollHeight - clientHeight;

	thumbHeight.value = computedThumbHeight;
	thumbOffset.value = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbOffset : 0;
}

const { y } = useScroll(viewportRef, {
	behavior: "smooth",
	onScroll: updateThumb,
});

useResizeObserver(viewportRef, updateThumb);
useResizeObserver(contentRef, updateThumb);
useResizeObserver(thumbRailRef, updateThumb);

function scrollByStep(direction: 1 | -1) {
	y.value += direction * SCROLL_STEP;
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-scrollbar {
	--discord-scrollbar-track: oklch(73.06% 0.0048 264.53 / 0.12);
	--discord-scrollbar-thumb: oklch(73.06% 0.0048 264.53 / 0.45);
	--discord-scrollbar-arrow: oklch(73.06% 0.0048 264.53 / 0.7);

	@apply grid max-h-[inherit] min-h-0 min-w-0 grid-cols-[minmax(0,1fr)_4px] gap-0;
}

.discord-scrollbar-viewport {
	@apply max-h-[inherit] min-h-0 min-w-0 overflow-x-hidden overflow-y-auto;
	scrollbar-width: none;
	-ms-overflow-style: none;
}

.discord-scrollbar-viewport::-webkit-scrollbar {
	display: none;
}

.discord-scrollbar-content {
	@apply min-w-0;
}

.discord-scrollbar-track {
	@apply relative flex min-h-0 flex-col items-center self-stretch;
}

.discord-scrollbar-with-arrows .discord-scrollbar-track {
	@apply py-0.5;
}

.discord-scrollbar-thumb-rail {
	@apply relative min-h-0 w-full flex-1 rounded-full;
	background-color: var(--discord-scrollbar-track);
}

.discord-scrollbar-thumb {
	@apply absolute top-0 left-0 w-full rounded-full;
	background-color: var(--discord-scrollbar-thumb);
	will-change: transform;
}

.discord-scrollbar-arrow {
	@apply flex size-3 shrink-0 items-center justify-center border-0 bg-transparent p-0;
}

.discord-scrollbar-arrow-icon {
	@apply block size-0 border-x-[3px] border-x-transparent;
}

.discord-scrollbar-arrow-up .discord-scrollbar-arrow-icon {
	border-bottom: 4px solid var(--discord-scrollbar-arrow);
}

.discord-scrollbar-arrow-down .discord-scrollbar-arrow-icon {
	border-top: 4px solid var(--discord-scrollbar-arrow);
}
</style>
