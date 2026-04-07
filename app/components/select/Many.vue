<template>
	<UModal :title="formattedLabel" :description>
		<UButton :label="buttonLabel" :disabled variant="soft" />
		<template #body>
			<SelectFieldWrapper :field-name :tooltip-title>
				<USelectMenu
					v-model="selectedValues"
					:items
					:disabled
					multiple
					value-key="value"
					label-key="label"
					:search-input
					:placeholder
					class="w-full"
				>
					<template v-if="imageInName" #trailing>
						<UAvatar :src="imageInName" alt="Emoji" size="2xs" />
					</template>
				</USelectMenu>

				<template #help>
					<div class="flex items-center justify-between gap-2">
						<UBadge color="neutral" variant="subtle" size="sm">
							{{ selectedValues.length }} selected
						</UBadge>

						<UButton
							variant="ghost"
							color="error"
							size="sm"
							:disabled="disabled || selectedValues.length === 0"
							@click="clearSelected"
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
import type { SelectItem } from "@nuxt/ui";
import { isNullOrUndefined, isNumber, toTitleCase } from "@sapphire/utilities";

export interface SelectManyValue {
	/** The name to render */
	name: string;
	/** The value to emit */
	value: string;
	/** Optional icon to be shown next to the key (i.e. for emojis) */
	icon?: string;
}

interface SelectManyProps {
	/** The label to show on the button */
	label: string;
	/** The name of the current value (summary text) */
	name?: string | number;
	/** Array of values */
	values: SelectManyValue[];
	/** Selected values */
	modelValue?: string[];
	/** Optional description below the field */
	description?: string;
	/** Content to be shown as a tooltip when hovering over the button */
	tooltipTitle?: string;
	/** Whether to append an image to the end of the button, next to the value of the key */
	imageInName?: string;
	/** Disable the field */
	disabled?: boolean;
}

interface Emits {
	(e: "update:modelValue", value: string[]): void;
	(e: "change", value: string[]): void;
}
</script>

<script setup lang="ts">
// oxlint-disable no-ternary
// oxlint-disable no-nested-ternary
const {
	name = "None",
	disabled = false,
	modelValue = [],
	values,
	label,
	tooltipTitle,
	description,
	imageInName,
} = defineProps<SelectManyProps>();

const emit = defineEmits<Emits>();

const selectedValues = computed({
	get: () => modelValue,
	set: (val) => {
		emit("update:modelValue", val);
		emit("change", val);
	},
});

const items = computed<SelectItem[]>(() =>
	values.map((value) => ({
		icon: value.icon,
		label: value.name,
		value: value.value,
	})),
);

const formattedLabel = computed(() => toTitleCase(label));
const placeholder = computed(() =>
	isNumber(name)
		? name.toString()
		: (name ??
			(selectedValues.value.length ? `${selectedValues.value.length} selected` : "None")),
);
const fieldName = computed(() => label.trim().toLowerCase().replace(/\s+/g, "-"));
const searchInput = computed(() => (values.length > 10 ? { placeholder: "Search..." } : false));

// Button label shown in the trigger, e.g. "Member Add Logs: None" or count
const buttonLabel = computed(() => {
	const summary = !isNullOrUndefined(name)
		? isNumber(name)
			? String(name)
			: name
		: selectedValues.value.length
			? `${selectedValues.value.length}`
			: "None";
	return `${formattedLabel.value}: ${summary}`;
});

function clearSelected() {
	selectedValues.value = [];
}
</script>
