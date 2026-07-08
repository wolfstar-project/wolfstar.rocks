<template>
	<div class="text-base-content">
		<HeroSection
			:build-time="buildTime"
			:build-version="buildInfo.version"
			:invite-url="Invites.WolfStar"
		/>

		<StatsSection :stats="stats" />

		<FeaturesSection :features="bentoFeatures" />

		<DashboardSection :members="members" />

		<TestimonialsSection :testimonials="testimonials" />

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

const stats: HomeStat[] = [
	{ accent: "primary", label: "Servers protected", value: "10,000+" },
	{ accent: "success", label: "Members moderated", value: "2.4M" },
	{ accent: "accent", label: "Uptime", value: "99.9%" },
	{ accent: "error", label: "Languages", value: "12" },
];

const bentoFeatures: HomeFeature[] = [
	{
		accent: "primary",
		big: true,
		description:
			"Configurable spam, invite, and mass-mention filters catch trouble before your team has to.",
		icon: "ph:shield-check-fill",
		title: "Smart AutoMod",
	},
	{
		big: false,
		description:
			"Moderation actions, message edits, channel and role changes, voice moves — logged straight to your server.",
		icon: "ph:scroll-fill",
		title: "Complete Logging Suite",
	},
	{
		big: false,
		description: "Give staff exactly the access they need, down to the command.",
		icon: "ph:users-three-fill",
		title: "Granular Roles & Permissions",
	},
	{
		big: false,
		description:
			"A fully translated interface and command set, so every member reads WolfStar in their own language.",
		icon: "ph:translate-fill",
		title: "Multilingual by Default",
	},
	{
		big: false,
		description:
			"Search a complete history of every action taken on your server, and who took it.",
		icon: "ph:clock-counter-clockwise-fill",
		title: "Full Audit History",
	},
	{
		big: false,
		description: "Every feature is free forever. The full source is open for anyone to read.",
		icon: "ph:heart-fill",
		title: "No Paywalls, Ever",
	},
];

const members: HomeDashboardMember[] = [
	{
		avatarClass: "bg-error/15 text-error",
		badgeClass: "badge-error",
		initials: "RF",
		name: "redstar071",
		nameClass: "text-base-content",
		role: "Owner",
		status: "online",
	},
	{
		avatarClass: "bg-primary/15 text-primary",
		badgeClass: "badge-primary",
		initials: "ST",
		name: "staryl",
		nameClass: "text-base-content",
		role: "Admin",
		status: "online",
	},
	{
		avatarClass: "bg-success/15 text-success",
		badgeClass: "badge-success",
		initials: "SD",
		name: "stella.dev",
		nameClass: "text-base-content",
		role: "Moderator",
		status: "idle",
	},
	{
		avatarClass: "bg-secondary/15 text-secondary",
		badgeClass: "badge-secondary",
		initials: "NW",
		name: "nightwolf",
		nameClass: "text-base-content",
		role: "Booster",
		status: "dnd",
	},
	{
		avatarClass: "bg-base-content/10 text-base-content/70",
		badgeClass: "badge-neutral",
		initials: "LC",
		name: "lumacore",
		nameClass: "text-base-content",
		role: "Member",
		status: "online",
	},
];

const testimonials: HomeTestimonial[] = [
	{
		name: "redstar071",
		quote: "WolfStar replaced three other bots for us — the logging alone is worth it.",
		role: "Owner · WolfStar HQ",
	},
	{
		name: "lumacore",
		quote: "Setup took five minutes. AutoMod has caught every raid since.",
		role: "Moderator · Dev Lab",
	},
	{
		name: "stella.dev",
		quote: "Finally a mod bot that ships in our language.",
		role: "Community Manager · Art Club",
	},
];
</script>
