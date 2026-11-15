<template>
	<SectionThumbnail :as="NuxtImg" :src :alt width="85" height="85" loading="lazy" />
</template>

<script setup lang="ts">
import { SectionThumbnail } from "~/components/ui/section";

// The `as` prop takes a component, and `#components` types NuxtImg as a generic one.
const NuxtImg = resolveComponent("NuxtImg");

const { src, alt = "" } = defineProps<{
	src: string;
	/** The thumbnail's description; empty when the text beside it already says it. */
	alt?: string;
}>();
</script>
