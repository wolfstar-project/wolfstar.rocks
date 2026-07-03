<template>
	<!-- Hero Background Pattern -->
	<div class="hero-pattern" aria-hidden="true"></div>

	<section class="relative z-10 mt-28 flex flex-col items-center text-center">
		<h1 class="title animate-fade-in-up-safe gradient-text-hero pb-4">
			Imagine a<br />moderation app
		</h1>
		<p class="max-w-120 animate-fade-in-up-safe text-toned [animation-delay:0.1s]">
			A very customizable multilanguage application to help you moderate your server, with a
			complete logging suite and more,
			<span class="font-bold underline underline-offset-2">100% for free</span>!
		</p>
	</section>

	<section>
		<BuildEnvironment class="mt-10" />
	</section>

	<section
		class="relative z-10 mt-12 flex animate-fade-in-up justify-center animate-fade-in-delay-2"
	>
		<UFieldGroup size="lg">
			<UButton class="sm:min-w-48" color="neutral" :to="Invites.WolfStar">
				<UIcon name="ph:plus-circle-fill" class="h-5 w-5" aria-hidden="true" /> Add App
			</UButton>
			<UButton class="sm:min-w-48" color="neutral" to="#explore" variant="outline">
				<UIcon name="ph:magnifying-glass-fill" class="h-5 w-5" aria-hidden="true" />
				Explore
			</UButton>
		</UFieldGroup>
	</section>

	<section id="explore" ref="exploreRef" class="mt-34 min-h-200 w-full scroll-mt-24">
		<div class="mb-16 text-center">
			<h2 class="text-5xl font-bold">Explore</h2>
			<template v-if="exploreLoaded">
				<LazyFeatureCarousel class="mb-24" @open-feature="openFeature" />
				<LazyFeatureShowcase v-model:active-feature="selectedFeatureIndex" />
			</template>
		</div>
	</section>

	<section class="prose animate-on-scroll">
		<h3 class="mt-32 text-center text-3xl font-bold">And more!</h3>
		<p>WolfStar not only comes with a very complete moderation suite, but also:</p>
		<ul>
			<li>
				<UIcon
					name="ph:chat-text-duotone"
					class="my-0 mr-1 h-5 w-5 text-warning"
					aria-hidden="true"
				/>
				<strong>A large logging suite:</strong> WolfStar can log almost everything that
				happens in your server: moderation actions, message updates and deletions, channel
				updates and deletions, role updates and deletions, server updates, members changing
				voice channels, and more.
			</li>
			<li>
				<UIcon
					name="ph:money-wavy-duotone"
					class="my-0 mr-1 h-5 w-5 text-error"
					aria-hidden="true"
				/>
				<strong>No paywalls:</strong> all of WolfStar's features are
				<strong>available for free</strong> and all logs are sent to your server as soon as
				they happen, without any delay. WolfStar Project
				<strong>will never paywall core features</strong>, and also
				<strong>strongly believes in Open-Source Software</strong>, making all the apps'
				source code freely available to everyone, and will always stay that way.
			</li>
		</ul>
	</section>

	<section class="invite-card mt-32 flex animate-on-scroll flex-col items-center">
		<h3 class="mb-4 text-3xl font-bold">Liking what you see?</h3>

		<UFieldGroup class="flex-wrap justify-center">
			<UButton :to="Invites.WolfStar" color="neutral" variant="ghost">
				Invite WolfStar
			</UButton>
			<UButton color="neutral" to="https://join.wolfstar.rocks" variant="ghost">
				Support Server
			</UButton>
		</UFieldGroup>
	</section>
	<OtherApps :apps="[otherApps.Staryl]" />
</template>

<script setup lang="ts">
definePageMeta({ alias: ["/"] });

useSeoMetadata({
	description:
		"Discover WolfStar, a fully customizable multilingual Discord moderation application designed to help you manage and protect your server.",
	shouldOgImage: true,
	title: "Home",
});

const otherApps = useApp();
const Invites = useInvites();

const selectedFeatureIndex = ref(0);

// Lazy-mount the Explore section components only when the section approaches
// the viewport, keeping them out of the initial JS critical path.
const exploreRef = ref<HTMLElement | null>(null);
const exploreLoaded = ref(false);

onMounted(() => {
	// Instantly load if the user navigated directly to the #explore anchor.
	if (window.location.hash === "#explore") {
		exploreLoaded.value = true;
	}
});

const { stop: stopExploreObserver } = useIntersectionObserver(
	exploreRef,
	(entries) => {
		if (entries[0]?.isIntersecting) {
			exploreLoaded.value = true;
			stopExploreObserver();
		}
	},
	// Keep margin at 0 so below-fold Discord showcase chunks stay off the
	// initial hydration path (a large rootMargin was loading them during LCP).
	{ rootMargin: "0px" },
);

function openFeature(index: number) {
	selectedFeatureIndex.value = index;
	exploreLoaded.value = true;
	window.location.hash = "#explore";
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.title {
	@apply text-4xl leading-[3.05rem] font-bold md:text-6xl md:leading-18;
}

/* Hero background pattern */
.hero-pattern {
	@apply pointer-events-none fixed inset-0 -z-10;
	mask-image: linear-gradient(to bottom, white 0%, transparent 70%);
	-webkit-mask-image: linear-gradient(to bottom, white 0%, transparent 70%);
	background-image:
		radial-gradient(
			ellipse at 50% 0%,
			oklch(from var(--branding-wolfstar) l c h / 0.15) 0%,
			transparent 60%
		),
		linear-gradient(to right, oklch(50% 0 0 / 0.03) 1px, transparent 1px),
		linear-gradient(to bottom, oklch(50% 0 0 / 0.03) 1px, transparent 1px);
	background-size:
		100% 100%,
		4rem 4rem,
		4rem 4rem;
}

.invite-card {
	@apply relative isolate p-12 text-white;
}

.invite-card::before {
	@apply absolute top-0 left-0 -z-10 h-full w-full -rotate-2 rounded-xl drop-shadow-lg;
	background: linear-gradient(
		to bottom right in oklch,
		var(--color-red-600) 0%,
		var(--color-purple-600) 70%
	);
	content: "";
}
</style>
