<template>
	<vite-pwa-manifest />
	<nuxt-layout name="main">
		<!-- Unauthorized Error Layout -->
		<div
			v-if="error.statusCode === ErrorType.UNAUTHORIZED"
			class="relative flex min-h-screen items-center justify-center overflow-hidden overflow-y-auto bg-base-100 font-sans"
		>
			<div
				class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,93,91,0.1)_0%,rgba(26,26,26,0)_70%)]"
			></div>

			<div class="relative z-10 container max-w-[600px] p-8 text-center">
				<h1
					class="mb-6 text-2xl font-extrabold tracking-tight text-[#ff5d5b] drop-shadow-[2px_2px_0px_#2c1810] md:text-5xl md:drop-shadow-[3px_3px_0px_#2c1810]"
				>
					{{ errorInfo.title }}
				</h1>

				<div class="mb-8 text-2xl leading-relaxed font-medium text-[#ffd1d0]">
					<span class="inline-block rounded-md bg-[#ff5d5b]/10 px-2 py-1 font-mono text-lg font-bold text-[#ff5d5b]">
						Error {{ statusCode }}
					</span>
					<br />
					<span>{{ errorInfo.description }}</span>
				</div>

				<div
					class="relative mx-auto mb-6 max-w-[320px] overflow-hidden rounded-xl border-2 border-dashed border-[#ff5d5b] bg-[#ff5d5b]/10 p-6"
				>
					<div class="absolute left-4 animate-[blink_1s_infinite] font-mono font-bold text-[#ff5d5b]">></div>
					<pre class="pl-6 text-left font-mono text-sm leading-relaxed text-[#ff5d5b]">{{ errorInfo.consoleMessage }}</pre>
				</div>

				<div
					class="relative mx-auto mb-8 max-w-[320px] overflow-hidden rounded-xl border-2 border-dashed border-[#ff5d5b] bg-[#ff5d5b]/10 p-6"
				>
					<div class="flex justify-around gap-4">
						<span class="inline-block rounded-md bg-[#ff5d5b]/10 px-4 py-2 text-2xl text-[#ff5d5b]">🔑</span>
						<span class="inline-block rounded-md bg-[#ff5d5b]/10 px-4 py-2 text-2xl text-[#ff5d5b]">🎟️</span>
					</div>
				</div>

				<div class="perspective-1000 relative mt-8 inline-block h-32">
					<div class="flex items-center gap-4">
						<span class="animate-[tilt_3s_infinite] text-6xl">🐁</span>
						<span class="origin-bottom-left animate-[inspect_3s_infinite] text-3xl">🔍</span>
					</div>
				</div>

				<div class="mt-8 text-xl font-medium text-gray-400 italic">{{ errorUnauthorized.messageHint }}</div>

				<div class="fixed right-0 bottom-0 left-0 bg-base-100/80 backdrop-blur-sm">
					<div class="container mx-auto">
						<div class="flex flex-col justify-center gap-6 border-t border-red-500/20 px-4 py-6 sm:flex-row">
							<button
								class="btn w-full flex-1 items-center justify-center gap-2 px-3 text-sm shadow-lg transition-transform duration-200 btn-error hover:scale-105 hover:shadow-xl sm:max-w-[200px] md:px-4 md:text-base"
								@click="handleReturnHome"
							>
								<ShadIcon name="mdi:home" class="size-5" />
								Return Home
							</button>
							<a
								href="https://join.wolfstar.rocks"
								target="_blank"
								rel="noopener noreferrer"
								class="btn w-full flex-1 items-center justify-center gap-2 px-3 text-sm shadow-lg transition-transform duration-200 btn-outline hover:scale-105 hover:bg-[#ff5d5b]/10 hover:shadow-xl sm:max-w-[200px] md:px-4 md:text-base"
							>
								<ShadIcon name="mdi:forum" class="size-5" />
								Server Support
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- General Error Layout -->
		<div v-else class="relative flex min-h-screen items-center justify-center overflow-hidden overflow-y-auto bg-base-100 font-sans">
			<div
				class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,93,91,0.1)_0%,rgba(26,26,26,0)_70%)]"
			></div>
			<div class="relative z-10 container max-w-[600px] p-8 text-center">
				<h1 class="mb-6 text-5xl font-extrabold tracking-tight text-[#ff5d5b] drop-shadow-[3px_3px_0px_#2c1810]">
					{{ errorInfo.title }}
				</h1>
				<div class="mb-8 text-2xl leading-relaxed font-medium text-[#ffd1d0]">
					<span class="inline-block rounded-md bg-[#ff5d5b]/10 px-2 py-1 font-mono text-lg font-bold text-[#ff5d5b]">
						Error {{ statusCode }}
					</span>
					<br />
					<span>{{ errorInfo.description }}</span>
				</div>

				<div
					class="relative mx-auto mb-8 max-w-[320px] overflow-hidden rounded-xl border-2 border-dashed border-[#ff5d5b] bg-[#ff5d5b]/10 p-6"
				>
					<div class="absolute left-4 animate-[blink_1s_infinite] font-mono font-bold text-[#ff5d5b]">></div>
					<pre class="pl-6 text-left font-mono text-sm leading-relaxed text-[#ff5d5b]">{{ errorInfo.consoleMessage || error.message }}</pre>
				</div>

				<div class="perspective-1000 relative mt-8 inline-block h-32">
					<span class="relative -top-[200%] inline-block origin-bottom animate-[hang_4s_infinite] text-8xl">🦇</span>
				</div>

				<div class="mt-8 text-xl font-medium text-gray-400 italic">{{ errorInfo.messageHint }}</div>

				<div class="fixed right-0 bottom-0 left-0 bg-base-100/80 backdrop-blur-sm">
					<div class="container mx-auto">
						<div class="flex justify-center gap-6 border-t border-red-500/20 px-4 py-6">
							<button
								class="btn flex max-w-[200px] flex-1 items-center justify-center gap-2 shadow-lg transition-transform duration-200 btn-error hover:scale-105 hover:shadow-xl"
								@click="handleReturnHome"
							>
								<ShadIcon name="mdi:home" class="size-5" />
								Return Home
							</button>
							<a
								href="https://join.wolfstar.rocks"
								target="_blank"
								rel="noopener noreferrer"
								class="btn flex max-w-[200px] flex-1 items-center justify-center gap-2 shadow-lg transition-transform duration-200 btn-outline hover:scale-105 hover:bg-[#ff5d5b]/10 hover:shadow-xl"
							>
								<ShadIcon name="mdi:forum" class="size-5" />
								Server Support
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>

		<ShadToaster position="bottom-right" />
	</nuxt-layout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';
