<template>
	<div class="text-base-content">
		<StarylHeroSection
			:build-time
			:build-version="buildInfo.version"
			:invite-url="Invites.Staryl"
		/>

		<StarylProductProofSection />

		<StarylCommandsSection />

		<OtherApps :apps="[otherApps.WolfStar]" />

		<StarylCtaSection :invite-url="Invites.Staryl" />
	</div>
</template>

<script setup lang="ts">
useSeoMetadata({
	description:
		"Staryl is an in-development Discord app for social notifications from the WolfStar Project. Its public invite is not available yet.",
	shouldOgImage: true,
	title: "Staryl",
});

const otherApps = useApp();
const Invites = useInvites();
const { buildInfo } = useAppConfig();
const buildTime = computed(() => new Date(buildInfo.time));
</script>
