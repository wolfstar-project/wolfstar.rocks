<template>
  <UHeader
    class="app-navbar card-glass"
    as="header"
    role="banner"
    :ui="{
      root: 'rounded-full px-6 py-2',
    }"
  >
    <template #left>
      <HeaderLogo class="mr-4" />
    </template>

    <nav aria-label="Main navigation">
      <UNavigationMenu
        :items="desktopLinks"
        variant="link"
        class="hidden lg:inline-flex"
        :ui="{
          link: 'text-base-content/80 hover:text-base-content/100',
          root: 'text-base-content/70',
        }"
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
const { desktopLinks } = useHeader();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.app-navbar {
	position: relative; /* Ensure pseudo-element is positioned relative to this */
	backdrop-filter: blur(16px);
	-webkit-backdrop-filter: blur(16px);
	transition: all 0.3s ease;
	box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
	border-right: 1px solid oklch(100% 0 0 / 0.1);
	border-right: 1px solid oklch(0% 0 0 / 0.05);
	/* border-bottom removed, handled by ::after */
	border-left: 1px solid oklch(100% 0 0 / 0.1);
	border-left: 1px solid oklch(0% 0 0 / 0.05);
	background: oklch(20% 0 0 / 0.6);
	width: min(calc(100% - 2rem), var(--container-7xl));
}

.app-navbar::after {
	position: absolute;
	right: 0;
	bottom: 0;
	left: 0;
	/* Start border after ~230px (Logo width + padding) */
	background: linear-gradient(to right, transparent 230px, oklch(100% 0 0 / 0.1) 230px);
	height: 1px;
	pointer-events: none;
	content: '';
}

.branding-container {
	display: inline-flex;
	align-items: center;
	margin-bottom: -0.5rem; /* Align with bottom of navbar */
	/* border-bottom removed from here if it was conflicting or needed removal */
	border-bottom: 1px solid oklch(100% 0 0 / 0.1); /* Keep or remove? The user request is about the main border. */
	padding-bottom: 0.5rem;
}

[data-theme='light'] .app-navbar {
	border-color: oklch(0% 0 0 / 0.05);
	background: oklch(98% 0 0 / 0.6);
}

[data-theme='light'] .app-navbar::after {
	background: linear-gradient(to right, transparent 230px, oklch(0% 0 0 / 0.05) 230px);
}

[data-theme='light'] .branding-container {
	border-bottom-color: oklch(0% 0 0 / 0.1);
}
</style>
