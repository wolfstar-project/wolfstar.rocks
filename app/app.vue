<template>
	<vite-pwa-manifest />
	<nuxt-loading-indicator color="bg-netrual" />
	<nuxt-layout name="main">
		<nuxt-page />
		<ClientOnly>
			<ShadToaster position="bottom-right" />
		</ClientOnly>
	</nuxt-layout>
</template>

<script setup lang="ts">
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
