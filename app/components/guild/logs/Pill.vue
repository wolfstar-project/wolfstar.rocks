<template>
	<span class="logs-pill" :class="`logs-pill--${tone}`">
		<span class="logs-pill-dot" aria-hidden="true"></span>
		<slot />
	</span>
</template>

<script setup lang="ts">
export type LogsPillTone = "error" | "warning" | "success" | "primary" | "neutral";

const { tone = "neutral" } = defineProps<{
	tone?: LogsPillTone;
}>();
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* A tinted tag with a dot of its own colour. The text stays body-coloured, so
   the tone is carried by the dot and the border, never by the text alone. */
.logs-pill {
	@apply inline-flex h-6 items-center gap-1.5 rounded-[4px] px-2 text-[0.8125rem] font-medium whitespace-nowrap;
	background-color: color-mix(in oklab, var(--logs-pill-tone) 18%, transparent);
	border: 1px solid color-mix(in oklab, var(--logs-pill-tone) 45%, transparent);
}

.logs-pill-dot {
	@apply size-1.75 shrink-0 rounded-full;
	background-color: var(--logs-pill-tone);
}

.logs-pill--error {
	--logs-pill-tone: var(--color-error);
}

.logs-pill--warning {
	--logs-pill-tone: var(--color-warning);
}

.logs-pill--success {
	--logs-pill-tone: var(--color-success);
}

.logs-pill--primary {
	--logs-pill-tone: var(--color-primary);
}

.logs-pill--neutral {
	--logs-pill-tone: var(--ui-text-muted);
}
</style>
