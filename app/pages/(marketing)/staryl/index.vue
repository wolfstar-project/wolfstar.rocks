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
const { t } = useI18n();

useSeoMetadata({
	description: () => t("marketing.staryl.seo.description"),
	shouldOgImage: true,
	title: () => t("marketing.staryl.seo.title"),
});

const otherApps = useApp();
const Invites = useInvites();
const { buildInfo } = useAppConfig();
const buildTime = computed(() => new Date(buildInfo.time));
</script>
