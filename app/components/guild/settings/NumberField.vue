<template>
	<UFormField
		:name="name"
		:label="label"
		:help="description"
		:ui="{
			label: 'text-sm font-medium',
			help: 'mt-1.5 text-[0.8125rem] leading-normal text-muted',
		}"
	>
		<div class="flex items-center gap-2">
			<UInputNumber
				:model-value="value"
				:min="range.minimum"
				:max="range.maximum"
				:step="1"
				class="w-32"
				@update:model-value="update"
			/>
			<span v-if="unit" class="text-sm text-muted">{{ unit }}</span>
		</div>
	</UFormField>
</template>

<script setup lang="ts">
import {
	clampSettingNumber,
	SETTING_NUMBER_RANGES,
	type NumberSettingKey,
} from "#shared/utils/settings-choices";

const value = defineModel<number>({ required: true });

const { name, label, description, unit } = defineProps<{
	/** The `GuildData` key the field edits, used as the form field name. */
	name: NumberSettingKey;
	label: string;
	description: string;
	/** What the number counts, written after the input. */
	unit?: string;
}>();

const range = computed(() => SETTING_NUMBER_RANGES[name]);

// A cleared input reads as the smallest value, and anything typed past the
// ends of the range is held to them, as the bot would refuse it.
function update(next: number | null | undefined) {
	value.value = clampSettingNumber(name, next);
}
</script>
