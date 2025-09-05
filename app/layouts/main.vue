<template>
  <ShadApp
    :toaster="{
      position: 'top-right',
    }"
  >
    <div class="app-layout scrollbar" :class="appName">
      <app-navbar />
      <main class="mx-4 flex flex-grow flex-col items-center sm:mx-auto sm:w-5/6 lg:max-w-5xl xl:max-w-7xl">
        <slot></slot>
      </main>
      <div class="fixed right-4 bottom-4 z-50 flex flex-col space-y-2">
        <scroll-to-top-button />
      </div>
      <app-footer />
    </div>
  </ShadApp>
</template>

<script setup lang="ts">
const appName = inject(ProviderAppNameKey, ref<"wolfstar" | "staryl">("wolfstar"));
</script>

<style scoped>
@reference "@/assets/css/main.css";
.app-layout {
	@apply flex min-h-screen flex-col;
	position: relative;
	background-image: linear-gradient(to top, oklch(var(--color-secondary) / 1) 0%, transparent 70%);
}

.app-layout::before {
	position: absolute;
	inset: 0;
	background-image: radial-gradient(ellipse at 50% 0%, oklch(from var(--color) l c h / 0.2) 0%, transparent 80%);
	background-size: max(100vw, 600px) 50rem;
	background-repeat: no-repeat;
	pointer-events: none;
	content: '';
}
.app-layout.wolfstar {
	--color: var(--color-branding-wolfstar);
}

.app-layout.staryl {
	--color: var(--color-branding-staryl);
}
</style>
