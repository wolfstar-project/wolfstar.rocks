<template>
	<!-- Discord's two steps are 4px and 8px; the Divider has 4px, then 16px. -->
	<Divider spacing="sm" :line="divider" :class="spacing === 'large' ? 'my-2' : undefined" />
</template>

<script lang="ts">
interface SeparatorProps {
	spacing?: "small" | "large";
	divider?: boolean;
}
</script>

<script setup lang="ts">
import { Divider } from "~/components/ui/divider";

const { spacing = "small", divider = true } = defineProps<SeparatorProps>();
</script>
