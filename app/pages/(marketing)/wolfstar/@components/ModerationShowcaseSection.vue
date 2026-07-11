<template>
	<Section
		id="showcase"
		labelled-by="home-showcase-heading"
		scroll-margin
		spacing="none"
		class="showcase-section pb-24"
	>
		<LazyModerationLogsShowcase />

		<div class="mt-12">
			<ClientOnly>
				<LazyModerationShowcase :active-feature="1" />
				<template #fallback>
					<div class="mx-auto min-h-100 w-full max-w-250" aria-hidden="true" />
				</template>
			</ClientOnly>
		</div>
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
