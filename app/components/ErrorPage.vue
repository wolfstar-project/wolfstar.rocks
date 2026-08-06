<template>
	<UError as="section" :error :clear="false" aria-labelledby="error-page-title" :ui>
		<template #leading>
			<UBadge
				:color="toneColor"
				variant="subtle"
				size="xl"
				square
				:icon
				aria-hidden="true"
				:ui="{
					base: 'size-16 sm:size-20 rounded-full justify-center',
					leadingIcon: 'size-8 sm:size-10',
				}"
			/>
		</template>

		<template #statusCode>
			<span class="sr-only">{{ t("common.error") }}&nbsp;</span>{{ status }}
		</template>

		<template #statusMessage>
			<span id="error-page-title">{{ title }}</span>
		</template>

		<template #message>
			<span class="block">{{ description }}</span>
			<UBadge
				v-if="detail"
				color="neutral"
				variant="subtle"
				size="md"
				:label="detail"
				class="mt-6 max-w-full"
				:ui="{
					base: 'h-auto max-w-full whitespace-normal py-1.5 font-mono',
					label: 'whitespace-normal break-all',
				}"
			/>
		</template>

		<template #links>
			<UButton
				v-if="isNotFound"
				size="lg"
				color="primary"
				icon="ph:house-fill"
				class="btn-glow justify-center sm:min-w-45"
				:label="t('errors.back_to_home')"
				@click="goHome"
			/>
			<template v-else>
				<UButton
					size="lg"
					color="primary"
					icon="ph:arrow-counter-clockwise-bold"
					class="btn-glow justify-center sm:min-w-45"
					:label="t('common.retry')"
					loading-auto
					@click="retry"
				/>
				<UButton
					size="lg"
					color="neutral"
					variant="outline"
					icon="ph:house-fill"
					class="justify-center sm:min-w-45"
					:label="t('errors.back_to_home')"
					@click="goHome"
				/>
			</template>
		</template>
	</UError>
</template>

<script setup lang="ts">
import type { NuxtError } from "nuxt/app";
import {
	isNotFoundStatus,
	isServerErrorStatus,
	resolveErrorStatus,
} from "#shared/utils/error-status";

const { error: errorRaw } = defineProps<{
	error: NuxtError;
}>();

const { t } = useI18n();

const status = computed(() => resolveErrorStatus(errorRaw));
const isNotFound = computed(() => isNotFoundStatus(status.value));
const isServerError = computed(() => isServerErrorStatus(status.value));

const title = computed(() => {
	if (isNotFound.value) {
		return t("errors.not_found_title");
	}
	if (isServerError.value) {
		return t("errors.server_error_title");
	}
	return errorRaw.statusText || errorRaw.statusMessage || t("errors.generic_title");
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
	// 404 already has friendly copy; Nuxt's default message is just the missing path.
	if (isNotFound.value) {
		return undefined;
	}
	// Server errors may carry raw internal messages (stack traces, DB errors, etc.);
	// surface them only in development — hide in production / CI.
	if (isServerError.value && !import.meta.dev) {
		return undefined;
	}
	const message = errorRaw.message?.trim();
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

const toneColor = computed(() => {
	if (isServerError.value) {
		return "error" as const;
	}
	if (isNotFound.value) {
		return "primary" as const;
	}
	return "warning" as const;
});

// Shaped for UError's built-in field checks; slots override the visible copy.
const error = computed(() => ({
	status: status.value,
	statusMessage: title.value,
	message: description.value,
}));

const ui = computed(() => ({
	// Mirrors --ui-header-height set on .app-navbar (variable is not inherited by siblings).
	root: "min-h-[calc(100dvh-5rem)] px-4 py-16",
	leading: "mb-6",
	status: "text-7xl leading-none font-extrabold tracking-tight gradient-text-hero sm:text-8xl md:text-9xl",
	statusMessage: "mt-4 text-3xl font-bold text-highlighted text-balance sm:text-4xl",
	message: "mt-4 max-w-xl text-lg text-pretty text-muted",
	links: "mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center",
}));

const { goHome, retry } = useErrorActions();
</script>
