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
		class="mt-16 flex animate-fade-in-up items-center justify-center animate-fade-in-delay-2"
	>
		<UFieldGroup size="lg">
			<UButton :to="Invites.Staryl" class="sm:min-w-48" color="neutral">
				<UIcon name="ph:plus-circle-fill" class="h-5 w-5" aria-hidden="true" /> Add App
			</UButton>
			<UButton class="sm:min-w-48" color="neutral" to="#explore" variant="outline">
				<UIcon name="ph:magnifying-glass-fill" class="h-5 w-5" aria-hidden="true" />
				Explore
			</UButton>
		</UFieldGroup>
	</section>

	<h2 class="mt-72 animate-on-scroll text-center text-5xl font-bold">COMING SOON...</h2>

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
@reference "@/assets/css/main.css";
.title {
	@apply bg-linear-to-b from-white to-branding-staryl bg-clip-text text-4xl leading-[3.05rem] font-bold text-transparent md:text-5xl md:leading-[3.8rem];
}
</style>
