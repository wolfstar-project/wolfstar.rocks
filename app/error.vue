<template>
  <vite-pwa-manifest />
  <div class="relative flex min-h-screen items-center justify-center overflow-hidden font-sans">
    <div class="relative z-10 flex flex-col items-center justify-center w-full max-w-lg p-8 mx-auto text-center rounded-2xl shadow-2 border border-[#ff5d5b]/30">
      <h1 class="mb-4 text-6xl font-extrabold tracking-tight text-[#ff5d5b] drop-shadow-[3px_3px_0px_#2c1810]">
        {{ errorInfo.title }}
      </h1>
      <div class="mb-6 text-lg font-semibold text-[#ffd1d0]">
        <span class="inline-block rounded bg-[#ff5d5b]/10 px-3 py-1 font-mono text-xl font-bold text-[#ff5d5b] border border-[#ff5d5b]/40">
          Error {{ statusCode }}
        </span>
      </div>
      <div class="mb-6 text-2xl leading-relaxed font-medium text-[#ffd1d0]">
        <span>{{ errorInfo.description }}</span>
      </div>
      <div class="relative mx-auto mb-8 w-full max-w-[340px] overflow-hidden rounded-xl border-2 border-dashed border-[#ff5d5b] bg-[#ff5d5b]/10 p-6 animate-pulsebox">
        <div class="absolute left-4 animate-blink font-mono font-bold text-[#ff5d5b]">&gt;</div>
        <div class="pl-6 text-left font-mono text-sm leading-relaxed text-[#ff5d5b]">{{ errorInfo.consoleMessage }}</div>
      </div>
      <div class="perspective-1000 relative mt-4 mb-2 h-32 flex items-center justify-center">
        <span class="relative -top-45 inline-block rotate-180 origin-bottom animate-hang text-8xl select-none">🦇</span>
      </div>
      <div class="mt-4 text-lg font-medium italic">{{ errorInfo.messageHint }}</div>
      <div class="mt-8 w-full bg-base-100/90 backdrop-blur-sm rounded-xl">
        <div class="container mx-auto">
          <div class="flex flex-col justify-center gap-4 border-t border-red-500/20 px-6 py-8 sm:flex-row sm:gap-6">
            <ShadButton
              label="Return Home"
              color="pri"
              leading-icon="mdi:home"
              class="w-full max-w-[250px] flex-1 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl sm:w-auto"
              @click="handleError"
            />
            <ShadButton
              label="Server Support"
              to="https://join.wolfstar.rocks"
              target="_blank"
              external
              variant="outline"
              leading-icon="mdi:forum"
              class="w-full max-w-[250px] flex-1 shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl sm:w-auto"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  <ShadToaster position="bottom-right" />
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

// Props definition
const { error } = defineProps<{
  error: NuxtError;
}>();

// Error state management
const statusCode = computed(() => (error?.statusCode ?? ErrorType.INTERNAL_SERVER) as ErrorType);
const errorInfo = computed(() => errorMessages[statusCode.value] || errorMessages[ErrorType.INTERNAL_SERVER]);

// Navigation handling
const handleError = () => clearError({ redirect: "/" });

// SEO and meta configuration
defineOgImageComponent("NuxtSeo", {
  title: statusCode.value.toString(),
  description: error.statusMessage,
});

useSeoMeta({
  title: statusCode.value.toString(),
  description: error.statusMessage,
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
