<template>
	<section class="console-card">
		<div class="mb-3.5 flex items-center justify-between gap-3">
			<div class="flex min-w-0 items-center gap-2.5">
				<h3 class="truncate text-[1.0625rem] font-semibold">{{ title }}</h3>
				<span class="activity-count">{{ total }}</span>
			</div>
			<UButton
				color="neutral"
				variant="ghost"
				icon="heroicons:arrow-path"
				size="xs"
				:loading="status === 'pending'"
				:aria-label="refreshLabel"
				@click="emit('refresh')"
			/>
		</div>

		<LoadingSpinner v-if="status === 'pending' && itemCount === 0" />
		<!-- Quiet is worth a glance, not an alarm: nothing changed, and the line
		     under it says when something last did. -->
		<div v-else-if="itemCount === 0" class="activity-quiet" role="status">
			<span class="activity-quiet-icon" aria-hidden="true">
				<UIcon name="ic:round-warning" class="size-4.5" />
			</span>
			<div class="min-w-0">
				<p class="text-[0.9375rem] font-bold">{{ emptyTitle }}</p>
				<p class="mt-0.5 text-[0.8125rem] leading-normal text-toned">
					{{ emptyDescription }}
				</p>
				<p v-if="emptyNote" class="mt-2 text-xs text-muted">{{ emptyNote }}</p>
			</div>
		</div>
		<slot v-else />
	</section>
</template>

<script setup lang="ts">
type AsyncDataStatus = "idle" | "pending" | "success" | "error";

const { title, total, status, itemCount, emptyTitle, emptyDescription, emptyNote, refreshLabel } =
	defineProps<{
		title: string;
		/** Entries the log holds for the period shown, which the badge counts. */
		total: number;
		status: AsyncDataStatus;
		/** Entries on screen. */
		itemCount: number;
		emptyTitle: string;
		emptyDescription: string;
		/** A last line for the empty state, such as when the log last moved. */
		emptyNote?: string;
		refreshLabel: string;
	}>();

const emit = defineEmits<{
	refresh: [];
}>();
</script>

<style scoped>
@reference "@/assets/css/main.css";

/* The design system's soft primary badge: a blurple tint with the count in the
   same hue. The light theme uses body text, which the tint cannot carry. */
.activity-count {
	@apply inline-flex h-5.5 min-w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 px-2.5 text-xs font-semibold text-primary theme-light:text-default;
}

.activity-quiet {
	@apply flex items-start gap-3.5 rounded-[8px] px-4.5 py-4;
	background-color: color-mix(in oklab, var(--color-warning) 16%, transparent);
	border: 1px solid color-mix(in oklab, var(--color-warning) 45%, transparent);
}

.activity-quiet-icon {
	@apply mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full text-warning theme-light:text-default;
	background-color: color-mix(in oklab, var(--color-warning) 28%, transparent);
}
</style>
