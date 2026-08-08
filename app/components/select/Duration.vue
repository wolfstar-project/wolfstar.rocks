<template>
	<div class="mb-3 gap-1 flex flex-col">
		<div class="gap-2 flex flex-wrap items-start">
			<StarFormField :error="error || undefined">
				<StarInput
					v-model="durationString"
					type="tel"
					placeholder="10"
					:color="error ? 'error' : 'primary'"
					@input="onChangeDuration"
				/>
			</StarFormField>

			<StarSelect
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
			const entry = unitEntries[i]!;
			return [Math.floor(ms / entry[1]), entry[0]] as const;
		}
	}

	const first = unitEntries[0]!;
	return [Math.floor(ms / first[1]), first[0]] as const;
}

interface SelectDurationProps {
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
const { t } = useI18n();

const unitItems = computed(() => [
	{ label: t("select.seconds"), value: "seconds" },
	{ label: t("select.minutes"), value: "minutes" },
	{ label: t("select.hours"), value: "hours" },
	{ label: t("select.days"), value: "days" },
]);

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

function localizedUnit(unitKey: string): string {
	switch (unitKey) {
		case "seconds":
			return t("select.seconds");
		case "minutes":
			return t("select.minutes");
		case "hours":
			return t("select.hours");
		case "days":
			return t("select.days");
		default:
			return unitKey;
	}
}

function validate(ms: number): boolean {
	if (ms < min) {
		const [val, u] = determineUnit(min);
		error.value = t("select.min_duration", { value: val, unit: localizedUnit(u) });
		return false;
	}

	if (typeof max === "number" && ms > max) {
		const [val, u] = determineUnit(max);
		error.value = t("select.max_duration", { value: val, unit: localizedUnit(u) });
		return false;
	}

	error.value = "";
	return true;
}

function onChangeDuration(event: Event) {
	const val = Number.parseInt((event.target as HTMLInputElement).value, 10);
	duration.value = val;
	const ms = val * unitMap[unit.value]!;
	if (validate(ms)) emit("update:modelValue", ms);
}

function onChangeUnit(newUnit: string | number | null) {
	const nextUnit = String(newUnit ?? unit.value);
	unit.value = nextUnit;
	const ms = unitMap[nextUnit]! * duration.value;
	if (validate(ms)) emit("update:modelValue", ms);
}
</script>
