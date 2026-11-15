<template>
	<SlashCommandAppIcon :size>
		<NuxtImg
			v-if="resolvedApp.avatar"
			:src="resolvedApp.avatar"
			:width="dimension"
			:height="dimension"
			alt=""
		/>
		<UIcon v-else-if="resolvedApp.icon" :name="resolvedApp.icon" />
	</SlashCommandAppIcon>
</template>

<script lang="ts">
type SlashCommandAppIconSize = "header" | "rail" | "row";

interface SlashCommandAppIconProps {
	app: SlashCommandAppName;
	size?: SlashCommandAppIconSize;
}
</script>

<script setup lang="ts">
import { SlashCommandAppIcon } from "~/components/ui/slash-command-suggestions";

const Dimensions = {
	header: 16,
	rail: 32,
	row: 24,
} as const satisfies Record<SlashCommandAppIconSize, number>;

const { app, size = "row" } = defineProps<SlashCommandAppIconProps>();

const resolvedApp = computed(() => SlashCommandApps[app]);
const dimension = computed(() => Dimensions[size]);
</script>
