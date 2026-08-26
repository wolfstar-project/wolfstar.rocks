<template>
	<Section labelled-by="home-commands-heading" spacing="none" class="commands-section pb-24">
		<SectionHeader
			:eyebrow="t('marketing.wolfstar.commands.eyebrow')"
			:title="t('marketing.wolfstar.commands.title')"
			:description="t('marketing.wolfstar.commands.description')"
			heading-id="home-commands-heading"
			align="start"
			class="mb-10"
		/>
		<LazyWolfstarCommandsShowcase />
	</Section>
</template>

<script setup lang="ts">
const { ts: t } = useI18n();
</script>

<style scoped>
.commands-section {
	position: relative;
	z-index: 2;
}
</style>
