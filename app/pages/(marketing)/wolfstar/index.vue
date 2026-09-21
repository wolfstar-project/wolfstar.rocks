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

const { ts } = useI18n();

useSeoMetadata({
	description: () => ts("marketing.wolfstar.seo.description"),
	shouldOgImage: true,
	title: () => ts("marketing.wolfstar.seo.title"),
});

const otherApps = useApp();
const Invites = useInvites();
const site = useSiteConfig();

useDiscordLinkCard(() => ({
	buttons: [{ label: ts("marketing.wolfstar.cta.invite"), url: Invites.WolfStar }],
	description: ts("marketing.wolfstar.seo.description"),
	thumbnailDescription: site.name,
	thumbnailUrl: `${site.url}/avatars/wolfstar.png`,
	title: site.name,
}));
const { buildInfo } = useAppConfig();
const buildTime = computed(() => new Date(buildInfo.time));
</script>
