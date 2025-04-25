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
			<h1 class="mb-6 text-5xl font-extrabold tracking-tight text-[#ff5d5b] drop-shadow-[3px_3px_0px_#2c1810]">Hold up!</h1>

			<div class="mb-8 text-2xl leading-relaxed font-medium text-[#ffd1d0]">
				<span class="inline-block rounded-md bg-[#ff5d5b]/10 px-2 py-1 font-mono text-lg font-bold text-[#ff5d5b]">
					Error {{ error.statusCode }}
				</span>
				<br />
				<span>Sorry, but I'll need to see some ID first!</span>
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

			<div class="mt-8 text-xl font-medium text-gray-400 italic">*squints suspiciously at your lack of credentials*</div>
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

			<div class="mt-8 text-xl font-medium text-gray-400 italic">{{ errorInfo.batMessage }}</div>
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

@media (max-width: 768px) {
	h1 {
		@apply text-4xl drop-shadow-[2px_2px_0px_#2c1810];
	}
	.message {
		@apply text-lg;
	}
	.bat {
		@apply text-6xl;
	}
	.scene {
		@apply h-24;
	}
	.error-box {
		@apply text-sm;
	}
}

.perspective-1000 {
	perspective: 1000px;
}

* {
	box-sizing: border-box;
	margin: 0;
	padding: 0;
}

body {
	display: flex;
	position: relative;
	justify-content: center;
	align-items: center;
	background-color: #1a1a1a;
	min-height: 100vh;
	overflow: hidden;
	overflow-y: auto;
	color: #fff;
	font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.container {
	position: relative;
	z-index: 2;
	padding: 2rem;
	max-width: 800px;
	text-align: center;
}

h1 {
	margin-bottom: 1.5rem;
	color: #ff5d5b;
	font-weight: 800;
	font-size: 3.5rem;
	letter-spacing: -0.03em;
	text-shadow: 3px 3px 0px #2c1810;
}

.message {
	margin-bottom: 2rem;
	color: #ffd1d0;
	font-weight: 500;
	font-size: 1.5rem;
	line-height: 1.6;
}

.scene {
	display: inline-block;
	position: relative;
	margin: 2rem 0;
}

.mousey {
	display: inline-block;
	transform-origin: center;
	animation: tilt 3s infinite;
	font-size: 8rem;
}

.magnifying-glass {
	position: absolute;
	right: -20px;
	bottom: 20px;
	transform-origin: bottom left;
	animation: inspect 3s infinite;
	font-size: 3rem;
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

.subtitle {
	margin-top: 2rem;
	color: #8b8b8b;
	font-style: italic;
	font-weight: 500;
	font-size: 1.2rem;
}

.id-card {
	position: relative;
	margin: 2rem auto;
	border: 2px dashed #ff5d5b;
	border-radius: 8px;
	background: rgba(255, 93, 91, 0.1);
	padding: 1.5rem;
	max-width: 300px;
}

.id-card::before {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	content: '?';
	color: rgba(255, 93, 91, 0.2);
	font-weight: bold;
	font-size: 4rem;
}

.status-code {
	border-radius: 4px;
	background: rgba(255, 93, 91, 0.1);
	padding: 0.2em 0.5em;
	color: #ff5d5b;
	font-weight: bold;
	font-size: 1.1em;
	font-family: monospace;
}

.status-message {
	display: block;
	margin-top: 1.5rem;
	font-weight: 500;
}

.spotlight {
	position: absolute;
	background: radial-gradient(circle at 50% 50%, rgba(255, 93, 91, 0.1) 0%, rgba(26, 26, 26, 0) 70%);
	width: 100%;
	height: 100%;

	pointer-events: none;
}

.credentials {
	display: flex;
	justify-content: space-around;
	gap: 1rem;
	font-size: 1.2rem;
}

.credentials span {
	border-radius: 4px;
	background: rgba(255, 93, 91, 0.1);
	padding: 0.5rem 1rem;
	color: #ff5d5b;
}

@media (max-width: 768px) {
	h1 {
		font-size: 2.5rem;
		text-shadow: 2px 2px 0px #2c1810;
	}
	.message {
		font-size: 1.2rem;
	}
	.mousey {
		font-size: 6rem;
	}
	.magnifying-glass {
		font-size: 2.5rem;
	}
	.id-card {
		padding: 1rem;
		max-width: 260px;
	}
}
</style>
