<template>
	<div class="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
		<UInput
			v-model="internalSearch"
			icon="i-lucide-search"
			placeholder="Search logs..."
			label="Search logs"
			class="w-full sm:w-64"
		/>
		<div class="flex items-center gap-2">
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
import { useDebounceFn } from "@vueuse/core";

const props = defineProps<{
	modelValue?: string;
}>();
const emit = defineEmits<{
	(e: "update:modelValue", value: string): void;
}>();

const internalSearch = ref(props.modelValue ?? "");

const emitDebounced = useDebounceFn((val: string) => {
	emit("update:modelValue", val);
}, 300);

watch(internalSearch, (newVal) => {
	emitDebounced(newVal);
});
watch(
	() => props.modelValue,
	(newVal) => {
		if (newVal !== internalSearch.value) {
			internalSearch.value = newVal ?? "";
		}
	},
);
</script>
