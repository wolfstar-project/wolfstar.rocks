<script setup lang="ts">
const { footer = false, buildInfo: buildInfoProp } = defineProps<{
	footer?: boolean;
	buildInfo?: BuildInfo;
}>();

const appConfig = useAppConfig();
const buildInfo = computed(() => buildInfoProp || appConfig.buildInfo);
const buildTime = computed(() => new Date(buildInfo.value.time));
</script>

<template>
	<div
		class="motion-safe:animate-fill-both flex font-mono text-xs text-muted motion-safe:animate-fade-in"
		:class="
			footer
				? 'items-center gap-2 rounded-full border border-default px-2.5 py-1'
				: 'mb-8 items-center justify-center gap-2'
		"
		style="animation-delay: 0.05s"
	>
		<!-- Deploy status dot, per the redesign canvas -->
		<span v-if="footer" class="size-1.5 shrink-0 rounded-full bg-success" aria-hidden="true" />
		<NuxtTime
			:class="footer ? 'text-xs text-toned' : 'text-md text-default'"
			class="whitespace-nowrap"
			:datetime="buildTime"
			year="numeric"
			month="short"
			day="numeric"
		/>
		<span :class="footer ? 'text-toned' : 'text-default'">&middot;</span>
		<NuxtLink
			v-if="buildInfo.env === 'release'"
			:to="`https://github.com/wolfstar-project/wolfstar.rocks/releases/tag/v${buildInfo.version}`"
			target="_blank"
			rel="noopener noreferrer"
			:class="footer ? 'text-xs text-toned' : 'text-md text-default'"
			:aria-label="`View release v${buildInfo.version} on GitHub - opens in new tab`"
		>
			v{{ buildInfo.version }}
		</NuxtLink>
		<span
			v-else
			:class="footer ? 'text-xs text-toned' : 'text-md text-default'"
			class="tracking-wider"
			>{{ buildInfo.env }}</span
		>

		<template v-if="buildInfo.commit && buildInfo.branch !== 'release'">
			<span :class="footer ? 'text-toned' : 'text-default'">&middot;</span>
			<NuxtLink
				:to="`https://github.com/wolfstar-project/wolfstar.rocks/commit/${buildInfo.commit}`"
				target="_blank"
				rel="noopener noreferrer"
				:class="footer ? 'text-xs text-toned' : 'text-md text-default'"
				:aria-label="`View commit ${buildInfo.shortCommit} on GitHub - opens in new tab`"
			>
				{{ buildInfo.shortCommit }}
			</NuxtLink>
		</template>
	</div>
</template>
