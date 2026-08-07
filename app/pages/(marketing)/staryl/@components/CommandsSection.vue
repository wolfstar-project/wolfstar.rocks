<template>
	<Section
		id="staryl-showcase"
		labelled-by="staryl-commands-heading"
		scroll-margin
		spacing="none"
		class="staryl-commands-section pb-24"
	>
		<SectionHeader
			eyebrow="Command flow preview"
			title="A preview of how Staryl will respond."
			description="Staryl is still in development. The commands and responses below are placeholders that demonstrate the interaction, not shipped behaviour."
			heading-id="staryl-commands-heading"
			align="start"
			class="mb-10"
		/>
		<LazyStarylCommandsShowcase />
	</Section>
</template>

<style scoped>
.staryl-commands-section {
	position: relative;
	z-index: 2;
}
</style>
