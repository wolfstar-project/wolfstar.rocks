<!-- eslint-disable vue/no-template-shadow vue/no-unused-refs -->
<template>
  <UHeader
    is="div"
    ref="navbar"
    class="app-navbar"
    :ui="{
      root: {
        'bg-base-200/80 backdrop-blur-sm': y > 100,
        'bg-transparent': y <= 100,
      }
    }"
  >
    <template #title>
      <HeaderLogo />
    </template>

    <div class="navbar-center">
      <UNavigationMenu
        :items="desktopLinks"
        variant="link"
        class="hidden lg:inline-flex"
      />
    </div>

    <template #right>
      <HeaderRight />
    </template>
    <template #body>
      <UNavigationMenu :items="mobileLinks" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>

<script setup lang="ts">
const { y } = useScroll(document);
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
