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

const { error } = defineProps<{
	error: NuxtError;
}>();

const { t } = useI18n();

const statusCode = computed(() => error.status ?? error.statusCode ?? 500);
const isNotFound = computed(() => statusCode.value === 404);
const isServerError = computed(() => statusCode.value >= 500);

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
