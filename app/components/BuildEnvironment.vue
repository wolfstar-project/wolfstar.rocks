<script setup lang="ts">
import type { BuildInfo } from "#shared/types";

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
		class="motion-safe:animate-fill-both flex items-center gap-2 font-mono text-xs text-muted motion-safe:animate-fade-in"
		:class="footer ? 'mt-4 flex items-end gap-4' : 'mb-8 justify-center'"
		style="animation-delay: 0.05s"
	>
		<DateTime :datetime="buildTime" year="numeric" month="short" day="numeric" />
		<span>&middot;</span>
		<NuxtLink
			v-if="buildInfo.env === 'release'"
			:to="`https://github.com/wolfstar-project/wolfstar.rocks/releases/tag/v${buildInfo.version}`"
			target="_blank"
			rel="noopener noreferrer"
			:class="footer ? 'text-sm text-base-content/80' : undefined"
			:aria-label="`View release v${buildInfo.version} on GitHub - opens in new tab`"
		>
			v{{ buildInfo.version }}
		</NuxtLink>
		<span v-else class="tracking-wider">{{ buildInfo.env }}</span>

		<template v-if="buildInfo.commit && buildInfo.branch !== 'release'">
			<span>&middot;</span>
			<NuxtLink
				:to="`https://github.com/wolfstar-project/wolfstar.rocks/commit/${buildInfo.commit}`"
				target="_blank"
				rel="noopener noreferrer"
				:class="footer ? 'text-sm text-base-content/80' : undefined"
				:aria-label="`View commit ${buildInfo.shortCommit} on GitHub - opens in new tab`"
			>
				{{ buildInfo.shortCommit }}
			</NuxtLink>
		</template>
	</div>
</template>
