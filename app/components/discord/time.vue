<template>
  <span class="discord-message-time">{{ formatter.format(date) }}</span>
</template>

<script setup lang="ts">
const { date = Date.now(), format } = defineProps<{ date?: number; format: keyof typeof TimeFormatters }>();

const TimeFormatters = {
  long: new Intl.DateTimeFormat("en-US", { dateStyle: "full", timeStyle: "short" }),
};

const formatter = computed(() => TimeFormatters[format]);
</script>

<style scoped>
@reference "@/assets/css/main.css";
.discord-message-time {
	@apply rounded-md bg-base-content/10 px-0.5;
}
</style>
