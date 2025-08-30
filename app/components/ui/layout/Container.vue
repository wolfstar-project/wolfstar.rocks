<template>
  <Primitive :as="as" :class="ui({ class: props.class })">
    <slot></slot>
  </Primitive>
</template>

<script lang="ts">
import { tv } from "tailwind-variants";

const theme = tv({
  base: "container mx-auto px-4",
});

export interface ContainerProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;
  class?: any;
}

export interface ContainerSlots {
  default(props?: object): any;
}
</script>

<script setup lang="ts">
import { Primitive } from "reka-ui";
import { computed } from "vue";

const props = defineProps<ContainerProps>();
defineSlots<ContainerSlots>();

const ui = computed(() => tv({ extend: theme }));
</script>
