<template>
	<UFooter
		:ui="{
			root: 'p-2 content-visibility-auto bg-base-200',
			top: 'border-default',
		}"
		aria-label="Site footer"
	>
		<template #top>
			<UContainer class="relative overflow-hidden">
				<!-- Decorative watermark: keep fully inside the padded brand area so overflow-hidden does not clip it -->
				<icons-wolfstar
					class="pointer-events-none absolute bottom-6 left-6 h-56 w-56 opacity-5"
					role="presentation"
					:aria-label="undefined"
					aria-hidden="true"
				/>
				<div
					class="relative grid grid-cols-1 gap-10 p-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]"
				>
					<div>
						<div class="mb-3 flex items-center gap-3">
							<div class="w-10 rounded-full" role="img" aria-label="WolfStar logo">
								<icons-wolfstar class="h-10 w-10" aria-hidden="true" />
							</div>
							<span class="font-bold">WolfStar</span>
						</div>
						<p class="max-w-70 text-sm leading-relaxed text-base-content/70">
							A fully customizable, multilingual Discord moderation app. Free forever,
							open source.
						</p>
						<nav class="mt-4 flex items-center gap-1" aria-label="Social links">
							<UButton
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
						<div class="mt-6 flex flex-col items-start gap-3">
							<ClientOnly>
								<PwaInstallPrompt class="xl:hidden" />
							</ClientOnly>
							<UButton
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
						<div class="flex flex-col gap-2.5">
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
			</UContainer>
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
	</UFooter>
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
