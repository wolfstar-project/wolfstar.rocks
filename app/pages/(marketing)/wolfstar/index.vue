<template>
	<div class="text-base-content">
		<HeroSection
			:build-time
			:build-version="buildInfo.version"
			:invite-url="Invites.WolfStar"
		/>

		<StatsSection :stats />

		<ModerationShowcaseSection />

		<CommandsSection />

		<FeaturesSection :features="bentoFeatures" />

		<DashboardSection :members="dashboardMembers" />

		<TestimonialsSection :testimonials />

		<OtherApps :apps="[otherApps.Staryl]" />

		<CtaSection :invite-url="Invites.WolfStar" />
	</div>
</template>

<script setup lang="ts">
definePageMeta({
	alias: ["/"],
});

useSeoMetadata({
	description:
		"Discover WolfStar, a fully customizable multilingual Discord moderation application designed to help you manage and protect your server.",
	shouldOgImage: true,
	title: "Home",
});

const otherApps = useApp();
const Invites = useInvites();
const { buildInfo } = useAppConfig();
const buildTime = computed(() => new Date(buildInfo.time));
</script>
