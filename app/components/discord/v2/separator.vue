<template>
	<Divider :spacing :line="divider" />
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
