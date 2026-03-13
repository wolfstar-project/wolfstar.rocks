<template>
	<UApp
		:toaster="{
			position: 'bottom-left',
		}"
	>
		<nuxt-pwa-manifest />
		<NuxtLayout>
			<UMain>
				<UError :error />
			</UMain>
		</NuxtLayout>
	</UApp>
</template>

<script setup lang="ts">
import type { NuxtError } from "nuxt/app";

const { error } = defineProps<{
	error: NuxtError;
}>();

useSeoMetadata({
	description: error.statusText || "An unexpected error occurred.",
	title: error.status?.toString(),
});
</script>
