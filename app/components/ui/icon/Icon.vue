<template>
	<NuxtIcon v-bind="iconProps" />
</template>

<script lang="ts"></script>

<script setup lang="ts">
import { reactivePick } from '@vueuse/core';
import { useForwardProps } from 'reka-ui';

export interface IconProps {
	name: string;
	mode?: 'svg' | 'css';
	size?: string | number;
	customize?: (content: string, name?: string, prefix?: string, provider?: string) => string;
}

const props = defineProps<IconProps>();

const iconProps = useForwardProps(reactivePick(props, 'name', 'mode', 'size', 'customize'));
</script>
