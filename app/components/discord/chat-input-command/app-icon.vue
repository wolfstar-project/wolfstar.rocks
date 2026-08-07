<template>
	<span
		class="discord-slash-command-app-icon"
		:class="`discord-slash-command-app-icon-${size}`"
		aria-hidden="true"
	>
		<NuxtImg
			v-if="resolvedApp.avatar"
			:src="resolvedApp.avatar"
			:width="dimension"
			:height="dimension"
			alt=""
			class="discord-slash-command-app-icon-image"
		/>
		<UIcon
			v-else-if="resolvedApp.icon"
			:name="resolvedApp.icon"
			class="discord-slash-command-app-icon-glyph"
		/>
	</span>
</template>

<script lang="ts">
type SlashCommandAppIconSize = "header" | "rail" | "row";

interface SlashCommandAppIconProps {
	app: SlashCommandAppName;
	size?: SlashCommandAppIconSize;
}
</script>

<script setup lang="ts">
const Dimensions = {
	header: 16,
	rail: 32,
	row: 24,
} as const satisfies Record<SlashCommandAppIconSize, number>;

const { app, size = "row" } = defineProps<SlashCommandAppIconProps>();

const resolvedApp = computed(() => SlashCommandApps[app]);
const dimension = computed(() => Dimensions[size]);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.discord-slash-command-app-icon {
	--discord-slash-command-app-icon-bg: oklch(35.52% 0.0099 264.44);
	--discord-slash-command-app-icon-glyph: oklch(73.06% 0.0048 264.53);

	@apply inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full;
	background-color: var(--discord-slash-command-app-icon-bg);
}

.discord-slash-command-app-icon-header {
	@apply size-4;
}

.discord-slash-command-app-icon-rail {
	@apply size-8;
}

.discord-slash-command-app-icon-row {
	@apply size-6;
}

.discord-slash-command-app-icon-image {
	@apply size-full object-cover;
}

.discord-slash-command-app-icon-glyph {
	@apply size-1/2;
	color: var(--discord-slash-command-app-icon-glyph);
}
</style>
