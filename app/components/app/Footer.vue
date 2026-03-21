<template>
	<USeparator
		size="lg"
		icon="custom:wolfstar"
		:ui="{ border: 'border-[1px] border-base-300' }"
		class="mt-24 p-10 content-visibility-auto"
	/>
	<UFooter
		:ui="{ root: 'p-2 content-visibility-auto', top: 'border-default' }"
		aria-label="Site footer"
	>
		<template #top>
			<UContainer>
				<UFooterColumns class="p-10" :columns aria-label="Footer navigation">
					<template #right>
						<PwaInstallPrompt class="xl:hidden" />
						<div class="flex-auto"></div>
						<UButton
							label="Powered by Netlify"
							to="https://www.netlify.com"
							target="_blank"
							rel="noopener noreferrer"
							icon="simple-icons:netlify"
							color="neutral"
							variant="soft"
							:ui="{ leadingIcon: 'bg-green-500' }"
							aria-label="Powered by Netlify - opens in new tab"
						/>
					</template>
				</UFooterColumns>
			</UContainer>
		</template>

		<template #left>
			<aside>
				<div class="flex items-center gap-4">
					<div class="w-10 rounded-full" role="img" aria-label="WolfStar logo">
						<icons-wolfstar class="h-12 w-12" aria-hidden="true" />
					</div>
					<div>
						<p class="font-semibold">WolfStar Project</p>
					</div>
					<div>
						<p class="text-sm text-base-content/80">
							Copyright © {{ currentYear }}. All rights reserved.
						</p>
					</div>
				</div>

				<div class="pl-14 sm:pl-12">
					<BuildEnvironment :footer="true" :buildInfo />
				</div>
			</aside>
		</template>
		<template #right>
			<ColorModeButton />

			<UButton
				to="https://github.com/wolfstar-project/wolfstar"
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
const { buildInfo, footer: columns } = useAppConfig();


// Use computed for year to ensure SSR consistency
const currentYear = computed(() => new Date().getFullYear());
</script>
