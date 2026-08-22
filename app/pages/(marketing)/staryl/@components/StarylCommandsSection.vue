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
			title="Configure Twitch notifications with Staryl."
			description="Use Staryl’s Twitch subscription commands to send live and offline stream notifications to the right channel."
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
