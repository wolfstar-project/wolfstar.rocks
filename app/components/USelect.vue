<template>
	<select
		class="select select-bordered w-full"
		:value="normalizedValue"
		:disabled="disabled"
		:name="name"
		v-bind="$attrs"
		@change="onChange"
	>
		<option v-if="placeholder" disabled value="">{{ placeholder }}</option>
		<option
			v-for="item in normalizedItems"
			:key="String(item.value)"
			:value="item.value"
			:disabled="item.disabled"
		>
			{{ item.label }}
		</option>
	</select>
</template>

<script setup lang="ts">
import type { SelectOption } from "#shared/types/ui";

const props = withDefaults(
	defineProps<{
		modelValue?: string | number | null;
		items?: Array<SelectOption | string | number>;
		options?: Array<SelectOption | string | number>;
		disabled?: boolean;
		placeholder?: string;
		name?: string;
		valueKey?: string;
		labelKey?: string;
	}>(),
	{
		items: () => [],
		valueKey: "value",
		labelKey: "label",
	},
);

const emit = defineEmits<{
	"update:modelValue": [value: string | number | null];
	change: [value: string | number | null];
}>();

const normalizedItems = computed<SelectOption[]>(() => {
	const source = props.items?.length ? props.items : (props.options ?? []);
	return source.flatMap((item) => {
		if (item === null || item === undefined || item === false) return [];
		if (typeof item === "string" || typeof item === "number") {
			return [{ label: String(item), value: item }];
		}
		const record = item as Record<string, unknown>;
		const value = record[props.valueKey];
		const label = record[props.labelKey];
		if (typeof value !== "string" && typeof value !== "number") return [];
		return [
			{
				disabled: Boolean(record.disabled),
				icon: typeof record.icon === "string" ? record.icon : undefined,
				label: typeof label === "string" ? label : String(value),
				value,
			},
		];
	});
});

const normalizedValue = computed(() =>
	props.modelValue === null || props.modelValue === undefined ? "" : props.modelValue,
);

function onChange(event: Event) {
	const target = event.target;
	if (!(target instanceof HTMLSelectElement)) return;
	const raw = target.value;
	const matched = normalizedItems.value.find((item) => String(item.value) === raw);
	const value = matched ? matched.value : raw || null;
	emit("update:modelValue", value);
	emit("change", value);
}
</script>
