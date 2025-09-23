<template>
  <UApp
    :toaster="{
      position: 'bottom-left'
    }"
  >
    <nuxt-pwa-manifest />
    <NuxtLayout>
      <UMain>
        <UError
          :error="error"
        />
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

logger.error(`[${error.statusCode}] ${error.statusMessage}`);

// SEO and meta configuration
useSeoMetadata({
  title: error.statusCode.toString(),
  description: error.statusMessage,
  shouldSeoImage: true,
});
</script>

<style scoped>
@reference '@/assets/css/main.css';

@keyframes blink {
	0%,
	100% {
		opacity: 1;
	}
	50% {
		opacity: 0;
	}
}

@keyframes hang {
	0%,
	100% {
		transform: rotate(15deg) translateY(0);
	}
	50% {
		transform: rotate(-15deg) translateY(-10px);
	}
}

@keyframes pulsebox {
	0%,
	100% {
		box-shadow: 0 0 0 0 #ff5d5b44;
	}
	50% {
		box-shadow: 0 0 16px 4px #ff5d5b88;
	}
}

.animate-blink {
	animation: blink 1s infinite;
}
.animate-hang {
	animation: hang 4s infinite;
}
.animate-pulsebox {
	animation: pulsebox 3s infinite ease-in-out;
}

.perspective-1000 {
	perspective: 1000px;
}
</style>
