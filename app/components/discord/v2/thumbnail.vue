<template>
	<SectionThumbnail :src :alt width="86" height="86" loading="lazy" />
</template>

<script setup lang="ts">
import { SectionThumbnail } from "~/components/ui/section";

const { src, alt = "" } = defineProps<{
	src: string;
	/** The thumbnail's description; empty when the text beside it already says it. */
	alt?: string;
}>();
</script>
