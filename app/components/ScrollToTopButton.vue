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
    top: 0,
    left: 0,
    behavior: "smooth",
  });
}

function handleScroll() {
  isScrolling.value = window.scrollY > 0;
}

useEventListener("scroll", handleScroll);
</script>
