<template>
  <Primitive :as="as" :class="ui({ orientation, class: props.class })">
    <slot></slot>
  </Primitive>
</template>

<script lang="ts">
import type { VariantProps } from "tailwind-variants";
import type { HtmlHTMLAttributes } from "vue";
import { tv } from "tailwind-variants";

const theme = tv({
  base: "relative join",
  variants: {
    size: {
      xs: "",
      sm: "",
      md: "",
      lg: "",
      xl: "",
    },
    orientation: {
      horizontal: "inline-flex -space-x-px",
      vertical: "flex flex-col -space-y-px",
    },
  },
});

type FieldGroupVariants = VariantProps<typeof theme>;

export interface FieldGroupProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: string;
  /**
   * @defaultValue 'md'
   */
  size?: FieldGroupVariants["size"];
  /**
   * The orientation the buttons are laid out.
   * @defaultValue 'horizontal'
   */
  orientation?: FieldGroupVariants["orientation"];
  class?: HtmlHTMLAttributes["class"];
}

export interface FieldGroupSlots {
  default: (props?: object) => any;
}
</script>

<script setup lang="ts">
import { Primitive } from "reka-ui";
import { computed, provide } from "vue";
import { fieldGroupInjectionKey } from "@/composables/useFieldGroup";

const props = withDefaults(defineProps<FieldGroupProps>(), {
  orientation: "horizontal",
});
defineSlots<FieldGroupSlots>();

const ui = computed(() => tv({ extend: theme }));

provide(fieldGroupInjectionKey, computed(() => ({
  orientation: props.orientation,
  size: props.size,
})));
</script>
