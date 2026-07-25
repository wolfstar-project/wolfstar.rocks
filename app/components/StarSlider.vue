<template>
	<SliderRoot
		v-model="model"
		:min="min"
		:max="max"
		:step="step"
		:disabled="disabled"
		class="relative flex w-full touch-none items-center py-2 select-none"
		:class="{ 'opacity-50': disabled }"
	>
		<SliderTrack class="relative h-2 w-full grow overflow-hidden rounded-full bg-base-300">
			<SliderRange class="absolute h-full bg-primary" />
		</SliderTrack>
		<SliderThumb
			v-for="(_, index) in thumbCount"
			:key="index"
			class="block size-4 rounded-full border-2 border-primary bg-base-100 shadow focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
			:aria-label="`Value ${index + 1}`"
		/>
	</SliderRoot>
</template>

<script setup lang="ts">
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from "reka-ui";

const props = withDefaults(
	defineProps<{
		modelValue?: number | number[];
		min?: number;
		max?: number;
		step?: number;
		disabled?: boolean;
	}>(),
	{
		min: 0,
		max: 100,
		step: 1,
		modelValue: 0,
	},
);

const emit = defineEmits<{ "update:modelValue": [value: number | number[]] }>();

const isArray = computed(() => Array.isArray(props.modelValue));

const model = computed({
	get: () => (isArray.value ? (props.modelValue as number[]) : [Number(props.modelValue ?? 0)]),
	set: (value: number[]) => {
		if (isArray.value) {
			emit("update:modelValue", value);
			return;
		}
		const first = value[0];
		emit("update:modelValue", first ?? props.min);
	},
});

const thumbCount = computed(() => model.value.length || 1);
</script>
