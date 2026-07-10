<template>
	<Section
		id="showcase"
		labelled-by="home-showcase-heading"
		scroll-margin
		spacing="none"
		class="showcase-section pb-24"
	>
		<LazyModerationLogsShowcase />

		<SectionHeader
			eyebrow="Logging"
			title="Advanced Logging"
			description="WolfStar not only comes with a very complete moderation suite, but also advanced logging capabilities to keep track of everything that happens in your server."
			heading-id="home-logging-showcase-heading"
			class="mt-12 mb-10"
		/>

		<ClientOnly>
			<LazyModerationShowcase :active-feature="1" />
			<template #fallback>
				<div class="mx-auto min-h-100 w-full max-w-250" aria-hidden="true" />
			</template>
		</ClientOnly>
	</Section>
</template>

<style scoped>
@reference "@/assets/css/main.css";

.showcase-section {
	position: relative;
	z-index: 1;
	isolation: isolate;
	background-color: var(--color-base-100);
}
</style>
