<template>
	<div class="app-layout" :class="appName">
		<sections-app-navbar />
		<main class="mx-4 flex flex-grow flex-col items-center sm:mx-auto sm:w-5/6 lg:max-w-5xl xl:max-w-7xl">
			<slot></slot>
		</main>
		<div class="fixed right-4 bottom-4 z-50 flex space-x-2">
			<layout-scroll-to-top-button />
		</div>
		<sections-app-footer />
	</div>
</template>

<script setup lang="ts">
const appName = inject(ProviderAppNameKey)!;
</script>

<style scoped>
@reference "@/assets/css/main.css";
.app-layout {
	@apply flex min-h-screen flex-col;
	background-image:
		linear-gradient(to top, oklch(var(--color-primary) / 1) 0%, transparent 70%),
		radial-gradient(ellipse at 50% 0%, oklch(var(--color) / 0.2) 0%, transparent 80%);
	background-size: max(100vw, 600px) 50rem;
	background-repeat: no-repeat;
}

.app-layout.wolfstar {
	--color: var(--color-branding-wolfstar);
}
</style>
