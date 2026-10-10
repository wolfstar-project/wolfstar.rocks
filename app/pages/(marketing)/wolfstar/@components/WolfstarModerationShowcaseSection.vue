<template>
	<Section
		id="features"
		labelled-by="home-showcase-heading"
		scroll-margin
		spacing="none"
		class="showcase-section pb-24"
	>
		<!-- Below the fold and ~1k lines of interactive demo: keep the SSR markup, defer hydration until it scrolls into view. -->
		<LazyWolfstarModerationShowcase hydrate-on-visible />
	</Section>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.showcase-section {
	position: relative;
}
</style>
