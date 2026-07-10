<template>
	<Section
		id="showcase"
		labelled-by="home-showcase-heading"
		scroll-margin
		spacing="none"
		class="showcase-section pb-24"
	>
		<SectionHeader
			eyebrow="In Action"
			title="Moderation that shows its work."
			description="Every action WolfStar takes is visible in the channel, and logged for later."
			heading-id="home-showcase-heading"
			class="mb-10"
		/>

		<ClientOnly>
			<LazyModerationLogsShowcase hide-feature-header />
			<template #fallback>
				<div class="mx-auto min-h-100 w-full max-w-250" aria-hidden="true" />
			</template>
		</ClientOnly>

		<SectionHeader
			eyebrow="Logging"
			title="Advanced Logging"
			description="WolfStar not only comes with a very complete moderation suite, but also advanced logging capabilities to keep track of everything that happens in your server."
			heading-id="home-logging-showcase-heading"
			class="mt-12 mb-10"
		/>

		<ClientOnly>
			<LazyModerationShowcase hide-feature-header :active-feature="1" />
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
