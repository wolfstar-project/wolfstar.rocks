<!-- eslint-disable vue/no-template-shadow vue/no-unused-refs -->
<template>
  <UHeader
    ref="navbar"
    class="app-navbar"
    as="div"
    :ui="{
      root: {
        'bg-base-200/80 backdrop-blur-sm': y > 100
      }
    }"
  >
    <template #left>
      <HeaderLogo class="navbar-start" />
    </template>

    <div class="navbar-center">
      <UNavigationMenu
        :items="desktopLinks"
        variant="link"
        class="hidden lg:inline-flex"
      />
    </div>

    <template #right>
      <HeaderRight class="navbar-end" />
    </template>
    <template #body>
      <UNavigationMenu :items="mobileLinks" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>

<script setup lang="ts">
const navbar = ref<HTMLElement | null>(null);
const { y } = useScroll(navbar);
const { desktopLinks, mobileLinks } = useHeader();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.app-navbar {
	@apply navbar sticky top-2 z-50 rounded-xl drop-shadow-lg;
	align-self: center;
	transition-duration: 250ms;
	transition-property: background-color;
	transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	width: calc(100% - 1rem);
}
</style>
