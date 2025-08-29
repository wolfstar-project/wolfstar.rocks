<template>
  <Primitive
    :as="as"
    role="separator"
    :class="ui({ class: props.class })"
  >
    <slot></slot>
  </Primitive>
</template>

<script lang="ts">
import { tv } from "tailwind-variants";

const theme = tv({
  base: "hidden lg:block touch-none select-none cursor-ew-resize relative before:absolute before:inset-y-0 before:-left-1.5 before:-right-1.5",
});

export interface DashboardResizeHandleProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;
  class?: any;
}

export interface DashboardResizeHandleSlots {
  default(props?: {}): any;
}
</script>

<script setup lang="ts">
import { Primitive } from "reka-ui";
import { computed } from "vue";

const props = defineProps<DashboardResizeHandleProps>();
defineSlots<DashboardResizeHandleSlots>();

const ui = computed(() => tv({ extend: theme }));
</script>
