<template>
	<SelectChannel
		:model-value="shared.kind === 'same' ? shared.channel : null"
		layout="row"
		:guild="guildData"
		:label
		:tooltip-title="help"
		:disabled="disabled || keys.length === 0"
		:empty-label="emptyLabel"
		@update:model-value="emit('apply', $event)"
	/>
</template>

<script setup lang="ts">
import type { SingleSettingKey } from "#shared/types";
import { sharedLogChannel } from "~/utils/log-channels";

/**
 * One channel picker for several logs at once. It shows their channel when
 * they all share one, "mixed channels" when they differ, and "not logged" when
 * none is logged; picking a channel, or clearing it, emits `apply` and leaves
 * the writing to the form that owns the logs.
 */
const {
	keys,
	values,
	label,
	help,
	disabled = false,
} = defineProps<{
	/** The logs the picker sets. */
	keys: readonly SingleSettingKey[];
	/** The current channel of each log, such as the settings form's state. */
	values: Readonly<Partial<Record<SingleSettingKey, string | null>>>;
	label: string;
	/** Read to screen readers after the label. */
	help?: string;
	disabled?: boolean;
}>();

const emit = defineEmits<{
	apply: [channel: string | null];
}>();

const { ts } = useI18n();
const { guildData } = useGuildData();

const shared = computed(() => sharedLogChannel(values, keys));

const emptyLabel = computed(() => {
	if (keys.length === 0) return ts("guild_settings.channels.bulk.no_logs_selected");
	return shared.value.kind === "mixed"
		? ts("guild_settings.channels.bulk.mixed")
		: ts("guild_settings.channels.not_logged");
});
</script>
