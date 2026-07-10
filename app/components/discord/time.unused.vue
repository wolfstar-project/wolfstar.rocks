<template>
	<span class="discord-message-time">{{ formatter.format(date) }}</span>
</template>

<script lang="ts">
type TimeFormat = "long";

interface TimeUnusedProps {
	date?: number;
	format: TimeFormat;
}
</script>

<script setup lang="ts">
const { date = Date.now(), format } = defineProps<TimeUnusedProps>();

const TimeFormatters = {
	long: new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "short" }),
} as const;

const formatter = computed(() => TimeFormatters[format]);
</script>

<style scoped>
@reference "@/assets/css/main.css";
.discord-message-time {
	@apply rounded-md bg-base-content/10 px-0.5;
}
</style>
