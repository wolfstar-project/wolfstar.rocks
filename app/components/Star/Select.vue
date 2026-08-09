<template>
	<select
		class="select-bordered select w-full"
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
			:value="item.value === null ? '' : item.value"
			:disabled="item.disabled"
		>
			{{ item.label }}
		</option>
	</select>
</template>

<script setup lang="ts">
import type { SelectItem, SelectOption } from "#shared/types/ui";

type SelectModelValue = string | number | SelectOption | null;

const props = withDefaults(
	defineProps<{
		modelValue?: SelectModelValue;
		items?: SelectItem[] | Array<SelectOption | string | number | null | false | undefined>;
		options?: SelectItem[] | Array<SelectOption | string | number | null | false | undefined>;
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
	"change": [value: string | number | null];
}>();

function flattenItems(
	items: SelectItem[] | Array<SelectOption | string | number | null | false | undefined>,
): Array<SelectOption | string | number> {
	const result: Array<SelectOption | string | number> = [];
	for (const item of items) {
		if (item === null || item === undefined || item === false) continue;
		if (Array.isArray(item)) {
			result.push(...flattenItems(item));
			continue;
		}
		result.push(item);
	}
	return result;
}

function toSelectOption(item: SelectOption | string | number): SelectOption | null {
	if (typeof item === "string" || typeof item === "number") {
		return { label: String(item), value: item };
	}
	const record = item as unknown as Record<string, unknown>;
	const value = record[props.valueKey];
	const label = record[props.labelKey];
	if (typeof value !== "string" && typeof value !== "number" && value !== null) return null;
	return {
		disabled: Boolean(record.disabled),
		icon: typeof record.icon === "string" ? record.icon : undefined,
		label: typeof label === "string" ? label : String(value),
		value: value as string | number | null,
	};
}

const normalizedItems = computed<SelectOption[]>(() => {
	const source = props.items?.length ? props.items : (props.options ?? []);
	return flattenItems(source).flatMap((item) => {
		const option = toSelectOption(item);
		return option ? [option] : [];
	});
});

const normalizedValue = computed(() => {
	const model = props.modelValue;
	if (model === null || model === undefined) return "";
	if (typeof model === "object") return model.value === null ? "" : model.value;
	return model;
});

function onChange(event: Event) {
	const target = event.target;
	if (!(target instanceof HTMLSelectElement)) return;
	const raw = target.value;
	const matched = normalizedItems.value.find((item) => String(item.value ?? "") === raw);
	const value = matched ? matched.value : raw || null;
	emit("update:modelValue", value);
	emit("change", value);
}
</script>
