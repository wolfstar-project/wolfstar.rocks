<template>
	<Head>
		<Title>Error {{ error.statusCode ?? 501 }}</Title>
		<Meta name="description" content="An error occurred" />
	</Head>
	<div class="relative flex min-h-screen items-center justify-center overflow-hidden text-white">
		<div class="bg-gradient-radial pointer-events-none absolute inset-0 from-red-500/10 to-transparent"></div>

		<div class="relative z-10 container mx-auto max-w-2xl p-8 text-center">
			<h1 class="mb-6 text-5xl font-extrabold tracking-tight text-red-500 drop-shadow-[3px_3px_0px_#2c1810] md:text-6xl">
				{{ errorInfo.title }}
			</h1>

			<div class="mb-8 text-2xl leading-relaxed font-medium text-red-100">
				<div class="badge badge-error badge-lg gap-2">
					<span class="font-mono font-bold">Error {{ statusCode }}</span>
				</div>
				<span class="mt-6 block font-medium">
					{{ errorInfo.description }}
				</span>
			</div>

			<div class="card bg-base-100 mx-auto max-w-lg shadow-xl transition-all hover:shadow-2xl">
				<div class="card-body">
					<div class="text-error relative pl-8 text-left font-mono">
						<ShadIcon name="mdi:alert-circle" class="absolute top-1 left-0 size-5 animate-pulse" />
						<pre class="text-lg leading-relaxed whitespace-pre-line">{{ errorInfo.consoleMessage }}</pre>
						<pre v-if="message" class="bg-error/15 mt-4 rounded-lg p-4 whitespace-pre-line shadow-inner">{{ message }}</pre>
					</div>

					<p class="border-error/20 text-error/70 mt-4 border-t pt-4 text-base italic">
						{{ errorInfo.batMessage }}
					</p>

					<div class="card-actions border-error/20 mt-6 justify-center border-t pt-6">
						<button class="btn btn-error gap-2" @click="() => clearError({ redirect: '/' })">
							<ShadIcon name="mdi:home" class="size-5" />
							Return Home
						</button>
						<a href="https://join.wolfstar.rocks" target="_blank" class="btn btn-outline btn-neutral gap-2">
							<ShadIcon name="mdi:forum" class="size-5" />
							Server Support
						</a>
					</div>
				</div>
			</div>

			<div class="perspective-1000 relative mt-12 h-36">
				<span class="animate-hang relative -bottom-[100%] inline-block origin-bottom text-8xl drop-shadow-lg filter"> 🦇 </span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';

const { error } = defineProps<{
	error: NuxtError;
}>();

const statusCode = (error?.statusCode ?? ErrorType.INTERNAL_SERVER) as ErrorType;
const errorInfo = computed(() => errorMessages[statusCode]);
const message = error?.message ?? 'Something went wrong.';

defineOgImageComponent('NuxtSeo', {
	title: error.statusCode.toString(),
	description: error.statusMessage,
	theme: '#fcfcfc',
	colorMode: 'dark'
});

useHead({
	meta: [{ property: 'og:title', content: `WolfStar - ${error.statusCode}` }]
});
</script>
<style scoped>
@keyframes hang {
	0%,
	100% {
		transform: rotate(15deg);
	}
	50% {
		transform: rotate(-15deg);
	}
}

.animate-hang {
	animation: hang 4s ease-in-out infinite;
}

.perspective-1000 {
	perspective: 1000px;
}
</style>
