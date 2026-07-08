<template>
	<Section
		labelled-by="home-testimonials-heading"
		spacing="none"
		band
		class="home-testimonials-band py-20 pb-22"
	>
		<SectionHeader
			eyebrow="Loved by mods"
			title="What server owners say."
			heading-id="home-testimonials-heading"
			class="mb-10"
		/>

		<div class="grid grid-cols-1 gap-5 md:grid-cols-3">
			<SurfaceCard
				v-for="quote of testimonials"
				:key="quote.name"
				tag="figure"
				class="m-0 flex flex-col"
			>
				<blockquote class="flex-1 text-[15px] leading-relaxed text-base-content">
					"{{ quote.quote }}"
				</blockquote>
				<figcaption class="mt-4">
					<div class="text-[13px] font-semibold text-base-content">{{ quote.name }}</div>
					<div class="text-xs text-muted">{{ quote.role }}</div>
				</figcaption>
			</SurfaceCard>
		</div>
	</Section>
</template>

<script setup lang="ts">
const { testimonials } = defineProps<{
	testimonials: HomeTestimonial[];
}>();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.home-testimonials-band {
	background-color: var(--color-base-200);
}
</style>
