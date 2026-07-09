<template>
	<Section
		labelled-by="home-testimonials-heading"
		spacing="none"
		band
		class="home-testimonials-band home-testimonials py-20 pb-22"
	>
		<SectionHeader
			eyebrow="Loved by mods"
			title="What server owners say."
			heading-id="home-testimonials-heading"
			class="mb-10"
		/>

		<div
			class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-flow-dense lg:auto-rows-[minmax(12.5rem,auto)] lg:grid-cols-4"
		>
			<SurfaceCard
				v-for="testimonial of testimonials"
				:key="testimonial.name"
				tag="figure"
				:class="
					cn(
						'm-0 flex flex-col justify-between',
						testimonial.big
							? 'sm:col-span-2 lg:col-span-2 lg:row-span-2 lg:h-full'
							: undefined,
					)
				"
			>
				<blockquote
					:class="
						cn(
							'leading-relaxed text-base-content',
							testimonial.big ? 'text-[1.375rem] font-medium' : 'text-[15px]',
						)
					"
				>
					"{{ testimonial.quote }}"
				</blockquote>
				<figcaption class="mt-4">
					<div
						:class="
							cn(
								'font-semibold text-base-content',
								testimonial.big ? 'text-[15px]' : 'text-[13px]',
							)
						"
					>
						{{ testimonial.name }}
					</div>
					<div class="text-xs text-muted">{{ testimonial.role }}</div>
				</figcaption>
			</SurfaceCard>
		</div>
	</Section>
</template>

<script setup lang="ts">
import { cn } from "cnfast";

const { testimonials } = defineProps<{
	testimonials: HomeTestimonial[];
}>();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.home-testimonials {
	width: 100vw;
	max-width: 100vw;
	margin-inline: calc(50% - 50vw);
}

.home-testimonials-band {
	background-color: var(--color-base-200);
}
</style>
