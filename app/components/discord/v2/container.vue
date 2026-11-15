<template>
	<!-- The classes are hooks: a surface that draws the container its own way styles it through them. -->
	<V2Container
		:accent-color="accentColor"
		:class="['discord-v2-container', { 'discord-v2-container-accented': accentColor }]"
	>
		<slot></slot>
	</V2Container>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface ContainerProps {
	accentColor?: string;
}

interface ContainerSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
import { V2Container } from "~/components/ui/v2-container";

defineSlots<ContainerSlots>();
defineProps<ContainerProps>();
</script>
