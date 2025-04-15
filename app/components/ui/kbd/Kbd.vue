<template>
	<Primitive :as="as" :class="kbd({ variant, size, class: props.class })">
		<slot>
			{{ getKbdKey(value) }}
		</slot>
	</Primitive>
</template>

<script setup lang="ts">
import { Primitive } from 'reka-ui';
import type { KbdProps, KbdSlots, kbd } from '.';

const props = withDefaults(defineProps<KbdProps>(), {
	as: 'kbd'
});
defineSlots<KbdSlots>();

const { getKbdKey } = useKbd();
</script>
