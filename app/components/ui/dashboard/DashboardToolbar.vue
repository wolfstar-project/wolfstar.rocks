<template>
  <Primitive :as="as" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <slot>
      <div :class="ui.left({ class: [props.ui?.left] })">
        <slot name="left"></slot>
      </div>

      <div :class="ui.right({ class: [props.ui?.right] })">
        <slot name="right"></slot>
      </div>
    </slot>
  </Primitive>
</template>

<script lang="ts">
import { tv } from "tailwind-variants";

const theme = tv({
  slots: {
    root: "shrink-0 flex items-center justify-between border-b border-base-300 bg-base-100 px-4 sm:px-6 gap-1.5 overflow-x-auto min-h-[49px]",
    left: "flex items-center gap-1.5 text-base-content",
    right: "flex items-center gap-1.5 text-base-content",
  },
});

export interface DashboardToolbarProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface DashboardToolbarSlots {
  default(props?: {}): any;
  left(props?: {}): any;
  right(props?: {}): any;
}
</script>

<script setup lang="ts">
import { Primitive } from "reka-ui";
import { computed } from "vue";

const props = defineProps<DashboardToolbarProps>();
defineSlots<DashboardToolbarSlots>();

const ui = computed(() => tv({ extend: theme })());
</script>
