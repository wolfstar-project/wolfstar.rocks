<template>
	<Section
		id="showcase"
		labelled-by="home-showcase-heading"
		scroll-margin
		spacing="none"
		class="pb-24"
	>
		<SectionHeader
			eyebrow="In Action"
			title="Moderation that shows its work."
			description="Every action WolfStar takes is visible in the channel, and logged for later."
			heading-id="home-showcase-heading"
			class="mb-10"
		/>

		<ClientOnly>
			<LazyModerationShowcase hide-feature-header show-moderation-logs />
			<LazyModerationShowcase hide-feature-header :active-feature="1" class="mt-12" />
			<template #fallback>
				<div class="mx-auto min-h-200 w-full max-w-250" aria-hidden="true" />
			</template>
		</ClientOnly>
	</Section>
</template>
