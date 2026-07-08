<template>
	<Section id="features" labelled-by="home-features-heading" scroll-margin>
		<SectionHeader
			eyebrow="Features"
			title="And more than moderation."
			heading-id="home-features-heading"
			class="mb-12"
		/>

		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:[grid-auto-rows:160px] lg:grid-cols-4">
			<SurfaceCard
				v-for="feature of features"
				:key="feature.title"
				tag="article"
				:accent="feature.big ? feature.accent : undefined"
				:class="
					cn(
						'flex flex-col justify-center',
						feature.big && 'sm:col-span-2 lg:col-span-2 lg:row-span-2',
					)
				"
			>
				<div class="mb-4 flex size-14 items-center justify-center rounded-lg bg-primary/10">
					<UIcon :name="feature.icon" class="h-7 w-7 text-primary" aria-hidden="true" />
				</div>
				<h3
					:class="
						cn('font-bold text-base-content', feature.big ? 'text-2xl' : 'text-base')
					"
				>
					{{ feature.title }}
				</h3>
				<p class="mt-2 text-sm leading-relaxed text-base-content/60">
					{{ feature.description }}
				</p>
				<div v-if="feature.big" class="mt-5 flex flex-wrap gap-2">
					<span class="badge badge-soft badge-error">Spam</span>
					<span class="badge badge-soft badge-primary">Invites</span>
					<span class="badge badge-soft badge-warning">Mentions</span>
				</div>
			</SurfaceCard>
		</div>

		<div ref="showcaseRef" class="mt-16 min-h-100 w-full">
			<template v-if="showcaseLoaded">
				<LazyFeatureCarousel class="mb-12" @open-feature="openFeature" />
				<LazyFeatureShowcase v-model:active-feature="selectedFeatureIndex" />
			</template>
		</div>
	</Section>
</template>

<script setup lang="ts">
import { cn } from "cnfast";
const SHOWCASE_FEATURE_HASHES = ["#moderation-tools", "#advanced-logging"] as const;

defineProps<{
	features: HomeFeature[];
}>();

const selectedFeatureIndex = ref(0);
const showcaseRef = ref<HTMLElement | null>(null);
const showcaseLoaded = ref(false);

function shouldLoadShowcase(hash: string): boolean {
	return (
		hash === "#features" ||
		SHOWCASE_FEATURE_HASHES.includes(hash as (typeof SHOWCASE_FEATURE_HASHES)[number])
	);
}

function openFeature(index: number) {
	selectedFeatureIndex.value = index;
	showcaseLoaded.value = true;
}

onMounted(() => {
	if (shouldLoadShowcase(window.location.hash)) {
		showcaseLoaded.value = true;
	}
});

const { stop: stopShowcaseObserver } = useIntersectionObserver(
	showcaseRef,
	(entries) => {
		if (entries[0]?.isIntersecting) {
			showcaseLoaded.value = true;
			stopShowcaseObserver();
		}
	},
	{ rootMargin: "0px" },
);
</script>
