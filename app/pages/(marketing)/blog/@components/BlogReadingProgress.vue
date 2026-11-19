<template>
	<div class="flex flex-col border-t border-default pt-2">
		<UButton
			color="neutral"
			variant="ghost"
			trailing-icon="i-lucide-arrow-up"
			class="-mx-2.5 gap-2 text-muted"
			@click="backToTop"
		>
			<template #leading>
				<svg viewBox="0 0 16 16" aria-hidden="true" class="size-4 shrink-0 -rotate-90">
					<circle
						cx="8"
						cy="8"
						r="6.5"
						fill="none"
						stroke-width="2"
						class="stroke-(--ui-text-dimmed)"
					/>
					<circle
						cx="8"
						cy="8"
						r="6.5"
						fill="none"
						stroke-width="2"
						stroke-linecap="round"
						pathLength="100"
						stroke-dasharray="100"
						:stroke-dashoffset="100 - progress * 100"
						class="stroke-primary"
					/>
				</svg>
			</template>

			<span class="flex-1 text-start tabular-nums">
				{{
					minutesLeft
						? ts("blog.reading_left", { minutes: minutesLeft })
						: ts("blog.reading_finished")
				}}<span class="sr-only">, {{ ts("a11y.scroll_to_top") }}</span>
			</span>
		</UButton>
	</div>
</template>

<script setup lang="ts">
const { readingTime, target } = defineProps<{
	/** Whole minutes the post takes to read. */
	readingTime: number;
	/** The element that holds the post's text: its scroll position is the progress. */
	target?: HTMLElement | null;
}>();

const { ts } = useI18n();
const { effectiveReduceMotion } = useReduceMotion();

/** From 0, the text's top at the top of the screen, to 1, its end in view. */
const progress = ref(0);
const minutesLeft = computed(() => Math.ceil(readingTime * (1 - progress.value)));

function update() {
	if (!target) return;
	const rect = target.getBoundingClientRect();
	const range = rect.height - window.innerHeight;
	if (range <= 0) {
		progress.value = rect.bottom <= window.innerHeight ? 1 : 0;
	} else {
		progress.value = Math.min(1, Math.max(0, -rect.top / range));
	}
}

let frame = 0;
function scheduleUpdate() {
	cancelAnimationFrame(frame);
	frame = requestAnimationFrame(update);
}

useEventListener("scroll", scheduleUpdate, { passive: true });
useEventListener("resize", scheduleUpdate, { passive: true });
onMounted(update);
watch(() => target, update);
onBeforeUnmount(() => cancelAnimationFrame(frame));

function backToTop() {
	window.scrollTo({ behavior: effectiveReduceMotion.value ? "auto" : "smooth", top: 0 });
}
</script>