import 'vue-sonner/style.css';

// Props definition
const { error } = defineProps<{
	error: NuxtError;
}>();

// Error state management
const statusCode = computed(() => (error?.statusCode ?? ErrorType.INTERNAL_SERVER) as ErrorType);
const errorInfo = computed(() => errorMessages[statusCode.value] || errorMessages[ErrorType.INTERNAL_SERVER]);
const errorUnauthorized = computed(() => errorMessages[ErrorType.UNAUTHORIZED]);

// Navigation handling
function handleReturnHome() {
	clearError({ redirect: '/' });
}

// SEO and meta configuration
defineOgImageComponent('NuxtSeo', {
	title: statusCode.value.toString(),
	description: error.statusMessage
});

useSeoMeta({
	title: statusCode.value.toString(),
	description: error.statusMessage
});

// App name provider for layout consistency
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

// Provide appName for child components
provide(ProviderAppNameKey, appName);
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

@keyframes tilt {
  0%,
  100% {
    transform: rotate(-5deg) scale(1);
  }
  50% {
    transform: rotate(5deg) scale(1.05);
  }
}

@keyframes inspect {
  0%,
  100% {
    transform: rotate(-15deg) scale(1);
  }
  50% {
    transform: rotate(0deg) scale(1.1);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.02);
    opacity: 0.9;
  }
}

.relative.mx-auto.max-w-\[320px\] {
  animation: pulse 3s infinite ease-in-out;
}

.perspective-1000 {
  perspective: 1000px;
}
</style>
