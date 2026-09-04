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
import {
	isNotFoundStatus,
	isServerErrorStatus,
	resolveErrorStatus,
} from "#shared/utils/error-status";

const { error } = defineProps<{
	error: NuxtError;
}>();

// error.vue replaces the app root on fatal errors. Nuxt I18n Micro loads the
// whole locale as one global bundle in its own plugin, so the `errors` messages
// are already resolvable here — there is no per-route chunk left to await.
const { ts } = useI18n();

const statusCode = computed(() => resolveErrorStatus(error));
const isNotFound = computed(() => isNotFoundStatus(statusCode.value));
const isServerError = computed(() => isServerErrorStatus(statusCode.value));

const seoTitle = computed(() => {
	const label = isNotFound.value
		? ts("errors.not_found_title")
		: error.statusText || error.statusMessage || ts("errors.server_error_title");
	return `${statusCode.value} · ${label}`;
});

const seoDescription = computed(() => {
	if (isNotFound.value) {
		return ts("errors.not_found_description");
	}
	if (isServerError.value) {
		return ts("errors.server_error");
	}
	return ts("errors.generic_description");
});

useRobotsRule(robotBlockingPageProps);

useSeoMetadata({
	description: seoDescription,
	shouldOgImage: true,
	title: seoTitle,
});
</script>
