<template>
	<div class="relative w-full">
		<input
			v-if="searchEnabled"
			v-model="query"
			type="search"
			class="input input-bordered input-sm mb-2 w-full"
			:placeholder="searchPlaceholder"
			:disabled="disabled"
		/>
		<select
			class="select select-bordered w-full"
			:multiple="multiple"
			:disabled="disabled"
			:size="multiple ? Math.min(8, Math.max(3, filteredItems.length)) : undefined"
			:value="selectValue"
			@change="onChange"
		>
			<option v-if="!multiple && placeholder" value="" disabled>{{ placeholder }}</option>
			<option
				v-for="item in filteredItems"
				:key="String(item.value)"
				:value="String(item.value)"
				:disabled="item.disabled"
			>
				{{ item.label }}
			</option>
		</select>
		<slot name="trailing" />
	</div>
</template>

<script setup lang="ts">
import type { SelectOption } from "#shared/types/ui";

const props = withDefaults(
	defineProps<{
		modelValue?: string | number | Array<string | number> | null;
		items?: Array<SelectOption | string | number | null | false | undefined>;
		multiple?: boolean;
		valueKey?: string;
		labelKey?: string;
		searchInput?: boolean | { placeholder?: string };
		placeholder?: string;
		disabled?: boolean;
	}>(),
	{
		items: () => [],
		valueKey: "value",
		labelKey: "label",
		multiple: false,
	},
);

const emit = defineEmits<{
	"update:modelValue": [value: string | number | Array<string | number> | null];
}>();

const query = ref("");

const searchEnabled = computed(() => Boolean(props.searchInput));
const searchPlaceholder = computed(() =>
	typeof props.searchInput === "object" ? (props.searchInput.placeholder ?? "Search...") : "Search...",
);

const normalizedItems = computed<SelectOption[]>(() =>
	(props.items ?? []).flatMap((item) => {
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
				avatar: record.avatar as SelectOption["avatar"],
				disabled: Boolean(record.disabled),
				icon: typeof record.icon === "string" ? record.icon : undefined,
				label: typeof label === "string" ? label : String(value),
				value,
			},
		];
	}),
);

const filteredItems = computed(() => {
	const q = query.value.trim().toLowerCase();
	if (!q) return normalizedItems.value;
	return normalizedItems.value.filter((item) => item.label.toLowerCase().includes(q));
});

const selectValue = computed(() => {
	if (props.multiple) {
		return Array.isArray(props.modelValue) ? props.modelValue.map(String) : [];
	}
	if (props.modelValue === null || props.modelValue === undefined) return "";
	return String(props.modelValue);
});

function resolveValue(raw: string): string | number {
	const matched = normalizedItems.value.find((item) => String(item.value) === raw);
	return matched ? matched.value : raw;
}

function onChange(event: Event) {
	const target = event.target;
	if (!(target instanceof HTMLSelectElement)) return;
	if (props.multiple) {
		const selected = Array.from(target.selectedOptions).map((option) => resolveValue(option.value));
		emit("update:modelValue", selected);
		return;
	}
	emit("update:modelValue", target.value === "" ? null : resolveValue(target.value));
}
</script>
