<template>
	<div class="app-layout" :class="appName">
		<a
			href="#maincontent"
			class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-content focus:shadow-lg"
		>
			Skip to main content
		</a>
		<AppHeader />

		<UMain id="maincontent" tabindex="-1" aria-label="Main content">
			<slot></slot>
		</UMain>

		<div class="fixed right-4 bottom-4 z-50 flex flex-col space-y-2">
			<ScrollToTopButton />
		</div>

		<div class="fixed bottom-4 left-4 z-50 flex flex-col space-y-2">
			<PwaPrompt />
		</div>

		<AppFooter />
	</div>
</template>

<script setup lang="ts">
const appName = inject(ProviderAppNameKey, ref<"wolfstar" | "staryl">("wolfstar"));
</script>

<style scoped>
@reference "@/assets/css/main.css";
.app-layout {
	@apply flex min-h-screen flex-col bg-grid-pattern;
	position: relative;
	background-color: var(--color-base-100);
}

.app-layout::before {
	position: absolute;
	z-index: 0;
	inset: 0;
	background-image:
		radial-gradient(
			ellipse at 50% 0%,
			oklch(from var(--color) l c h / 0.15) 0%,
			transparent 80%
		),
		linear-gradient(to bottom, var(--color-base-100) 0%, transparent 20%);
	background-size:
		max(100vw, 600px) 50rem,
		100% 100%;
	background-repeat: no-repeat;
	pointer-events: none;
	content: "";
}
.app-layout.wolfstar {
	--color: var(--color-branding-wolfstar);
}
.app-layout.staryl {
	--color: var(--color-branding-staryl);
}
</style>
