<template>
	<Section labelled-by="home-commands-heading" spacing="none" class="commands-section pb-24">
		<SectionHeader
			eyebrow="Commands"
			title="Moderation at your fingertips."
			description="Slash commands with autocomplete, rich options, and instant feedback — right in Discord."
			heading-id="home-commands-heading"
			class="mb-10"
		/>
		<LazyCommandsShowcase />
	</Section>
</template>

<style scoped>
.commands-section {
	position: relative;
	z-index: 2;
}
</style>
