<template>
	<section aria-labelledby="changelog-heading" class="flex flex-col gap-6">
		<div class="flex min-h-8 items-center justify-between gap-4">
			<h2 id="changelog-heading" class="text-2xl font-semibold text-highlighted">
				{{ ts("changelog.title") }}
			</h2>
			<UFieldGroup v-if="scrollable" size="sm">
				<UButton
					icon="i-lucide-chevron-left"
					:aria-label="ts('blog.timeline.newer')"
					color="neutral"
					variant="outline"
					:disabled="atStart"
					class="pointer-coarse:size-11 pointer-coarse:justify-center"
					@click="scroll(-1)"
				/>
				<UButton
					icon="i-lucide-chevron-right"
					:aria-label="ts('blog.timeline.older')"
					color="neutral"
					variant="outline"
					:disabled="atEnd"
					class="pointer-coarse:size-11 pointer-coarse:justify-center"
					@click="scroll(1)"
				/>
			</UFieldGroup>
		</div>

		<ol
			ref="track"
			class="no-scrollbar -ms-3 flex snap-x snap-mandatory overflow-x-auto"
			@scroll.passive="updateEdges"
		>
			<li
				v-for="(entry, index) in entries"
				:key="entry.path"
				class="w-[85%] shrink-0 snap-start sm:w-1/2 lg:w-1/4"
			>
				<div class="relative flex h-2.5 items-center ps-3" aria-hidden="true">
					<span class="absolute inset-x-0 border-t border-default"></span>
					<span
						class="relative size-2.5 rounded-full ring-4 ring-(--ui-bg)"
						:class="index === 0 ? 'bg-primary' : 'bg-(--ui-text-dimmed)'"
					></span>
				</div>

				<NuxtLink
					:to="`/changelog#${changelogEntryAnchor(entry.path)}`"
					class="me-3 mt-3 flex flex-col gap-2 rounded-lg p-3 transition-colors hover:bg-elevated/60 focus-visible:outline-2 focus-visible:outline-primary motion-reduce:transition-none"
				>
					<h3 class="text-base text-pretty text-highlighted">{{ entry.title }}</h3>
					<p class="line-clamp-2 text-sm text-muted">{{ entry.description }}</p>
					<p class="flex flex-wrap items-center gap-2 text-sm text-muted">
						<UBadge v-bind="kindBadges[entry.kind]" variant="subtle" size="sm" />
						<time :datetime="entry.date">{{
							formatDateByLocale(locale, entry.date, "short")
						}}</time>
					</p>
				</NuxtLink>
			</li>
		</ol>

		<UButton
			to="/changelog"
			:label="ts('blog.timeline.view_all')"
			trailing-icon="i-lucide-arrow-right"
			color="neutral"
			variant="link"
			class="self-start px-0 pointer-coarse:min-h-11"
		/>
	</section>
</template>

<script setup lang="ts">
defineProps<{
	/** Newest first. */
	entries: ChangelogEntrySummary[];
}>();

const { ts } = useI18n();
const { locale } = useAppLocale();
const { kindBadges } = useBlogLabels();
const { effectiveReduceMotion } = useReduceMotion();

const track = useTemplateRef<HTMLOListElement>("track");
const atStart = ref(true);
const atEnd = ref(true);
// The server cannot know whether the entries overflow the track, so the
// buttons only appear once the browser has measured it.
const scrollable = computed(() => !(atStart.value && atEnd.value));

function updateEdges() {
	const element = track.value;
	if (!element) return;
	atStart.value = element.scrollLeft <= 1;
	atEnd.value = element.scrollLeft + element.clientWidth >= element.scrollWidth - 1;
}

onMounted(updateEdges);
useResizeObserver(track, updateEdges);

function scroll(direction: 1 | -1) {
	const element = track.value;
	if (!element) return;
	element.scrollBy({
		behavior: effectiveReduceMotion.value ? "auto" : "smooth",
		left: direction * element.clientWidth,
	});
}
</script>
