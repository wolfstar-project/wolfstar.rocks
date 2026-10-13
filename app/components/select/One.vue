<template>
	<div v-if="layout === 'row'" class="select-row">
		<label :for="rowId" class="select-row-label" :title="tooltipTitle">{{
			formattedLabel
		}}</label>
		<USelect
			:id="rowId"
			v-model="rowValue"
			:items="rowItems"
			:disabled
			value-key="value"
			label-key="label"
			:placeholder="rowPlaceholder"
			:aria-describedby="tooltipTitle ? `${rowId}-help` : undefined"
			class="select-row-control"
			:ui="selectRowUi"
		/>
		<span v-if="tooltipTitle" :id="`${rowId}-help`" class="sr-only">{{ tooltipTitle }}</span>
	</div>
	<div v-else-if="layout === 'field'" class="select-field">
		<label :for="rowId" class="select-field-label">{{ formattedLabel }}</label>
		<USelect
			:id="rowId"
			v-model="rowValue"
			:items="rowItems"
			:disabled
			value-key="value"
			label-key="label"
			:placeholder="rowPlaceholder"
			:aria-describedby="tooltipTitle ? `${rowId}-help` : undefined"
			:ui="selectFieldUi"
		/>
		<p v-if="tooltipTitle" :id="`${rowId}-help`" class="select-field-help">
			{{ tooltipTitle }}
		</p>
	</div>
	<UModal v-else :title="formattedLabel" :description>
		<UButton :label="buttonLabel" :disabled variant="soft" />

		<template #body>
			<SelectFieldWrapper :field-name :tooltip-title>
				<USelect
					v-model="selectedValue"
					:items
					:disabled
					value-key="value"
					label-key="label"
					:placeholder
					class="w-full"
				>
					<template v-if="imageInName" #trailing>
						<UAvatar :src="imageInName" alt="Emoji" size="2xs" />
					</template>
				</USelect>

				<template #help>
					<div class="flex items-center justify-between gap-2">
						<UButton
							variant="ghost"
							color="error"
							size="sm"
							:disabled
							@click="handleReset"
						>
							Clear selected
						</UButton>
					</div>
				</template>
			</SelectFieldWrapper>
		</template>
	</UModal>
</template>

<script lang="ts">
import { toTitleCase } from "@sapphire/utilities";

export interface SelectOneValue {
	/** The name to render */
	name: string;
	/** The value to emit */
	value: string;
	/** Optional icon to be shown next to the key (i.e. for emojis) */
	icon?: string;
}

interface SelectOption {
	label: string;
	value: string;
	icon?: string;
}

interface SelectOneProps {
	/** The label to show on the button */
	label: string;
	/** The name of the current value */
	name?: string;
	/** The model value (ID) */
	modelValue?: string | null;
	/** Array of values */
	values: SelectOneValue[];
	/** Optional description below the field */
	description?: string;
	/** Content to be shown as a tooltip when hovering over the button */
	tooltipTitle?: string;
	/** Whether to append an image to the end of the button, next to the value of the key */
	imageInName?: string;
	/** Disable the field */
	disabled?: boolean;
	/**
	 * `button` opens a dialog from a "Label: value" button; `row` shows the
	 * label with an inline select beside it, for settings lists.
	 *
	 * `field` stacks the label, a full-width select and the help text, for a
	 * setting that stands on its own in a card.
	 */
	layout?: "button" | "row" | "field";
	/** Text shown when nothing is selected in the `row` and `field` layouts */
	emptyLabel?: string;
}

interface Emits {
	(e: "update:modelValue", value: string | null): void;
	(e: "change", value: string | null): void;
	(e: "reset"): void;
}
</script>

<script setup lang="ts">
const {
	name = "None",
	disabled = false,
	label,
	values,
	description,
	tooltipTitle,
	imageInName,
	modelValue,
	layout = "button",
	emptyLabel,
} = defineProps<SelectOneProps>();

const emit = defineEmits<Emits>();

const selectedValue = computed({
	get: () => modelValue ?? resolveValueFromName(name),
	set: (val) => {
		// Allow null and string values (null = cleared)
		if (val !== undefined) {
			emit("update:modelValue", val);
			emit("change", val);
		}
	},
});

const items = computed<SelectOption[]>(() =>
	values.map((value) => ({
		icon: value.icon,
		label: value.name,
		value: value.value,
	})),
);

const formattedLabel = computed(() => toTitleCase(label));
const placeholder = computed(() => name || "None");
const fieldName = computed(() => label.trim().toLowerCase().replace(/\s+/g, "-"));

const selectedLabel = computed(() => {
	const current = items.value.find((item: SelectOption) => item.value === selectedValue.value);
	return current?.label;
});

function resolveValueFromName(name?: string) {
	if (!name) {
		return undefined;
	}

	const match = values.find((item: SelectOneValue) => item.name === name);
	return match?.value;
}

function handleReset() {
	emit("update:modelValue", null);
	emit("change", null);
	emit("reset");
}

// A select cannot hold `null`, so "nothing selected" is its own entry.
const NONE_VALUE = "__none__";
const rowId = useId();
const rowItems = computed<SelectOption[]>(() => [
	{ label: emptyLabel ?? "None", value: NONE_VALUE },
	...items.value,
]);
const rowValue = computed({
	get: () => (selectedValue.value as string | null | undefined) ?? NONE_VALUE,
	set: (val: string) => {
		const next = val === NONE_VALUE ? null : val;
		emit("update:modelValue", next);
		emit("change", next);
	},
});
const rowPlaceholder = computed(() => emptyLabel ?? "None");
// A fixed-width field like the design's, so a column of rows lines up. An
// unset row reads as a placeholder rather than as a chosen value.
const selectRowUi = computed(() => ({
	base: "h-8 w-37.5 rounded-[5px] bg-(--console-input)! text-[0.8125rem] ring-(--console-border)",
	value: rowValue.value === NONE_VALUE ? "text-muted" : "",
}));

const selectFieldUi = computed(() => ({
	base: "h-9 w-full rounded-[5px] bg-(--console-input)! text-sm ring-(--console-border)",
	value: rowValue.value === NONE_VALUE ? "text-muted" : "",
}));

// Button label shown in the trigger, e.g. "Member Add Logs: None"
const buttonLabel = computed(() => `${formattedLabel.value}: ${selectedLabel.value ?? "None"}`);
</script>

<style scoped>
@reference "@/assets/css/main.css";

.select-row {
	@apply flex min-h-9 items-center justify-between gap-4;
}

.select-row-label {
	@apply min-w-0 text-sm;
}

.select-field {
	@apply flex min-w-0 flex-col gap-1.5;
}

.select-field-label {
	@apply text-sm font-medium;
}

.select-field-help {
	@apply text-[0.8125rem] leading-normal text-muted;
}
</style>
