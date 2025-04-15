<template>
	<Primitive :as="as" :class="ButtonGroupVariant({ orientation, class: props.class })">
		<slot />
	</Primitive>
</template>

<script setup lang="ts">
import { provide, computed } from 'vue';
import { Primitive } from 'reka-ui';
import { ButtonGroupVariant, type ButtonGroupProps, type ButtonGroupSlots } from '.';

const props = withDefaults(defineProps<ButtonGroupProps>(), {
	orientation: 'horizontal'
});
defineSlots<ButtonGroupSlots>();

provide(
	ButtonGroupInjectionKey,
	computed(() => ({
		orientation: props.orientation,
		size: props.size
	}))
);
</script>
