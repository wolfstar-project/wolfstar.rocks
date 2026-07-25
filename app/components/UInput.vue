<template>
	<label class="input input-bordered flex w-full items-center gap-2" :class="[inputSizeClass(size), color && isSemanticColor(color) ? `input-${color}` : '']">
		<Icon v-if="icon" :name="icon" class="size-4 opacity-60" aria-hidden="true" />
		<input
			:id="id"
			:type="type"
			:value="modelValue"
			:placeholder="placeholder"
			:disabled="disabled"
			:name="name"
			:aria-invalid="ariaInvalid"
			class="grow bg-transparent outline-none"
			v-bind="$attrs"
			@input="onInput"
		/>
		<slot name="trailing" />
	</label>
</template>

<script setup lang="ts">
import { inputSizeClass, isSemanticColor, type UiSize } from "~/utils/ui-classes";

defineOptions({ inheritAttrs: false });

withDefaults(
	defineProps<{
		modelValue?: string | number | null;
		type?: string;
		placeholder?: string;
		disabled?: boolean;
		icon?: string;
		size?: UiSize;
		color?: string;
		name?: string;
		id?: string;
		ariaInvalid?: boolean | "true" | "false";
	}>(),
	{
		type: "text",
		size: "md",
		modelValue: "",
	},
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

function onInput(event: Event) {
	const target = event.target;
	if (!(target instanceof HTMLInputElement)) return;
	emit("update:modelValue", target.value);
}
</script>
