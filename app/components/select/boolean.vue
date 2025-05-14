<template>
	<SelectBase
		:label="title"
		:options="options"
		:model-value="modelValue ? 'true' : 'false'"
		:error="error"
		:helper-text="description"
		:name="name"
		:tooltip-title="tooltipTitle"
		:required="true"
		@update:model-value="handleChange"
	/>
</template>

<script setup lang="ts">
interface Props {
	title: string;
	modelValue: boolean | null;
	description?: string;
	error?: boolean;
	name?: string;
	tooltipTitle?: string;
}

withDefaults(defineProps<Props>(), {
	name: () => `boolean-${Math.random().toString(36).slice(2)}`,
	tooltipTitle: undefined,
	error: false,
	description: undefined
});

const emit = defineEmits<{
	(e: 'update:modelValue' | 'change', value: boolean): void;
}>();

const options = [
	{ label: 'Yes', value: 'true' },
	{ label: 'No', value: 'false' }
];

function handleChange(value: string) {
	const boolValue = value === 'true';
	emit('update:modelValue', boolValue);
	emit('change', boolValue);
}
</script>
