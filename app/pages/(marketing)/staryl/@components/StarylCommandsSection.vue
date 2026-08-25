<template>
	<Section
		id="staryl-showcase"
		labelled-by="staryl-commands-heading"
		scroll-margin
		spacing="none"
		class="staryl-commands-section pb-24"
	>
		<SectionHeader
			:eyebrow="t('marketing.staryl.commands.eyebrow')"
			:title="t('marketing.staryl.commands.title')"
			:description="t('marketing.staryl.commands.description')"
			heading-id="staryl-commands-heading"
			align="start"
			class="mb-10"
		/>
		<LazyStarylCommandsShowcase />
	</Section>
</template>

<script setup lang="ts">
const { t } = useI18n();
</script>

<style scoped>
.staryl-commands-section {
	position: relative;
	z-index: 2;
}
</style>
