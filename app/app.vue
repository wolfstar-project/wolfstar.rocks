<template>
	<vite-pwa-manifest />
	<nuxt-loading-indicator color="bg-neutral" />
	<nuxt-layout name="main">
		<nuxt-page />
		<ShadToaster position="bottom-right" />
	</nuxt-layout>
</template>

<script setup lang="ts">
import 'vue-sonner/style.css';

const router = useRouter();
const appName = ref<'wolfstar' | 'staryl'>('wolfstar');

// Watch for route changes to update appName
watch(
	router.currentRoute,
	(route) => {
		switch (route.path) {
			case '/staryl':
				appName.value = 'staryl';
				break;
			default:
				appName.value = 'wolfstar';
		}
	},
	{ immediate: true }
);

useSeoMeta({
	title: appName.value
});

provide(ProviderAppNameKey, appName);
</script>
