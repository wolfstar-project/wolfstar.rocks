<template>
	<textarea
		class="textarea textarea-bordered w-full"
		:value="modelValue"
		:placeholder="placeholder"
		:disabled="disabled"
		:rows="rows"
		:name="name"
		v-bind="$attrs"
		@input="onInput"
	/>
</template>

<script setup lang="ts">
withDefaults(
	defineProps<{
		modelValue?: string | null;
		placeholder?: string;
		disabled?: boolean;
		rows?: number;
		name?: string;
	}>(),
	{
		modelValue: "",
		rows: 3,
	},
);

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

function onInput(event: Event) {
	const target = event.target;
	if (!(target instanceof HTMLTextAreaElement)) return;
	emit("update:modelValue", target.value);
}
</script>
