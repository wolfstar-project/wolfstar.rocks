<template>
	<div
		class="ease-in-out flex shrink-0 items-center justify-center overflow-hidden transition-[width,opacity,margin] duration-300"
		:class="isScrolling ? 'ml-2 w-12 opacity-100' : 'ml-0 w-0 pointer-events-none opacity-0'"
		:aria-hidden="!isScrolling"
	>
		<StarButton
			:aria-label="t('a11y.scroll_to_top')"
			icon="heroicons:arrow-up"
			color="neutral"
			variant="ghost"
			size="lg"
			class="rounded-full"
			:tabindex="isScrolling ? 0 : -1"
			@click="scrollToTop"
		/>
	</div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const isScrolling = ref(false);

function scrollToTop() {
	window.scrollTo({
		behavior: "smooth",
		left: 0,
		top: 0,
	});
}

function handleScroll() {
	isScrolling.value = window.scrollY > 0;
}

useEventListener("scroll", handleScroll, { passive: true });
</script>
