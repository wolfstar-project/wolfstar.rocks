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

// Props definition
const { error } = defineProps<{
	error: NuxtError;
}>();

// SEO and meta configuration
useSeoMetadata({
	description: error.statusText || "An unexpected error occurred.",
	shouldOgImage: true,
	title: error.status?.toString(),
});
</script>
