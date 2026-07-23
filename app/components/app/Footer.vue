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
				<!-- Decorative watermark: override IconsWolfstar's baked-in role/aria-label so only the logo mark below is exposed as the "WolfStar logo" image -->
				<icons-wolfstar
					class="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 opacity-5"
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

			<UButton
				to="https://repo.wolfstar.rocks"
				target="_blank"
				rel="noopener noreferrer"
				icon="lucide:github"
				aria-label="Visit WolfStar on GitHub - opens in new tab"
				color="neutral"
				variant="ghost"
			/>
		</template>
	</UFooter>
</template>

<script setup lang="ts">
const { buildInfo } = useAppConfig();
const { columns } = useFooter();

// Use computed for year to ensure SSR consistency
const currentYear = computed(() => new Date().getFullYear());
</script>
