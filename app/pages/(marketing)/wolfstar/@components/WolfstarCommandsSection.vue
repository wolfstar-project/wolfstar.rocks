<template>
	<Section labelled-by="home-commands-heading" spacing="none" class="commands-section pb-24">
		<SectionHeader
			:eyebrow="ts('marketing.wolfstar.commands.eyebrow')"
			:title="ts('marketing.wolfstar.commands.title')"
			:description="ts('marketing.wolfstar.commands.description')"
			heading-id="home-commands-heading"
			align="start"
			class="mb-10"
		/>
		<LazyWolfstarCommandsShowcase />
	</Section>
</template>

<script setup lang="ts">
const { ts } = useI18n();
</script>

<style scoped>
.commands-section {
	position: relative;
	z-index: 2;
}
</style>
