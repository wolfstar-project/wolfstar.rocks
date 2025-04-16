<template>
	<vite-pwa-manifest />
	<nuxt-loading-indicator color="bg-netrual" />
	<nuxt-layout name="main">
		<error-message :error="error" />
		<ClientOnly>
			<ShadToaster position="bottom-right" />
		</ClientOnly>
	</nuxt-layout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';

const router = useRouter();
const appName = ref<'wolfstar' | 'staryl'>('wolfstar');

const { error } = defineProps<{
	error: NuxtError;
}>();

watch(
	router.currentRoute,
	(v) => {
		if (v.path.startsWith('/staryl')) appName.value = 'staryl';
		else appName.value = 'wolfstar';
	},
	{ immediate: true }
);

provide(ProviderAppNameKey, appName);
</script>
