<template>
	<ShadButton
		aria-label="scroll to top button"
		:class="{ 'opacity-100': isScrolling, 'opacity-0': !isScrolling }"
		icon="heroicons-arrow-up"
		color="neutral"
		variant="ghost"
		@click="scrollToTop"
	/>
</template>

<script setup lang="ts">
const isScrolling = ref(false);

onMounted(() => {
	window.addEventListener('scroll', () => {
		isScrolling.value = window.scrollY > 0;
	});
});

function scrollToTop() {
	window.scrollTo({
		top: 0,
		behavior: 'smooth'
	});
}
</script>
