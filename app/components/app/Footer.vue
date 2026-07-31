<template>
	<StarFooter
		:ui="{
			root: 'p-2 content-visibility-auto bg-base-200',
			top: 'border-default',
		}"
		aria-label="Site footer"
	>
		<template #top>
			<StarContainer class="relative overflow-hidden">
				<!-- Decorative watermark: keep fully inside the padded brand area so overflow-hidden does not clip it -->
				<icons-wolfstar
					class="bottom-6 left-6 h-56 w-56 pointer-events-none absolute opacity-5"
					role="presentation"
					:aria-label="undefined"
					aria-hidden="true"
				/>
				<div
					class="gap-10 p-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] relative grid grid-cols-1"
				>
					<div>
						<div class="mb-3 gap-3 flex items-center">
							<div class="w-10 rounded-full" role="img" aria-label="WolfStar logo">
								<icons-wolfstar class="h-10 w-10" aria-hidden="true" />
							</div>
							<span class="font-bold">WolfStar</span>
						</div>
						<p class="max-w-70 text-sm leading-relaxed text-base-content/70">
							A fully customizable, multilingual Discord moderation app. Free forever,
							open source.
						</p>
						<nav class="mt-4 gap-1 flex items-center" aria-label="Social links">
							<StarButton
								v-for="social of socialLinks"
								:key="social.label"
								:to="social.to"
								target="_blank"
								rel="noopener noreferrer"
								:icon="social.icon"
								:aria-label="social.ariaLabel"
								color="neutral"
								variant="ghost"
								size="sm"
							/>
						</nav>
						<div class="mt-6 gap-3 flex flex-col items-start">
							<ClientOnly>
								<PwaInstallPrompt class="xl:hidden" />
							</ClientOnly>
							<StarButton
								label="Powered by Netlify"
								to="https://www.netlify.com"
								target="_blank"
								rel="noopener noreferrer"
								icon="simple-icons:netlify"
								color="neutral"
								variant="soft"
								:ui="{ leadingIcon: 'bg-success' }"
								aria-label="Powered by Netlify - opens in new tab"
							/>
						</div>
					</div>
					<nav
						v-for="column of columns"
						:key="column.label"
						:aria-label="`Footer ${column.label} links`"
					>
						<div class="mb-4 text-xs font-bold tracking-wider text-muted uppercase">
							{{ column.label }}
						</div>
						<div class="gap-2.5 flex flex-col">
							<NuxtLink
								v-for="link of column.children"
								:key="link.label"
								:to="link.to"
								class="text-sm text-base-content/70 link-hover"
							>
								{{ link.label }}
							</NuxtLink>
						</div>
					</nav>
				</div>
			</StarContainer>
		</template>

		<template #left>
			<p class="text-sm text-base-content/80">
				WolfStar Project — Copyright © {{ currentYear }}. All rights reserved.
			</p>
		</template>
		<template #right>
			<BuildEnvironment :footer="true" :buildInfo class="mr-2" />
			<ColorModeButton />
		</template>
	</StarFooter>
</template>

<script setup lang="ts">
const { buildInfo } = useAppConfig();
const { columns } = useFooter();

const socialLinks = [
	{
		ariaLabel: "Visit WolfStar on GitHub - opens in new tab",
		icon: "simple-icons:github",
		label: "GitHub",
		to: "https://repo.wolfstar.rocks",
	},
	{
		ariaLabel: "Join the WolfStar Discord - opens in new tab",
		icon: "simple-icons:discord",
		label: "Discord",
		to: "https://join.wolfstar.rocks",
	},
	{
		ariaLabel: "Follow WolfStar on X - opens in new tab",
		icon: "simple-icons:x",
		label: "X",
		to: "https://x.com/wolfstarapp",
	},
] as const;

// Use computed for year to ensure SSR consistency
const currentYear = computed(() => new Date().getFullYear());
</script>
