<template>
	<div class="dashboard-loader" role="status" aria-live="polite">
		<IconsWolfstar class="dashboard-loader-logo" aria-hidden="true" />
		<p class="text-sm font-semibold text-muted">{{ ts("dashboard.loading") }}</p>
	</div>
</template>

<script setup lang="ts">
const { ts } = useI18n();
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* Covers the whole console on the first entry. It fades in after a short beat,
   so a load that is done at once never flashes it. */
.dashboard-loader {
	@apply absolute inset-0 z-50 flex flex-col items-center justify-center gap-3.5 bg-base-100;
	animation: dashboard-loader-in 0.2s ease-out 0.15s backwards;
}

.dashboard-loader-logo {
	@apply size-16 text-primary;
	animation: dashboard-loader-spin 1.6s linear infinite;
}

.dashboard-loader-leave-active {
	transition: opacity 0.2s ease-out;
}

.dashboard-loader-leave-to {
	opacity: 0;
}

@keyframes dashboard-loader-in {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

@keyframes dashboard-loader-spin {
	to {
		transform: rotate(360deg);
	}
}
</style>
