<template>
	<UFieldGroup class="w-full">
		<UInputNumber
			v-model="amount"
			:min="0"
			:step="1"
			:disabled="disabled"
			:aria-label="label"
			class="min-w-0 flex-1"
		/>
		<USelect
			v-model="unit"
			:items="unitItems"
			:disabled="disabled"
			:aria-label="ts('guild_settings.automod.rules.editor.duration_unit_aria', { label })"
			class="w-32"
		/>
	</UFieldGroup>
</template>

<script setup lang="ts">
import {
	DURATION_UNITS,
	joinDuration,
	splitDuration,
	type DurationUnit,
} from "~/utils/duration-units";

/** The duration in milliseconds; `0` when the field is empty. */
const milliseconds = defineModel<number>({ required: true });

const { label, disabled = false } = defineProps<{
	/** Accessible name of the amount field. */
	label: string;
	disabled?: boolean;
}>();

const { ts } = useI18n();

const UNIT_LABEL_KEYS: Record<DurationUnit, string> = {
	seconds: "select.seconds",
	minutes: "select.minutes",
	hours: "select.hours",
	days: "select.days",
};

const unitItems = computed(() =>
	DURATION_UNITS.map((value) => ({ label: ts(UNIT_LABEL_KEYS[value]), value })),
);

// The unit is the user's choice, so it is kept apart from the model: deriving
// it from the milliseconds would flip `60 seconds` to `1 minute` mid-typing.
const initial = splitDuration(milliseconds.value);
const amount = ref(initial.value);
const unit = ref<DurationUnit>(initial.unit);

watch([amount, unit], ([value, currentUnit]) => {
	milliseconds.value = joinDuration({ unit: currentUnit, value: value ?? 0 });
});

watch(milliseconds, (value) => {
	if (value === joinDuration({ unit: unit.value, value: amount.value ?? 0 })) return;
	const parts = splitDuration(value, unit.value);
	amount.value = parts.value;
	unit.value = parts.unit;
});
</script>
