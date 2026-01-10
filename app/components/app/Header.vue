<!-- eslint-disable vue/no-template-shadow vue/no-unused-refs -->
<template>
  <UHeader
    ref="navbar"
    class="app-navbar"
    as="header"
    role="banner"
    :ui=" y > 100 ? {
      root: 'bg-base-200/80 backdrop-blur-sm'

    } : undefined"
  >
    <template #left>
      <HeaderLogo />
    </template>

    <nav aria-label="Main navigation">
      <UNavigationMenu
        :items="desktopLinks"
        variant="link"
        class="hidden lg:inline-flex"
      />
    </nav>

    <template #right>
      <HeaderRight />
    </template>
    <template #body>
      <HeaderBody />
    </template>
  </UHeader>
</template>

<script setup lang="ts">
const navbar = ref<HTMLElement | null>(null);
const { y } = useScroll(navbar);
const { desktopLinks } = useHeader();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.app-navbar {
	align-self: center;
	transition-duration: 250ms;
	transition-property: background-color;
	transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	width: calc(100% - 1rem);
}
</style>
