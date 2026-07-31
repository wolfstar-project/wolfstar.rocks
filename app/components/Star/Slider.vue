<template>
	<SliderRoot
		v-model="model"
		:min="min"
		:max="max"
		:step="step"
		:disabled="disabled"
		class="py-2 relative flex w-full touch-none items-center select-none"
		:class="{ 'opacity-50': disabled }"
	>
		<SliderTrack class="h-2 bg-base-300 relative w-full grow overflow-hidden rounded-full">
			<SliderRange class="bg-primary absolute h-full" />
		</SliderTrack>
		<SliderThumb
			v-for="(_, index) in thumbCount"
			:key="index"
			class="size-4 border-primary bg-base-100 shadow focus-visible:ring-primary block rounded-full border-2 focus-visible:ring-2 focus-visible:outline-none"
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
