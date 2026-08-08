<template>
	<Section labelled-by="home-commands-heading" spacing="none" class="commands-section pb-24">
		<SectionHeader
			eyebrow="Try the command flow"
			title="The demo below behaves like Discord."
			description="Type a slash command, move through autocomplete with the keyboard, and submit it to see WolfStar’s response."
			heading-id="home-commands-heading"
			align="start"
			class="mb-10"
		/>
		<LazyWolfstarCommandsShowcase />
	</Section>
</template>

<style scoped>
.commands-section {
	position: relative;
	z-index: 2;
}
</style>
