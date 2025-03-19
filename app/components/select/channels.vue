<template>
	<select-many-base
		:label="label"
		:options="channelOptions"
		:value="modelValue"
		:error="error"
		:helper-text="description"
		:name="name"
		:tooltip-title="tooltipTitle"
		:required="true"
		:searchable="true"
		@update:value="handleChange"
	/>
</template>

<script setup lang="ts">
import type { ValuesType } from 'utility-types';
import { ChannelType } from 'discord-api-types/v10';
import type { TransformedLoginData } from '~~/shared/types/discord';

interface Props {
	label: string;
	modelValue: string[];
	guild: ValuesType<NonNullable<TransformedLoginData['transformedGuilds']>>;
	tooltipTitle?: string;
	error?: boolean;
	description?: string;
	name?: string;
}

const props = withDefaults(defineProps<Props>(), {
	tooltipTitle: undefined,
	error: false,
	name: () => `channels-${Math.random().toString(36).slice(2)}`,
	description: undefined
});

const emit = defineEmits<{
	(e: 'update:modelValue' | 'change', value: string[]): void;
}>();

const channelOptions = computed(() =>
	props.guild.channels
		.filter((c) => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement)
		.sort((c1, c2) => c1.rawPosition - c2.rawPosition)
		.map((c) => ({
			label: c.name,
			value: c.id
		}))
);

const handleChange = (value: string[]) => {
	emit('update:modelValue', value);
	emit('change', value);
};
</script>
