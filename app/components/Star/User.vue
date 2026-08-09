<template>
	<div class="gap-3 flex items-center">
		<StarAvatar :src="avatar?.src ?? src" :alt="avatar?.alt ?? alt ?? name" :size="size" />
		<div class="min-w-0">
			<p class="font-medium truncate">{{ name }}</p>
			<p v-if="description" class="text-sm text-muted truncate">{{ description }}</p>
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
