<template>
	<SelectOne
		:label
		:options
		kind="role"
		:model-value="modelValue"
		:tooltip-title="tooltipTitle"
		:disabled
		:layout
		:empty-label="emptyLabel"
		@update:model-value="emit('update:modelValue', $event)"
		@change="emit('change', $event)"
	/>
</template>

<script setup lang="ts">
import type { DeepReadonly } from "@sapphire/utilities";

const {
	label,
	modelValue,
	guild,
	tooltipTitle,
	disabled = false,
	layout = "field",
	emptyLabel,
} = defineProps<{
	/** The label of the field */
	label: string;
	modelValue: string | null;
	/** `undefined` while the guild has not loaded: the list is then empty. */
	guild:
		| DeepReadonly<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>
		| undefined;
	/** Help text: shown under a `field`, read to screen readers in a `row` */
	tooltipTitle?: string;
	/** Disable the field */
	disabled?: boolean;
	layout?: "field" | "row";
	/** Text shown while nothing is selected */
	emptyLabel?: string;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: string | null];
	"change": [value: string | null];
}>();

const options = computed(() => roleOptions(guild));
</script>
