<template>
	<Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
		<Slot v-bind="$attrs">
			<slot />
		</Slot>

		<span v-if="show" :class="ui.base({ class: props.ui?.base })">
			<slot name="content">
				{{ text }}
			</slot>
		</span>
	</Primitive>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Primitive, Slot } from 'reka-ui';
import { useAvatarGroup } from '@/composables/useAvatarGroup';
import { type ChipProps, type ChipSlots, chip } from '.';

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ChipProps>(), {
	inset: false,
	standalone: false
});
defineSlots<ChipSlots>();

const show = defineModel<boolean>('show', { default: true });

const { size } = useAvatarGroup(props);

const ui = computed(() =>
	chip({
		color: props.color,
		size: size.value,
		position: props.position,
		inset: props.inset,
		standalone: props.standalone
	})
);
</script>
