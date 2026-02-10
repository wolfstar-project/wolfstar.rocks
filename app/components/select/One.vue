<template>
	<UModal :title="formattedLabel" :description>
		<UButton :label="buttonLabel" :disabled variant="soft" />

		<template #body>
			<SelectFieldWrapper :field-name :tooltip-title>
				<USelect v-model="selectedValue" :items :disabled value-key="value" label-key="label" :placeholder class="w-full">
					<template v-if="imageInName" #trailing>
						<UAvatar :src="imageInName" alt="Emoji" size="2xs" />
					</template>
				</USelect>

				<template #help>
					<div class="flex items-center justify-between gap-2">
						<UButton variant="ghost" color="error" size="sm" :disabled @click="handleReset"> Clear selected </UButton>
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

export interface SelectOneProps {
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
}

interface Emits {
	(e: "update:modelValue", value: string | null): void;
	(e: "change", value: string | null): void;
	(e: "reset"): void;
}
</script>

<script setup lang="ts">
const { name = "None", disabled = false, label, values, description, tooltipTitle, imageInName, modelValue } = defineProps<SelectOneProps>();

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

// Watchers for name are likely not needed if using modelValue, but keep for backward compat if name is used
watch(
	() => name,
	(newName) => {
		if (!modelValue) {
			// Direct update only if modelValue is not controlling it (though computed getter handles this)
		}
	},
);

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

// Button label shown in the trigger, e.g. "Member Add Logs: None"
const buttonLabel = computed(() => `${formattedLabel.value}: ${selectedLabel.value ?? "None"}`);
</script>
