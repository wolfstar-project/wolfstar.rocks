<template>
	<SelectMany
		:label="label"
		:name="selectedCount"
		:values="channelValues"
		:model-value="modelValue"
		:tooltip-title="tooltipTitle"
		:image-in-name="imageInName"
		:disabled="disabled"
		@update:model-value="
			$emit('update:modelValue', $event);
			$emit('change', $event);
		"
		@change="$emit('change', $event)"
		@reset="$emit('reset')"
	/>
</template>

<script lang="ts">
import type { DeepReadonly } from "@sapphire/utilities";
import type { SelectManyValue } from "./Many.vue";
import { ChannelType } from "discord-api-types/v10";

export interface SelectChannelsProps {
	/** The label to show on the button */
	label: string;
	/** The current selected channel IDs */
	modelValue: string[];
	/** The guild data containing channels */
	guild: DeepReadonly<ValuesType<NonNullable<TransformedLoginData["transformedGuilds"]>>>;
	/** Content to be shown as a tooltip when hovering over the button */
	tooltipTitle?: string;
	/** Whether to append an image to the end of the button, next to the value of the key */
	imageInName?: string;
	/** Disable the field */
	disabled?: boolean;
}

interface Emits {
	(e: "update:modelValue", value: string[]): void;
	(e: "change", value: string[]): void;
	(e: "reset"): void;
}
</script>

<script setup lang="ts">
const {
	label,
	modelValue,
	guild,
	tooltipTitle,
	imageInName,
	disabled = false,
} = defineProps<SelectChannelsProps>();

defineEmits<Emits>();

// Count of selected channels
const selectedCount = computed(() => modelValue.length);

// Filter and sort channels, then map to SelectManyValue format
const channelValues = computed<SelectManyValue[]>(() =>
	guild.channels
		.filter((c) => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement)
		.toSorted((c1, c2) => c1.rawPosition - c2.rawPosition)
		.map((c) => ({
			name: c.name,
			value: c.id,
		})),
);
</script>
