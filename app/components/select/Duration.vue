<template>
	<div class="flex flex-col gap-1 mb-3">
		<div class="flex flex-wrap items-start gap-2">
			<UFormField :error="error || undefined">
				<UInput
					v-model="durationString"
					type="tel"
					placeholder="Duration"
					:color="error ? 'error' : 'primary'"
					@input="onChangeDuration"
				/>
			</UFormField>

			<USelect
				v-model="unit"
				:items="unitItems"
				value-key="value"
				label-key="label"
				class="w-32"
				@update:model-value="onChangeUnit"
			/>
		</div>

		<p v-if="error" class="text-sm text-error">
			{{ error }}
		</p>
	</div>
</template>

<script lang="ts">
const unitMap: Record<string, number> = {
	seconds: 1000,
	minutes: 1000 * 60,
	hours: 1000 * 60 * 60,
	days: 1000 * 60 * 60 * 24,
};

const unitEntries = Object.entries(unitMap);

function determineUnit(ms: number): readonly [number, string] {
	for (let i = 0; i < unitEntries.length; i++) {
		const next = unitEntries[i + 1];
		if (!next || ms < next[1] || i === unitEntries.length - 2) {
			return [Math.floor(ms / unitEntries[i][1]), unitEntries[i][0]] as const;
		}
	}

	return [Math.floor(ms / unitEntries[0][1]), unitEntries[0][0]] as const;
}

export interface SelectDurationProps {
	modelValue: number | null;
	min: number;
	max?: number;
}

interface Emits {
	(e: "update:modelValue", value: number): void;
}
</script>

<script setup lang="ts">
const { modelValue, min, max } = defineProps<SelectDurationProps>();
const emit = defineEmits<Emits>();

const unitItems = [
	{ label: "Seconds", value: "seconds" },
	{ label: "Minutes", value: "minutes" },
	{ label: "Hours", value: "hours" },
	{ label: "Days", value: "days" },
];

const [inputDuration, inputUnit] = determineUnit(modelValue ?? 0);
const unit = ref(inputUnit);
const duration = ref(inputDuration);
const error = ref("");

const durationString = computed({
	get: () => (Number.isNaN(duration.value) ? "" : String(duration.value)),
	set: (val: string) => {
		duration.value = Number.parseInt(val, 10);
	},
});

function validate(ms: number): boolean {
	if (ms < min) {
		const [val, u] = determineUnit(min);
		error.value = `The minimum duration is ${val} ${u}.`;
		return false;
	}

	if (typeof max === "number" && ms > max) {
		const [val, u] = determineUnit(max);
		error.value = `The maximum duration is ${val} ${u}.`;
		return false;
	}

	error.value = "";
	return true;
}

function onChangeDuration(event: Event) {
	const val = Number.parseInt((event.target as HTMLInputElement).value, 10);
	duration.value = val;
	const ms = val * unitMap[unit.value];
	if (validate(ms)) 
emit("update:modelValue", ms);
}

function onChangeUnit(newUnit: string) {
	unit.value = newUnit;
	const ms = unitMap[newUnit] * duration.value;
	if (validate(ms)) 
emit("update:modelValue", ms);
}
</script>
