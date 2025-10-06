<template>
  <section class="mt-28 flex flex-col items-center text-center">
    <h2 class="title pb-4">Imagine an<br />social and feeder network</h2>
    <p class="max-w-[30rem]">
      A very customizable multilanguage application to cover your members' social and feeder network needs, with a few entertainment features and more,
      <span class="font-bold underline underline-offset-2">100% for free</span>!
    </p>
  </section>

  <section class="mt-16 join">
    <nuxt-link class="btn join-item md:btn-wide" :to="starylInvite"><UIcon name="ph:plus-circle-fill" class="h-5 w-5" /> Add App</nuxt-link>
    <nuxt-link class="btn join-item md:btn-wide" to="#explore"><UIcon name="ph:magnifying-glass-fill" class="h-5 w-5" /> Explore</nuxt-link>
  </section>

  <OtherApps :apps="[OtherApps.WolfStar]" />
</template>

<script setup lang="ts">
const { starylInvite } = useInvites();

useSeoMetadata({
  title: "Staryl",
  description: "Staryl's landing page.\nA very customizable multilanguage application to cover your members' social and feeder network needs, with a few entertainment features and more, 100% for free!",
  shouldSeoImage: true,
});
</script>

<style scoped>
@reference "@/assets/css/main.css";
.title {
	@apply text-4xl font-bold leading-[3.05rem] md:text-5xl md:leading-[3.8rem] bg-gradient-to-b from-white to-branding-staryl bg-clip-text text-transparent;
}
</style>
