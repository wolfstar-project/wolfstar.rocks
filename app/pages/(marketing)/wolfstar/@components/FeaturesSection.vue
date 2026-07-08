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
	</Section>
</template>

<script setup lang="ts">
import { cn } from "cnfast";

defineProps<{
	features: HomeFeature[];
}>();
</script>
