<template>
	<UFormField
		:name="name"
		:label="labelHidden ? undefined : label"
		:ui="{ label: 'text-sm font-medium' }"
	>
		<URadioGroup
			:model-value="String(value)"
			:items="items"
			variant="card"
			:orientation="orientation"
			:disabled="disabled"
			:aria-label="label"
			:ui="{
				fieldset: fieldsetClass,
				item: 'rounded-lg',
				description: 'text-[0.8125rem] leading-snug',
			}"
			@update:model-value="select"
		/>
	</UFormField>
</template>

<script setup lang="ts" generic="Key extends ChoiceSettingKey">
import type { GuildData } from "#server/database";
import type { ChoiceSettingKey } from "#shared/utils/settings-choices";

const value = defineModel<GuildData[Key]>({ required: true });

const {
	name,
	label,
	options,
	orientation = "horizontal",
	disabled = false,
	labelHidden = false,
} = defineProps<{
	/** The `GuildData` key the choice edits, used as the form field name. */
	name: Key;
	label: string;
	/** Each word the setting takes, with the copy that explains it. */
	options: readonly { value: GuildData[Key]; label: string; description: string }[];
	orientation?: "horizontal" | "vertical";
	/** Shows the choice without letting it change, for a setting only the bot edits. */
	disabled?: boolean;
	/** Leaves the label to screen readers, when the card's heading already says it. */
	labelHidden?: boolean;
}>();

// Side by side from the width where each card still reads in a few lines: two
// from `sm`, three from `md`.
const fieldsetClass = computed(() => {
	if (orientation === "vertical") {
		return "gap-2.5";
	}
	return options.length > 2 ? "grid gap-2.5 md:grid-cols-3" : "grid gap-2.5 sm:grid-cols-2";
});

// The radio group works with the words as plain strings; the option they
// name carries the typed value the setting stores.
const items = computed(() =>
	options.map((option) => ({
		description: option.description,
		label: option.label,
		value: String(option.value),
	})),
);

function select(next: unknown) {
	const option = options.find((candidate) => String(candidate.value) === next);
	if (option) value.value = option.value;
}
</script>
