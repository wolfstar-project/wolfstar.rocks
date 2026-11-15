<template>
	<Mention variant="role" :color><span aria-hidden="true">@</span><slot></slot></Mention>
</template>

<script lang="ts">
import type { VNode } from "vue";

interface RoleProps {
	/** The role's colour; without one the mention keeps the role tint of the theme. */
	color?: string;
}

interface RoleSlots {
	default?(props?: Record<string, never>): VNode[];
}
</script>

<script setup lang="ts">
import { Mention } from "~/components/ui/mention";

defineSlots<RoleSlots>();

const { color } = defineProps<RoleProps>();
</script>
