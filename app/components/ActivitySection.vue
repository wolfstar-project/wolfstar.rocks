<template>
	<component
		:is="plain ? 'div' : GuildSettingsSection"
		v-bind="!plain ? { title, ui: { heading: 'text-xl font-bold tracking-wide' } } : {}"
	>
		<div
			:class="
				plain
					? 'flex items-center justify-between px-4 py-3'
					: 'mb-3 flex items-center justify-between'
			"
		>
			<p class="text-sm text-base-content/70">
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

const GuildSettingsSection = resolveComponent("GuildSettingsSection");

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
