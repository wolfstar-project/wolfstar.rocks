<template>
	<section class="error-page" aria-labelledby="error-page-title">
		<div class="error-page-glow" aria-hidden="true"></div>

		<div
			class="error-page-badge animate-fade-in-up-safe"
			:class="toneSurfaceClass"
			aria-hidden="true"
		>
			<UIcon :name="icon" class="size-8 sm:size-10" :class="toneIconClass" />
		</div>

		<p
			class="error-page-code animate-fade-in-up-safe gradient-text-hero [animation-delay:0.05s]"
		>
			<span class="sr-only">{{ t("common.error") }}&nbsp;</span>{{ statusCode }}
		</p>

		<h1
			id="error-page-title"
			class="error-page-title animate-fade-in-up-safe text-balance [animation-delay:0.1s]"
		>
			{{ title }}
		</h1>

		<p
			class="error-page-description animate-fade-in-up-safe text-pretty [animation-delay:0.15s]"
		>
			{{ description }}
		</p>

		<p v-if="detail" class="error-page-detail animate-fade-in-up-safe [animation-delay:0.2s]">
			{{ detail }}
		</p>

		<div
			class="mt-10 flex animate-fade-in-up-safe flex-col gap-3 [animation-delay:0.25s] sm:flex-row sm:justify-center"
		>
			<UButton
				v-if="isNotFound"
				size="lg"
				color="primary"
				icon="ph:house-fill"
				class="btn-glow justify-center sm:min-w-45"
				@click="goHome"
			>
				{{ t("errors.back_to_home") }}
			</UButton>
			<template v-else>
				<UButton
					size="lg"
					color="primary"
					icon="ph:arrow-counter-clockwise-bold"
					class="btn-glow justify-center sm:min-w-45"
					:loading="retrying"
					@click="handleRetry"
				>
					{{ t("common.retry") }}
				</UButton>
				<UButton
					size="lg"
					color="neutral"
					variant="outline"
					icon="ph:house-fill"
					class="justify-center sm:min-w-45"
					@click="goHome"
				>
					{{ t("errors.back_to_home") }}
				</UButton>
			</template>
		</div>
	</section>
</template>

<script setup lang="ts">
import type { NuxtError } from "nuxt/app";

const { error } = defineProps<{
	error: NuxtError;
}>();

const { t } = useI18n();
const { goHome, retry } = useErrorActions();

const retrying = ref(false);

// Reads both Nuxt-normalized (`status`) and raw h3 (`statusCode`) shapes so the
// error page stays correct no matter which layer produced the error.
const statusCode = computed(() => error.status ?? error.statusCode ?? 500);
const isNotFound = computed(() => statusCode.value === 404);
const isServerError = computed(() => statusCode.value >= 500);

const title = computed(() => {
	if (isNotFound.value) {
		return t("errors.not_found_title");
	}
	if (isServerError.value) {
		return t("errors.server_error_title");
	}
	return error.statusText || error.statusMessage || t("errors.generic_title");
});

const description = computed(() => {
	if (isNotFound.value) {
		return t("errors.not_found_description");
	}
	if (isServerError.value) {
		return t("errors.server_error");
	}
	return t("errors.generic_description");
});

const detail = computed(() => {
	const message = error.message?.trim();
	if (!message || message === title.value || message === description.value) {
		return undefined;
	}
	return message;
});

const icon = computed(() => {
	if (isNotFound.value) {
		return "ph:compass";
	}
	if (isServerError.value) {
		return "ph:warning-diamond";
	}
	return "ph:warning-circle";
});

const toneIconClass = computed(() => {
	if (isServerError.value) {
		return "text-error";
	}
	if (isNotFound.value) {
		return "text-primary";
	}
	return "text-warning";
});

const toneSurfaceClass = computed(() => {
	if (isServerError.value) {
		return "border-error/30 bg-error/10";
	}
	if (isNotFound.value) {
		return "border-primary/30 bg-primary/10";
	}
	return "border-warning/30 bg-warning/10";
});

async function handleRetry() {
	retrying.value = true;
	await retry();
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.error-page {
	@apply relative isolate flex flex-col items-center justify-center overflow-hidden px-4 py-16 text-center;
	/* Mirrors --ui-header-height set on .app-navbar so the page fills the viewport below the header */
	min-height: calc(100dvh - 5rem);
}

.error-page-glow {
	position: absolute;
	z-index: -1;
	inset: 0;
	background-image: radial-gradient(
		ellipse 42rem 22rem at 50% 32%,
		oklch(from var(--color-primary) l c h / 0.16) 0%,
		transparent 70%
	);
	pointer-events: none;
}

.error-page-badge {
	@apply mb-6 flex size-16 items-center justify-center rounded-full border sm:size-20;
}

.error-page-code {
	@apply text-7xl leading-none font-extrabold tracking-tight sm:text-8xl md:text-9xl;
}

.error-page-title {
	@apply mt-4 text-3xl font-bold text-highlighted sm:text-4xl;
}

.error-page-description {
	@apply mt-4 max-w-xl text-lg text-muted;
}

.error-page-detail {
	@apply mt-6 max-w-full rounded-md border border-default bg-elevated/50 px-3 py-1.5 font-mono text-xs break-all text-muted;
}
</style>
