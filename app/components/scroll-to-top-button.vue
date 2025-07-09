<template>
  <ShadButton
    aria-label="scroll to top button"
    :class="{ 'opacity-100': isScrolling, 'opacity-0': !isScrolling }"
    icon="heroicons-arrow-up"
    color="neutral"
    size="lg"
    variant="ghost"
    :circle="true"
    @click="scrollToTop"
  />
</template>

<script setup lang="ts">
const isScrolling = ref(false)

function scrollToTop() {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  })
}

function handleScroll() {
  isScrolling.value = window.scrollY > 0
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
