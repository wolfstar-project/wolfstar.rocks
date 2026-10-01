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
const { ts } = useI18n();

useSeoMetadata({
	description: () => ts("marketing.staryl.seo.description"),
	shouldOgImage: true,
	title: () => ts("marketing.staryl.seo.title"),
});

const otherApps = useApp();
const Invites = useInvites();
const site = useSiteConfig();

// Staryl has no public invite yet (`Invites.Staryl` is a placeholder), so the
// card links to the support server instead of an unusable invite button.
useDiscordLinkCard(() => ({
	accentColor: STARYL_ACCENT_COLOR,
	buttons: [
		{ label: ts("marketing.staryl.cta.ask_in_support"), url: "https://join.wolfstar.rocks" },
	],
	description: ts("marketing.staryl.seo.description"),
	thumbnailDescription: "Staryl",
	thumbnailUrl: `${site.url}/avatars/staryl.png`,
	title: "Staryl",
}));
const { buildInfo } = useAppConfig();
const buildTime = computed(() => new Date(buildInfo.time));
</script>
