<template>
	<section
		class="home-hero relative overflow-hidden pt-25 pb-14"
		aria-labelledby="home-hero-heading"
	>
		<Container class="relative z-10">
			<div class="mx-auto flex max-w-200 flex-col items-center text-center">
				<div
					class="mb-6 flex animate-fade-in-up-safe flex-wrap items-center justify-center gap-2"
				>
					<UBadge color="neutral" variant="subtle" size="sm" class="hero-overlay-badge">
						v{{ buildVersion }} ·
						<NuxtTime
							:datetime="buildTime"
							month="short"
							day="numeric"
							year="numeric"
						/>
					</UBadge>
					<UBadge color="primary" variant="subtle" size="sm" label="Open Source" />
					<UBadge color="success" variant="subtle" size="sm" label="Free Forever" />
				</div>

				<h1
					id="home-hero-heading"
					class="home-hero-title animate-fade-in-up-safe text-balance"
				>
					Imagine a moderation app.
				</h1>

				<div
					class="my-5 flex animate-fade-in-up-safe justify-center gap-1 [animation-delay:0.05s]"
					aria-hidden="true"
				>
					<span
						v-for="color of spectrumBar"
						:key="color"
						:class="cn('h-1 w-7 rounded-full', homeAccentClass(color))"
					></span>
				</div>

				<p
					class="home-hero-subtitle max-w-140 animate-fade-in-up-safe text-pretty [animation-delay:0.1s]"
				>
					A fully customizable, multilingual Discord moderation app — complete logging,
					AutoMod, and role tools, 100% free.
				</p>

				<div
					class="mt-8 flex animate-fade-in-up-safe flex-col gap-3 [animation-delay:0.15s] sm:flex-row sm:justify-center"
				>
					<UButton
						:to="inviteUrl"
						size="lg"
						color="primary"
						class="btn-glow justify-center sm:min-w-45"
						icon="ph:plus-circle-fill"
					>
						Add to Discord
					</UButton>
					<UButton
						to="#features"
						size="lg"
						color="neutral"
						variant="outline"
						class="hero-outline-btn justify-center sm:min-w-45"
						icon="ph:magnifying-glass-fill"
					>
						Explore features
					</UButton>
				</div>
			</div>
		</Container>
	</section>
</template>

<script setup lang="ts">
import { cn } from "cnfast";

const { buildTime, buildVersion, inviteUrl } = defineProps<{
	buildTime: Date;
	buildVersion: string;
	inviteUrl: string;
}>();

const spectrumBar = [
	"spectrum-red",
	"spectrum-orange",
	"spectrum-yellow",
	"spectrum-green",
	"spectrum-blue",
	"spectrum-purple",
] as const satisfies HomeAccent[];
</script>

<style scoped>
@reference "@/assets/css/main.css";

.home-hero-title {
	@apply text-4xl leading-[1.1] font-bold md:text-[3.75rem];
	letter-spacing: var(--home-ls-tight);
}

.home-hero-subtitle {
	@apply text-xl leading-relaxed font-normal text-base-content/80;
}

.hero-overlay-badge {
	--hero-badge-bg: oklch(100% 0 0 / 0.06);
	backdrop-filter: blur(8px);
	background: var(--hero-badge-bg);
}

.hero-outline-btn {
	border-color: oklch(from var(--color-base-content) l c h / 0.2);
	color: var(--color-base-content);
}
</style>
