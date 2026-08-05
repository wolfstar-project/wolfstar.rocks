<template>
	<UApp
		:toaster="{
			position: 'bottom-left',
		}"
	>
		<NuxtPwaManifest />
		<NuxtRouteAnnouncer />
		<NuxtLayout>
			<ErrorPage :error />
		</NuxtLayout>
	</UApp>
</template>

<script setup lang="ts">
import type { NuxtError } from "nuxt/app";
import { isNotFoundStatus, isServerErrorStatus, resolveErrorStatus } from "#shared/utils/error-status";

const { error } = defineProps<{
	error: NuxtError;
}>();

const { t } = useI18n();

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
