<template>
  <!-- Hero Background Pattern -->
  <div class="hero-pattern" aria-hidden="true"></div>

  <section class="mt-28 flex flex-col items-center text-center relative z-10">
    <h1 class="title pb-4 animate-fade-in-up">Imagine a<br />moderation app</h1>
    <p class="max-w-120 text-base-content/80 animate-fade-in-up animate-fade-in-delay-1">
      A very customizable multilanguage application to help you moderate your
      server, with a complete logging suite and more,
      <span class="font-bold underline underline-offset-2">100% for free</span>!
    </p>
  </section>

  <section class="mt-16 join justify-center relative z-10 animate-fade-in-up animate-fade-in-delay-2">
    <NuxtLink class="btn join-item glow-btn glow-btn-branding sm:btn-wide" :to="Invites.WolfStar">
      <UIcon name="ph:plus-circle-fill" class="h-5 w-5" aria-hidden="true" /> Add App
    </NuxtLink>
    <NuxtLink
      class="btn join-item glow-btn glow-btn-branding sm:btn-wide"
      to="#explore"
    >
      <UIcon name="ph:magnifying-glass-fill" class="h-5 w-5" aria-hidden="true" />
      Explore
    </NuxtLink>
  </section>

  <section id="explore" class="mt-38 w-full scroll-mt-24">
    <div class="text-center mb-16">
      <h2 class="text-5xl font-bold">Explore</h2>
      <FeatureCarousel class="mb-24" @open-feature="openFeature" />
      <FeatureShowcase v-model:active-feature="selectedFeatureIndex" />
    </div>
  </section>

  <section class="prose">
    <h3 class="mt-32 text-center text-3xl font-bold">And more!</h3>
    <p>
      WolfStar not only comes with a very complete moderation suite, but also:
    </p>
    <ul>
      <li>
        <UIcon
          name="ph:chat-text-duotone"
          class="my-0 mr-1 h-5 w-5 text-warning"
          aria-hidden="true"
        />
        <strong>A large logging suite:</strong> WolfStar can log almost
        everything that happens in your server: moderation actions, message
        updates and deletions, channel updates and deletions, role updates and
        deletions, server updates, members changing voice channels, and more.
      </li>
      <li>
        <UIcon
          name="ph:money-wavy-duotone"
          class="my-0 mr-1 h-5 w-5 text-error"
          aria-hidden="true"
        />
        <strong>No paywalls:</strong> all of WolfStar's features are
        <strong>available for free</strong> and all logs are sent to your server
        as soon as they happen, without any delay. WolfStar Project
        <strong>will never paywall core features</strong>, and also
        <strong>strongly believes in Open-Source Software</strong>, making all
        the apps' source code freely available to everyone, and will always stay
        that way.
      </li>
    </ul>
  </section>

  <section class="invite-card mt-32 flex flex-col items-center">
    <h3 class="mb-4 text-3xl font-bold">Liking what you see?</h3>

    <div class="join">
      <NuxtLink
        :to="Invites.WolfStar"
        class="btn join-item btn-ghost"
      >
        Invite WolfStar
      </NuxtLink>
      <NuxtLink
        to="https://join.wolfstar.rocks"
        class="btn join-item btn-ghost"
      >
        Support Server
      </NuxtLink>
    </div>
  </section>
  <OtherApps :apps="[OtherApps.Staryl]" />
</template>

<script setup lang="ts">
import FeatureCarousel from "./@components/FeatureCarousel.client.vue";
import FeatureShowcase from "./@components/FeatureShowcase.client.vue";

definePageMeta({ alias: ["/"] });

useSeoMetadata({
  title: "Home",
  description:
    "WolfStar's landing page.\nA very customizable multilanguage application to help you moderate your server, with a complete logging suite and more, 100% for free!",
  shouldOgImage: true,
});

const selectedFeatureIndex = ref(0);

function openFeature(index: number) {
  selectedFeatureIndex.value = index;
  const element = document.getElementById("explore");
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.title {
	@apply text-4xl font-bold leading-[3.05rem] md:text-6xl md:leading-18;
	background: linear-gradient(to bottom right, oklch(100% 0 45) 0%, oklch(75% 0.18 15) 50%, var(--color-branding-wolfstar) 100%);
	background-clip: text;
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

/* Hero background pattern */
.hero-pattern {
	@apply fixed inset-0 -z-10 pointer-events-none;
	mask-image: linear-gradient(to bottom, white 0%, transparent 70%);
	-webkit-mask-image: linear-gradient(to bottom, white 0%, transparent 70%);
	background-image:
		radial-gradient(ellipse at 50% 0%, oklch(from var(--branding-wolfstar) l c h / 0.15) 0%, transparent 60%),
		linear-gradient(to right, oklch(50% 0 0 / 0.03) 1px, transparent 1px), linear-gradient(to bottom, oklch(50% 0 0 / 0.03) 1px, transparent 1px);
	background-size:
		100% 100%,
		4rem 4rem,
		4rem 4rem;
}

.invite-card {
	@apply relative p-12 text-white;
}

.invite-card::before {
	@apply absolute left-0 top-0 -z-10 h-full w-full -rotate-2 rounded-xl drop-shadow-lg;
	background: linear-gradient(to bottom right in oklch, var(--color-red-600) 0%, var(--color-purple-600) 70%);
	content: '';
}
</style>
