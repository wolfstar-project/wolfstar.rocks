<template>
  <Primitive :as="as" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <div v-if="!!slots.top" :class="ui.top({ class: props.ui?.top })">
      <slot name="top"></slot>
    </div>

    <Container :class="ui.container({ class: props.ui?.container })">
      <div :class="ui.right({ class: props.ui?.right })">
        <slot name="right"></slot>
      </div>

      <div :class="ui.center({ class: props.ui?.center })">
        <slot></slot>
      </div>

      <div :class="ui.left({ class: props.ui?.left })">
        <slot name="left"></slot>
      </div>
    </Container>

    <div v-if="!!slots.bottom" :class="ui.bottom({ class: props.ui?.bottom })">
      <slot name="bottom"></slot>
    </div>
  </Primitive>
</template>

<script lang="ts">
const theme = tv({
  slots: {
    root: "",
    top: "py-8 lg:py-12",
    bottom: "py-8 lg:py-12",
    container: "py-8 lg:py-4 lg:flex lg:items-center lg:justify-between lg:gap-x-3",
    left: "flex items-center justify-center lg:justify-start lg:flex-1 gap-x-1.5 mt-3 lg:mt-0 lg:order-1",
    center: "mt-3 lg:mt-0 lg:order-2 flex items-center justify-center",
    right: "lg:flex-1 flex items-center justify-center lg:justify-end gap-x-1.5 lg:order-3",
  },
});

export interface FooterProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'footer'
   */
  as?: any;
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface FooterSlots {
  left(props?: {}): any;
  default(props?: {}): any;
  right(props?: {}): any;
  top(props?: {}): any;
  bottom(props?: {}): any;
}
</script>

<script setup lang="ts">
import { Primitive } from "reka-ui";
import { tv } from "tailwind-variants";
import { computed } from "vue";
import { Container } from "@/components/ui/container";

const props = withDefaults(defineProps<FooterProps>(), {
  as: "footer",
});
const slots = defineSlots<FooterSlots>();

const ui = computed(() => tv({ extend: theme })());
</script>
