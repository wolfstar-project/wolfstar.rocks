<template>
	<div class="w-full py-10">
		<UCarousel
			:items="features"
			:ui="{ item: 'basis-auto' }"
			:autoplay="{ delay: 2000, stopOnMouseEnter: true }"
			loop
			arrows
			prev-icon="heroicons:chevron-left-16-solid"
			next-icon="heroicons:chevron-right-16-solid"
			dots
			class="w-full"
		>
			<template #default="{ item }">
				<div
					class="group relative mx-3 my-5 flex h-40 w-64 hover-lift cursor-pointer flex-col items-start justify-center gap-2 overflow-hidden card-glass hover-border-glow px-6 transition-colors hover:bg-white/5"
					@click="item.action"
				>
					<div
						class="flex size-10 items-center justify-center rounded-full bg-base-content/5 p-2 transition-colors group-hover:bg-branding-wolfstar/20 group-hover:text-branding-wolfstar"
					>
						<UIcon :name="item.icon" class="h-6 w-6" />
					</div>
					<h3 class="font-bold">{{ item.title }}</h3>
					<p class="text-sm text-base-content/60">{{ item.description }}</p>

					<!-- Subtle corner glow -->
					<div
						class="absolute -top-4 -right-4 h-16 w-16 rounded-full bg-branding-wolfstar/10 blur-xl transition-all group-hover:bg-branding-wolfstar/30"
					></div>
				</div>
			</template>
		</UCarousel>
	</div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
	(e: "open-feature", index: number): void;
}>();

interface Feature {
	title: string;
	description: string;
	label: string;
	icon: string;
	action?: () => void | Promise<void>;
}

const features = [
	{
		action: () => emit("open-feature", 0),
		description: "Advanced filtering and automated actions.",
		icon: "ph:shield-check-fill",
		label: "automod",
		title: "Auto Moderator",
	},
	{
		action: () => emit("open-feature", 1),
		description: "Track every event in your server.",
		icon: "ph:scroll-fill",
		label: "logging",
		title: "Logging Suite",
	},
	{
		action: () => emit("open-feature", 0),
		description: "Flexible ban and mute durations.",
		icon: "ph:gavel-fill",
		label: "punishments",
		title: "Custom Punishments",
	},
	{
		description: "No paywalls, all features unlocked.",
		icon: "ph:gift-fill",
		label: "free",
		title: "100% Free",
	},
	{
		action: async () =>
			await navigateTo("https://github.com/wolfstar-project/wolfstar", { external: true }),
		description: "Transparent and community driven.",
		icon: "simple-icons:github",
		label: "opensource",
		title: "Open Source",
	},
	{
		description: "Supports multiple languages.",
		icon: "ph:translate-fill",
		label: "multilanguage",
		title: "Multilanguage",
	},
] satisfies Feature[];
</script>
