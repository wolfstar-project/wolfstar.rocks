<template>
	<div class="app-layout" :class="appName">
		<a
			href="#maincontent"
			class="focus:top-4 focus:left-4 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-content focus:shadow-lg sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:outline focus:outline-2 focus:outline-transparent"
		>
			Skip to main content
		</a>
		<AppHeader />

		<StarMain id="maincontent" tabindex="-1" aria-label="Main content">
			<slot></slot>
		</StarMain>

		<ClientOnly>
			<DeferredMount>
				<div class="right-4 bottom-4 fixed z-50 flex items-center justify-end">
					<LazyFeedbackButton />
					<LazyScrollToTopButton />
				</div>
			</DeferredMount>
		</ClientOnly>

		<ClientOnly>
			<DeferredMount>
				<div class="bottom-4 left-4 space-y-2 fixed z-50 flex flex-col">
					<LazyPwaPrompt />
				</div>
			</DeferredMount>
		</ClientOnly>

		<AppFooter />
	</div>
</template>

<script setup lang="ts">
const appName = inject(ProviderAppNameKey, ref<"wolfstar" | "staryl">("wolfstar"));
</script>

<style scoped>
.app-layout {
	@apply flex min-h-screen flex-col;
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
			oklch(from var(--color) l c h / 0.2) 0%,
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
	--color: var(--color-primary);
}
.app-layout.staryl {
	--color: var(--color-branding-staryl);
}
</style>
