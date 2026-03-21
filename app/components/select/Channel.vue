<template>
	<SelectOne
		:label="label"
		:name="channelName"
		:model-value="modelValue"
		:values="channelValues"
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
import type { SelectOneValue } from "./One.vue";
import { ChannelType } from "discord-api-types/v10";

export interface SelectChannelProps {
	/** The label to show on the button */
	label: string;
	/** The current selected channel ID */
	modelValue: string | null;
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
	(e: "update:modelValue", value: string | null): void;
	(e: "change", value: string | null): void;
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
} = defineProps<SelectChannelProps>();


defineEmits<Emits>();


// Find the channel name based on the current value
const channelName = computed(() => {
	if (!modelValue) {
		return undefined;
	}
	const channel = guild.channels.find((c) => c.id === modelValue);
	return channel?.name;
});


// Filter and sort channels, then map to SelectOneValue format
const channelValues = computed<SelectOneValue[]>(() =>
	guild.channels
		.filter((c) => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement)
		.toSorted((c1, c2) => c1.rawPosition - c2.rawPosition)
		.map((c) => ({
			icon: "discord:text-channel",
			name: c.name,
			value: c.id,
		})),
);
</script>
