<template>
	<SelectChips
		v-if="layout === 'chips'"
		:model-value="modelValue"
		:label
		:description="tooltipTitle"
		:options
		kind="channel"
		:disabled
		:empty-label="emptyLabel"
		:dialog-title="dialogTitle"
		:search-placeholder="searchPlaceholder"
		:count-label="countLabel"
		@update:model-value="
			emit('update:modelValue', $event);
			emit('change', $event);
		"
	/>
	<SelectMany
		v-else
		:label
		:options
		kind="channel"
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
import type { ChannelType } from "discord-api-types/v10";

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
	channelTypes,
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
	 * and picks it in a dialog of checkboxes.
	 */
	layout?: "field" | "row" | "chips";
	/** For `chips`: the dialog's title, its search placeholder and its count. */
	dialogTitle?: string;
	searchPlaceholder?: string;
	countLabel?: (count: number) => string;
	/** Text shown while nothing is selected */
	emptyLabel?: string;
	/** The kinds of channel to offer, by default the ones WolfStar can post in. */
	channelTypes?: readonly ChannelType[];
}>();

const emit = defineEmits<{
	"update:modelValue": [value: string[]];
	"change": [value: string[]];
}>();

const options = computed(() => channelOptions(guild, channelTypes));
</script>
