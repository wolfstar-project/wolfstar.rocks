<template>
	<spotlight-card from="rgba(255,255,255,0.1)" :size="300" mode="before">
		<sections-app-navbar />
		<main class="mx-4 flex flex-grow flex-col items-center sm:mx-auto sm:w-5/6 lg:max-w-5xl xl:max-w-7xl">
			<slot></slot>
		</main>

		<sections-app-footer />

		<div class="join">
			<layout-change-theme class="join-item" />
			<layout-scroll-to-top-button class="join-item" />
		</div>
	</spotlight-card>
</template>

<style scoped>
.app-layout {
	@apply flex min-h-screen flex-col;
	background-image:
		linear-gradient(to top in oklch, oklch(var(--color-base-100) / 1) 0%, transparent 70%),
		radial-gradient(ellipse at calc(100vw * 0.5) 0% in oklch, oklch(var(--color) / 0.2), transparent 80%);
	background-size: max(100vw, 600px) 50rem;
	background-repeat: no-repeat;
}

.app-layout.wolfstar {
	--color: var(--color-branding-wolfstar);
}
</style>
