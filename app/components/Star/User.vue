<template>
	<div class="flex items-center gap-3">
		<StarAvatar :src="avatar?.src ?? src" :alt="avatar?.alt ?? alt ?? name" :size="size" />
		<div class="min-w-0">
			<p class="truncate font-medium">{{ name }}</p>
			<p v-if="description" class="truncate text-sm text-base-content/60">{{ description }}</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { UiSize } from "~/utils/ui-classes";

defineProps<{
	name?: string;
	description?: string;
	src?: string;
	alt?: string;
	avatar?: { src?: string; alt?: string };
	size?: UiSize;
	to?: string;
}>();
</script>
