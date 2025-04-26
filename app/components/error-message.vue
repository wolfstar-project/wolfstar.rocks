<template>
	<Head>
		<Title>Error {{ statusCode }}</Title>
		<Meta name="description" content="An error occurred" />
	</Head>

	<div
		v-if="error.statusCode == 401"
		class="relative flex min-h-screen items-center justify-center overflow-hidden overflow-y-auto bg-base-100 font-sans"
	>
		<div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,93,91,0.1)_0%,rgba(26,26,26,0)_70%)]"></div>

		<div class="relative z-10 container max-w-[600px] p-8 text-center">
			<h1 class="mb-6 text-5xl font-extrabold tracking-tight text-[#ff5d5b] drop-shadow-[3px_3px_0px_#2c1810]">{{ errorInfo.title }}</h1>

			<div class="mb-8 text-2xl leading-relaxed font-medium text-[#ffd1d0]">
				<span class="inline-block rounded-md bg-[#ff5d5b]/10 px-2 py-1 font-mono text-lg font-bold text-[#ff5d5b]">
					Error {{ statusCode }}
				</span>
				<br />
				<span>{{ errorInfo.description }}</span>
			</div>

			<div class="relative mx-auto max-w-[320px] overflow-hidden rounded-xl border-2 border-dashed border-[#ff5d5b] bg-[#ff5d5b]/10 p-6">
				<div class="absolute left-4 animate-[blink_1s_infinite] font-mono font-bold text-[#ff5d5b]">></div>
				<pre class="pl-6 text-left font-mono text-sm leading-relaxed text-[#ff5d5b]">{{ errorInfo.consoleMessage }}</pre>
				<pre v-if="message" class="mt-4 rounded-lg bg-red-900/30 p-4 whitespace-pre-line shadow-inner">{{ message }}</pre>
			</div>

			<div class="relative mx-auto max-w-[320px] overflow-hidden rounded-xl border-2 border-dashed border-[#ff5d5b] bg-[#ff5d5b]/10 p-6">
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
		</div>
	</div>

	<div v-else class="relative flex min-h-screen items-center justify-center overflow-hidden overflow-y-auto bg-base-100 font-sans">
		<div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,93,91,0.1)_0%,rgba(26,26,26,0)_70%)]"></div>
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

			<div class="relative mx-auto max-w-[320px] overflow-hidden rounded-xl border-2 border-dashed border-[#ff5d5b] bg-[#ff5d5b]/10 p-6">
				<div class="absolute left-4 animate-[blink_1s_infinite] font-mono font-bold text-[#ff5d5b]">></div>
				<pre class="pl-6 text-left font-mono text-sm leading-relaxed text-[#ff5d5b]">{{ errorInfo.consoleMessage }}</pre>
				<pre v-if="message" class="mt-4 rounded-lg bg-red-900/30 p-4 whitespace-pre-line shadow-inner">{{ message }}</pre>
			</div>

			<div class="perspective-1000 relative mt-8 inline-block h-32">
				<span class="relative -top-[200%] inline-block origin-bottom animate-[hang_4s_infinite] text-8xl">🦇</span>
			</div>

			<div class="mt-8 text-xl font-medium text-gray-400 italic">{{ errorInfo.messageHint }}</div>
		</div>
	</div>
	<div class="mt-6 flex justify-center gap-4 border-t border-red-500/20 pt-6">
		<button class="btn flex items-center gap-2 btn-error" @click="() => clearError({ redirect: '/' })">
			<ShadIcon name="mdi:home" class="size-5" />
			Return Home
		</button>
		<a href="https://join.wolfstar.rocks" target="_blank" class="btn flex items-center gap-2 btn-outline">
			<ShadIcon name="mdi:forum" class="size-5" />
			Server Support
		</a>
	</div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app';

const { error } = defineProps<{
	error: NuxtError;
}>();

const statusCode = (error?.statusCode ?? ErrorType.INTERNAL_SERVER) as ErrorType;
const errorInfo = computed(() => errorMessages[statusCode]);
const errorUnauthorized = computed(() => errorMessages[ErrorType.UNAUTHORIZED]);
const message = error?.message ?? 'Something went wrong.';

defineOgImageComponent('NuxtSeo', {
	title: error.statusCode.toString(),
	description: error.statusMessage,
	theme: '#fcfcfc',
	colorMode: 'dark'
});

useHead({
	meta: [{ property: 'og:title', content: `WolfStar - ${statusCode}` }]
});
</script>

<style scoped>
@reference '@/assets/css/main.css'
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
		transform: rotate(15deg);
	}
	50% {
		transform: rotate(-15deg);
	}
}

@keyframes tilt {
	0%,
	100% {
		transform: rotate(-5deg);
	}
	50% {
		transform: rotate(5deg);
	}
}

@keyframes inspect {
	0%,
	100% {
		transform: rotate(-15deg);
	}
	50% {
		transform: rotate(0deg);
	}
}

@media (max-width: 768px) {
	h1 {
		@apply text-lg drop-shadow-[2px_2px_0px_#2c1810];
	}
}

.perspective-1000 {
	perspective: 1000px;
}
</style>
