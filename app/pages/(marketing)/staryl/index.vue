<template>
	<section class="mt-28 flex flex-col items-center text-center">
		<h1 class="title animate-fade-in-up-safe pb-4">Imagine a<br />social and feeder network</h1>
		<p class="max-w-120 animate-fade-in-up-safe [animation-delay:0.1s]">
			A very customizable multilanguage application to cover your members' social and feeder
			network needs, with a few entertainment features and more,
			<span class="font-bold underline underline-offset-2">100% for free</span>!
		</p>
	</section>
	<section>
		<BuildEnvironment :footer="false" class="mt-16" />
	</section>
	<section
		class="join mt-16 animate-fade-in-up animate-fade-in-delay-2 flex items-center justify-center"
	>
		<NuxtLink class="btn join-item sm:btn-wide" :to="Invites.Staryl">
			<StarIcon name="ph:plus-circle-fill" class="h-5 w-5" aria-hidden="true" /> Add App
		</NuxtLink>
		<NuxtLink class="btn join-item sm:btn-wide" to="#explore">
			<StarIcon name="ph:magnifying-glass-fill" class="h-5 w-5" aria-hidden="true" />
			Explore
		</NuxtLink>
	</section>

	<h2 class="mt-72 animate-on-scroll text-5xl font-bold text-center">COMING SOON...</h2>

	<OtherApps :apps="[OtherApps.WolfStar]" />
</template>

<script setup lang="ts">
useSeoMetadata({
	description:
		"Staryl's landing page. A very customizable multilanguage application to cover your members' social and feeder network needs, with a few entertainment features and more, 100% for free!",
	shouldOgImage: true,
	title: "Staryl",
});

const OtherApps = useApp();
const Invites = useInvites();
</script>

<style scoped>
.title {
	@apply from-white to-branding-staryl text-4xl font-bold md:text-5xl md:leading-[3.8rem] bg-linear-to-b bg-clip-text leading-[3.05rem] text-transparent;
}
</style>
