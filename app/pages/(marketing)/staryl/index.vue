<template>
	<div class="text-base-content">
		<StarylHeroSection :invite-url="Invites.Staryl" :release="starylRelease" />

		<StarylProductProofSection />

		<StarylNotificationShowcaseSection />

		<StarylSetupSection :invite-url="Invites.Staryl" />

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
const { starylRelease } = useAppConfig();

useDiscordLinkCard(() => ({
	accentColor: STARYL_ACCENT_COLOR,
	buttons: [
		{ label: ts("marketing.staryl.cta.invite"), url: Invites.Staryl },
		{ label: ts("marketing.staryl.cta.ask_in_support"), url: "https://join.wolfstar.rocks" },
	],
	description: ts("marketing.staryl.seo.description"),
	thumbnailDescription: "Staryl",
	thumbnailUrl: `${site.url}/avatars/staryl.png`,
	title: "Staryl",
}));
</script>
