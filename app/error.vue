<template>
	<AppProviders
		:toaster="{
			position: 'bottom-left',
		}"
	>
		<NuxtPwaManifest />
		<NuxtRouteAnnouncer />
		<NuxtLayout>
			<StarMain>
				<StarError :error />
			</StarMain>
		</NuxtLayout>
	</AppProviders>
</template>

<script setup lang="ts">
import type { NuxtError } from "nuxt/app";
import {
	isNotFoundStatus,
	isServerErrorStatus,
	resolveErrorStatus,
} from "#shared/utils/error-status";

const { error } = defineProps<{
	error: NuxtError;
}>();

// error.vue replaces the app root on fatal errors — ensure the active locale
// (including the dedicated errors feature file) is loaded before we translate.
const { t, locale, loadLocaleMessages } = useI18n({ useScope: "global" });
await loadLocaleMessages(locale.value);

const statusCode = computed(() => resolveErrorStatus(error));
const isNotFound = computed(() => isNotFoundStatus(statusCode.value));
const isServerError = computed(() => isServerErrorStatus(statusCode.value));

const seoTitle = computed(() => {
	const label = isNotFound.value
		? t("errors.not_found_title")
		: error.statusText || error.statusMessage || t("errors.server_error_title");
	return `${statusCode.value} · ${label}`;
});

const seoDescription = computed(() => {
	if (isNotFound.value) {
		return t("errors.not_found_description");
	}
	if (isServerError.value) {
		return t("errors.server_error");
	}
	return t("errors.generic_description");
});

useRobotsRule(robotBlockingPageProps);

useSeoMetadata({
	description: seoDescription,
	shouldOgImage: true,
	title: seoTitle,
});
</script>
