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
import type { SelectItem, SelectOption } from "#shared/types/ui";

type SelectModelValue = string | number | SelectOption | Array<string | number | SelectOption> | null;

const props = withDefaults(
	defineProps<{
		modelValue?: SelectModelValue;
		items?: SelectItem[] | Array<SelectOption | string | number | null | false | undefined>;
		multiple?: boolean;
		valueKey?: string;
		/** Alias for valueKey (Nuxt UI / older call sites). */
		valueAttribute?: string;
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
	"update:modelValue": [value: SelectModelValue];
}>();

const query = ref("");

const resolvedValueKey = computed(() => props.valueAttribute ?? props.valueKey);

const searchEnabled = computed(() => Boolean(props.searchInput));
const searchPlaceholder = computed(() =>
	typeof props.searchInput === "object" ? (props.searchInput.placeholder ?? "Search...") : "Search...",
);

function flattenItems(items: SelectItem[] | Array<SelectOption | string | number | null | false | undefined>): Array<SelectOption | string | number> {
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
	const value = record[resolvedValueKey.value];
	const label = record[props.labelKey];
	if (typeof value !== "string" && typeof value !== "number" && value !== null) return null;
	return {
		avatar: record.avatar as SelectOption["avatar"],
		disabled: Boolean(record.disabled),
		icon: typeof record.icon === "string" ? record.icon : undefined,
		label: typeof label === "string" ? label : String(value),
		value: value as string | number | null,
	};
}

const normalizedItems = computed<SelectOption[]>(() =>
	flattenItems(props.items ?? []).flatMap((item) => {
		const option = toSelectOption(item);
		return option ? [option] : [];
	}),
);

const filteredItems = computed(() => {
	const q = query.value.trim().toLowerCase();
	if (!q) return normalizedItems.value;
	return normalizedItems.value.filter((item) => item.label.toLowerCase().includes(q));
});

function modelPrimitive(value: string | number | SelectOption | null | undefined): string {
	if (value === null || value === undefined) return "";
	if (typeof value === "object") return String(value.value);
	return String(value);
}

const selectValue = computed(() => {
	if (props.multiple) {
		return Array.isArray(props.modelValue) ? props.modelValue.map(modelPrimitive) : [];
	}
	return modelPrimitive(props.modelValue as string | number | SelectOption | null | undefined);
});

function shouldEmitObject(): boolean {
	const model = props.modelValue;
	if (Array.isArray(model)) {
		return model.some((entry) => entry !== null && typeof entry === "object");
	}
	if (model !== null && model !== undefined && typeof model === "object") return true;
	if (model === null || model === undefined) {
		return normalizedItems.value.length > 0;
	}
	return false;
}

function resolveMatched(raw: string): SelectOption | undefined {
	return normalizedItems.value.find((item) => String(item.value) === raw);
}

function emitResolved(raw: string) {
	if (raw === "") {
		emit("update:modelValue", null);
		return;
	}
	const matched = resolveMatched(raw);
	if (shouldEmitObject()) {
		emit("update:modelValue", matched ?? { label: raw, value: raw });
		return;
	}
	emit("update:modelValue", matched ? matched.value : raw);
}

function onChange(event: Event) {
	const target = event.target;
	if (!(target instanceof HTMLSelectElement)) return;
	if (props.multiple) {
		const selectedRaws = Array.from(target.selectedOptions).map((option) => option.value);
		if (shouldEmitObject()) {
			emit(
				"update:modelValue",
				selectedRaws.map((raw) => resolveMatched(raw) ?? { label: raw, value: raw }),
			);
			return;
		}
		emit(
			"update:modelValue",
			selectedRaws.map((raw) => {
				const matched = resolveMatched(raw);
				if (!matched || matched.value === null) return raw;
				return matched.value;
			}),
		);
		return;
	}
	emitResolved(target.value);
}
</script>
