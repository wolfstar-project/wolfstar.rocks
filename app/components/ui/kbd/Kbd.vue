<template>
    <Primitive :as="as" :class="kbd({ variant, size, class: props.class })">
        <slot>
            {{ getKbdKey(value) }}
        </slot>
    </Primitive>
</template>

<script setup lang="ts">
import type { kbd, KbdProps, KbdSlots } from '.';
import { Primitive } from 'reka-ui';

const props = withDefaults(defineProps<KbdProps>(), {
    as: 'kbd',
});
defineSlots<KbdSlots>();

const { getKbdKey } = useKbd();
</script>
