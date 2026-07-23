<template>
	<Section
		id="features"
		labelled-by="home-features-heading"
		scroll-margin
		spacing="none"
		class="pb-24"
	>
		<SectionHeader
			eyebrow="Features"
			title="And more than moderation."
			heading-id="home-features-heading"
			class="mb-12"
		/>

		<div
			class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-flow-dense lg:auto-rows-[minmax(12.5rem,auto)] lg:grid-cols-4"
		>
			<SurfaceCard
				v-for="feature of features"
				:key="feature.title"
				tag="article"
				:accent="feature.big ? feature.accent : undefined"
				:class="
					cn(
						'flex flex-col',
						feature.big
							? 'justify-between sm:col-span-2 lg:col-span-2 lg:row-span-2 lg:h-full'
							: 'justify-start',
					)
				"
			>
				<div>
					<div
						:class="
							cn(
								'flex items-center justify-center bg-primary/10',
								feature.big ? 'mb-5 size-14 rounded-lg' : 'mb-3 size-8 rounded-md',
							)
						"
					>
						<UIcon
							:name="feature.icon"
							:class="feature.big ? 'h-7 w-7 text-primary' : 'h-4 w-4 text-primary'"
							aria-hidden="true"
						/>
					</div>
					<h3
						:class="
							cn(
								'text-base-content',
								feature.big
									? 'text-[1.375rem] font-bold'
									: 'text-[15px] font-semibold',
							)
						"
					>
						{{ feature.title }}
					</h3>
					<p
						:class="
							cn(
								'mt-2 leading-relaxed text-base-content/60',
								feature.big ? 'text-[15px]' : 'text-[13px]',
							)
						"
					>
						{{ feature.description }}
					</p>
				</div>
				<div v-if="feature.big" class="mt-5 flex flex-wrap gap-2">
					<span class="badge badge-soft badge-error">Bad Words</span>
					<span class="badge badge-soft badge-warning">Capitals</span>
					<span class="badge badge-soft badge-primary">Invites</span>
					<span class="badge badge-soft badge-info">Links</span>
					<span class="badge badge-soft badge-secondary">Spam</span>
					<span class="badge badge-soft badge-accent">Line Spam</span>
					<span class="badge badge-soft badge-success">Reactions</span>
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
