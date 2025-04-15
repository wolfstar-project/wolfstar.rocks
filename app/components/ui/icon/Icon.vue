<template>
	<NuxtIcon v-bind="iconProps" />
</template>

<script lang="ts"></script>

<script setup lang="ts">
import { useForwardProps } from 'reka-ui';
import { reactivePick } from '@vueuse/core';
export interface IconProps {
	name: string;
	mode?: 'svg' | 'css';
	size?: string | number;
	customize?: (content: string, name?: string, prefix?: string, provider?: string) => string;
}

const props = defineProps<IconProps>();

const iconProps = useForwardProps(reactivePick(props, 'name', 'mode', 'size', 'customize'));
</script>
