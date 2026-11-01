<template>
	<Section
		id="features"
		labelled-by="staryl-features-heading"
		scroll-margin
		spacing="none"
		class="relative pb-24"
	>
		<!-- Below the fold: keep the SSR markup, defer hydration until it scrolls into view. -->
		<LazyStarylNotificationShowcase :hydrate-on-visible="{ rootMargin: '300px' }" />
	</Section>
</template>
