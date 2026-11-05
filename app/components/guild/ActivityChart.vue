<template>
	<div class="activity-chart">
		<!-- One image for assistive technology: the label says every day and its count. -->
		<div role="img" :aria-label="label" class="activity-plot">
			<div v-for="bar in bars" :key="bar.key" class="activity-column">
				<span class="activity-value">{{ bar.value }}</span>
				<div
					class="activity-bar"
					:class="{ 'activity-bar--top': bar.isTop }"
					:style="{ '--activity-ratio': bar.ratio }"
				/>
			</div>
		</div>
		<div class="activity-days" aria-hidden="true">
			<span v-for="bar in bars" :key="bar.key">{{ bar.label }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ModerationActivityDay } from "~/utils/moderation-activity";

const { days, label, formatCount } = defineProps<{
	days: readonly ModerationActivityDay[];
	/** What the chart says to assistive technology: every day and its count. */
	label: string;
	formatCount: (value: number) => string;
}>();

// Bars are scaled to the busiest day, which stands out in the full colour.
const bars = computed(() => {
	const most = Math.max(0, ...days.map((day) => day.count));
	return days.map((day) => ({
		key: day.key,
		label: day.label,
		value: formatCount(day.count),
		ratio: most === 0 ? 0 : day.count / most,
		isTop: most > 0 && day.count === most,
	}));
});
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* The mockup's plot and tallest bar at each width: phone, foldable, tablet, desktop. */
.activity-chart {
	--activity-plot: 120px;
	--activity-bar-max: 82px;
	--activity-gap: 6px;
}

@variant sm {
	.activity-chart {
		--activity-plot: 130px;
		--activity-bar-max: 92px;
		--activity-gap: 8px;
	}
}

@variant md {
	.activity-chart {
		--activity-plot: 160px;
		--activity-bar-max: 120px;
		--activity-gap: 12px;
	}
}

@variant lg {
	.activity-chart {
		--activity-plot: 180px;
		--activity-bar-max: 140px;
		--activity-gap: 14px;
	}
}

.activity-plot {
	@apply flex items-end border-b pb-2;
	height: var(--activity-plot);
	gap: var(--activity-gap);
	border-color: var(--ui-border);
}

.activity-column {
	@apply flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5;
}

.activity-value {
	@apply font-mono text-[0.6875rem] text-toned;
}

.activity-bar {
	@apply w-full max-w-11 rounded-t-sm;
	height: calc(var(--activity-bar-max) * var(--activity-ratio));
	background-color: color-mix(in srgb, var(--color-primary) 45%, var(--field-surface));
}

.activity-bar--top {
	background-color: var(--color-primary);
}

.activity-days {
	@apply flex pt-2;
	gap: var(--activity-gap);
}

.activity-days span {
	@apply min-w-0 flex-1 text-center font-mono text-[0.6875rem] text-muted;
}
</style>
