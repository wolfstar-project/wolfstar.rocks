<template>
	<SelectChips
		v-if="layout === 'chips' || layout === 'add'"
		:model-value="modelValue"
		:label
		:description="tooltipTitle"
		:options
		kind="role"
		:disabled
		:empty-label="emptyLabel"
		:dialog-title="dialogTitle"
		:search-placeholder="searchPlaceholder"
		:count-label="countLabel"
		:one-at-a-time="layout === 'add'"
		@update:model-value="
			emit('update:modelValue', $event);
			emit('change', $event);
		"
	/>
	<SelectMany
		v-else
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
	dialogTitle,
	searchPlaceholder,
	countLabel,
	everyone = false,
	optionNotes,
} = defineProps<{
	/** The label of the field */
	label: string;
	modelValue: string[];
	/** `undefined` while the guild has not loaded: the list is then empty. */
	guild:
		| DeepReadonly<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>
		| undefined;
	/** Help text: shown under a `field`, read to screen readers in a `row` */
	tooltipTitle?: string;
	/** Disable the field */
	disabled?: boolean;
	/**
	 * `field` and `row` are selects; `chips` lists the choice as removable chips
	 * and picks it in a dialog of checkboxes; `add` lists it the same way and
	 * picks one at a time, with a select and a button above the chips.
	 */
	layout?: "field" | "row" | "chips" | "add";
	/** For `chips`: the dialog's title, its search placeholder and its count. */
	dialogTitle?: string;
	searchPlaceholder?: string;
	countLabel?: (count: number) => string;
	/** Text shown while nothing is selected */
	emptyLabel?: string;
	/** Offers `@everyone` too, for what can name it. */
	everyone?: boolean;
	/** A short note on an option, by its id: what picking it would also change. */
	optionNotes?: ReadonlyMap<string, string>;
}>();

const emit = defineEmits<{
	"update:modelValue": [value: string[]];
	"change": [value: string[]];
}>();

const options = computed(() => withOptionNotes(roleOptions(guild, { everyone }), optionNotes));
</script>
