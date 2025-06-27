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
const route = useRoute();
const appName = ref<'wolfstar' | 'staryl'>('wolfstar');
watch(
	router.currentRoute,
	(v) => {
		if (v.path.startsWith('/staryl')) appName.value = 'staryl';
		else appName.value = 'wolfstar';
	},
	{ immediate: true }
);

useHead({
	meta: [{ property: 'og:title', content: `${appName.value} - ${route.meta.title}` }]
});

provide(ProviderAppNameKey, appName);
</script>
