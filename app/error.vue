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


// SEO and meta configuration
useSeoMetadata({
	description: error.statusText || "Something went wrong. Please try again.",
	shouldOgImage: true,
	title: error.status?.toString(),
});
</script>
