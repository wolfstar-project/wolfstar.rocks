<template>
	<span class="bot-tag">{{ ts("dashboard.dm.bot_tag") }}</span>
</template>

<script setup lang="ts">
/** The tag Discord sets after a bot's name. */
const { ts } = useI18n();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.bot-tag {
	@apply inline-flex h-4 shrink-0 items-center rounded-[4px] bg-primary px-1.25 text-[0.625rem] leading-none font-bold tracking-[0.02em] text-primary-content;
}
</style>
