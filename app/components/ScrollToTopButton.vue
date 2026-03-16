<template>
	<UButton
		aria-label="scroll to top button"
		:class="{ 'opacity-100': isScrolling, 'opacity-0': !isScrolling }"
		icon="heroicons-arrow-up"
		color="neutral"
		variant="ghost"
		size="lg"
		class="rounded-full"
		@click="scrollToTop"
	/>
</template>

<script setup lang="ts">
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
