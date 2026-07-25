<template>
	<input
		type="checkbox"
		class="toggle"
		:class="color && isSemanticColor(color) ? `toggle-${color}` : 'toggle-primary'"
		:checked="Boolean(modelValue)"
		:disabled="disabled"
		:aria-label="ariaLabel"
		@change="onChange"
	/>
</template>

<script setup lang="ts">
import { isSemanticColor } from "~/utils/ui-classes";

withDefaults(
	defineProps<{
		modelValue?: boolean | null;
		disabled?: boolean;
		color?: string;
		ariaLabel?: string;
		value?: string;
		defaultValue?: boolean;
	}>(),
	{
		color: "primary",
		modelValue: false,
	},
);

const emit = defineEmits<{ "update:modelValue": [value: boolean] }>();

function onChange(event: Event) {
	const target = event.target;
	if (!(target instanceof HTMLInputElement)) return;
	emit("update:modelValue", target.checked);
}
</script>
