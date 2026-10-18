<template>
	<div
		role="region"
		:aria-label="ts('guild_settings.channels.bulk.selection_region')"
		class="logs-selection-bar"
	>
		<p role="status" class="text-sm font-semibold whitespace-nowrap">
			{{ tc("guild_settings.channels.bulk.selected_count", keys.length) }}
		</p>
		<GuildSettingsLogsBulkChannel
			class="min-w-0 flex-1"
			:keys
			:values
			:label="ts('guild_settings.channels.bulk.selection_label')"
			:help="ts('guild_settings.channels.bulk.selection_help')"
			@apply="emit('apply', $event)"
		/>
		<div class="flex items-center gap-2">
			<UButton
				color="neutral"
				variant="outline"
				icon="heroicons:no-symbol"
				:disabled="keys.length === 0"
				@click="emit('apply', null)"
			>
				{{ ts("guild_settings.channels.bulk.remove_channel") }}
			</UButton>
			<UButton
				color="neutral"
				variant="ghost"
				icon="heroicons:x-mark"
				@click="emit('cancel')"
			>
				{{ ts("guild_settings.channels.bulk.cancel_selection") }}
			</UButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { SingleSettingKey } from "#shared/types";

/**
 * The actions of the mass-edit mode of the log channels: how many logs are
 * ticked, a picker that sets their channel, and the buttons that remove it or
 * leave the mode. It stays at the top of the page while the list scrolls.
 */
const { keys, values } = defineProps<{
	/** The ticked logs. */
	keys: readonly SingleSettingKey[];
	/** The current channel of each log, such as the settings form's state. */
	values: Readonly<Partial<Record<SingleSettingKey, string | null>>>;
}>();

const emit = defineEmits<{
	apply: [channel: string | null];
	cancel: [];
}>();

const { tc, ts } = useI18n();
</script>

<style scoped>
@reference "@/assets/css/main.css";

.logs-selection-bar {
	@apply sticky top-0 z-10 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[10px] py-2.5 pr-3 pl-4;
	background-color: var(--console-rail);
	border: 1px solid var(--console-border);
	box-shadow: var(--console-shadow-low, none);
}
</style>
