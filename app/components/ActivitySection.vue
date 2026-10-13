<template>
	<component :is="plain ? 'div' : 'section'" :class="plain ? undefined : 'console-card'">
		<div
			:class="
				plain
					? 'flex items-center justify-between px-4 py-3'
					: 'mb-3.5 flex items-center justify-between gap-3'
			"
		>
			<div v-if="!plain" class="flex min-w-0 items-center gap-2.5">
				<h3 class="truncate text-[1.0625rem] font-semibold">{{ title }}</h3>
				<span class="activity-count">{{ total }}</span>
			</div>
			<p v-else class="text-sm text-toned">
				{{ itemCount }} {{ recordLabel }}{{ itemCount === 1 ? "" : "s" }} recorded
			</p>
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
		<UEmpty
			v-else-if="itemCount === 0"
			:icon="emptyIcon"
			:title="emptyTitle"
			:description="emptyDescription"
		/>
		<div v-else class="space-y-4">
			<slot />
		</div>

		<div v-if="total > maxVisible" class="mt-2 text-center">
			<slot name="viewAll" />
		</div>
	</component>
</template>

<script setup lang="ts">
type AsyncDataStatus = "idle" | "pending" | "success" | "error";

const {
	title,
	total,
	status,
	itemCount,
	maxVisible = 5,
	plain = false,
	recordLabel = "change",
	emptyIcon,
	emptyTitle,
	emptyDescription,
	refreshLabel,
} = defineProps<{
	title?: string;
	total: number;
	status: AsyncDataStatus;
	itemCount: number;
	maxVisible?: number;
	plain?: boolean;
	recordLabel?: string;
	emptyIcon?: string;
	emptyTitle?: string;
	emptyDescription?: string;
	refreshLabel?: string;
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
</style>
