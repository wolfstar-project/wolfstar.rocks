<template>
  <Primitive :as="as" :class="ui({ class: props.class })">
    <slot></slot>
  </Primitive>
</template>

<script lang="ts">
import { tv } from "tailwind-variants";

const theme = tv({
  slots: {
    base: "mx-4 flex flex-grow flex-col items-center sm:mx-auto sm:w-5/6 lg:max-w-5xl xl:max-w-7xl",
  },
});

export interface MainProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'main'
   */
  as?: any;
  class?: any;
}

export interface MainSlots {
  default(props?: {}): any;
}
</script>

<script setup lang="ts">
import { Primitive } from "reka-ui";
import { computed } from "vue";

const props = withDefaults(defineProps<MainProps>(), {
  as: "main",
});
defineSlots<MainSlots>();

const ui = computed(() => tv({ extend: theme }));
</script>
