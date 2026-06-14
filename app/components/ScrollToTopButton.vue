<template>
	<div
		class="shrink-0 overflow-hidden transition-[width,opacity,margin] duration-300 ease-in-out"
		:class="isScrolling ? 'ml-2 w-10 opacity-100' : 'pointer-events-none ml-0 w-0 opacity-0'"
		:aria-hidden="!isScrolling"
	>
		<UButton
			aria-label="scroll to top button"
			icon="heroicons-arrow-up"
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
