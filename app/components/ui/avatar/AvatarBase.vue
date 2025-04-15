<template>
	<AvatarRoot :class="cn(avatarVariant({ size, shape }), props.class)">
		<slot />
	</AvatarRoot>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { AvatarRoot } from 'reka-ui';
import { type AvatarVariants, avatarVariant } from '.';

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes['class'];
		size?: AvatarVariants['size'];
		shape?: AvatarVariants['shape'];
	}>(),
	{
		size: 'sm',
		shape: 'circle'
	}
);
</script>
