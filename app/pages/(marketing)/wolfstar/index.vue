<template>
	<div class="text-base-content">
		<WolfstarHeroSection
			:build-time
			:build-version="buildInfo.version"
			:invite-url="Invites.WolfStar"
		/>

		<WolfstarProductProofSection />

		<WolfstarModerationShowcaseSection />

		<WolfstarCommandsSection />

		<WolfstarDashboardSection />

		<OtherApps :apps="[otherApps.Staryl]" />

		<WolfstarCtaSection :invite-url="Invites.WolfStar" />
	</div>
</template>

<script setup lang="ts">
definePageMeta({
	alias: ["/"],
});

useSeoMetadata({
	description:
		"WolfStar gives Discord moderation teams configurable AutoMod, searchable moderation and command history, and one dashboard for server settings.",
	shouldOgImage: true,
	title: "Home",
});

const otherApps = useApp();
const Invites = useInvites();
const { buildInfo } = useAppConfig();
const buildTime = computed(() => new Date(buildInfo.time));
</script>
