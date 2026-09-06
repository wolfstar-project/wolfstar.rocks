<template>
	<Section
		id="staryl-showcase"
		labelled-by="staryl-commands-heading"
		scroll-margin
		spacing="none"
		class="staryl-commands-section pb-24"
	>
		<SectionHeader
			:eyebrow="ts('marketing.staryl.commands.eyebrow')"
			:title="ts('marketing.staryl.commands.title')"
			:description="ts('marketing.staryl.commands.description')"
			heading-id="staryl-commands-heading"
			align="start"
			class="mb-10"
		/>
		<LazyStarylCommandsShowcase />
	</Section>
</template>

<script setup lang="ts">
const { ts } = useI18n();
</script>

<style scoped>
.staryl-commands-section {
	position: relative;
	z-index: 2;
}
</style>
