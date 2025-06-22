<template>
	<vite-pwa-manifest />
	<nuxt-layout name="main">
		<error-message :error="error" />
		<ShadToaster position="bottom-right" />
	</nuxt-layout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';
import 'vue-sonner/style.css';

const { error } = defineProps<{
	error: NuxtError;
}>();
const router = useRouter();
const appName = ref<'wolfstar' | 'staryl'>('wolfstar');

watch(
	router.currentRoute,
	(v) => {
		if (v.path.startsWith('/staryl')) 
appName.value = 'staryl';
		else appName.value = 'wolfstar';
	},
	{ immediate: true }
);

provide(ProviderAppNameKey, appName);
</script>
