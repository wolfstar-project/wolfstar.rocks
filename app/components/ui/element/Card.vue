<template>
  <Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
    <div v-if="!!slots.title" :class="ui.title({ class: props.ui?.title })">
      <slot name="title"></slot>
    </div>
    <div v-if="!!slots.header" :class="ui.header({ class: props.ui?.header })">
      <slot name="header"></slot>
    </div>

    <div v-if="!!slots.default" :class="ui.body({ class: props.ui?.body })">
      <slot></slot>
    </div>

    <div v-if="!!slots.footer" :class="ui.footer({ class: props.ui?.footer })">
      <slot name="footer"></slot>
    </div>
  </Primitive>
</template>

<script lang="ts">
import { tv, type VariantProps } from "tailwind-variants";

const theme = tv({
  slots: {
    root: "card",
    title: "card-title",
    header: "card-body",
    body: "p-4 sm:p-6",
    footer: "card-actions",
  },
  variants: {
    color: {
      ...Object.fromEntries(
        Object.keys(colors).map((key) => [key, { root: `bg-${key} text-${key}-content` }]),
      ) as {
        [key in UIColors]: { root: string };
      },
    },
    variant: {
      solid: {
        root: "bg-base-100 shadow-xl",
      },
      dash: {
        root: "card-dash",
      },
      outline: {
        root: "card-border",
      },
      soft: {
        root: "bg-base-200",
      },
      subtle: {
        root: "card-border bg-base-200",
      },
    },
    size: {
      xs: { root: "card-xs" },
      sm: { root: "card-sm" },
      md: { root: "card-md" },
      lg: { root: "card-lg" },
      xl: { root: "card-xl" },
    },
  },
  defaultVariants: {
    variant: "outline",
    size: "md",
  },
});

export type CardVariants = VariantProps<typeof theme>;

export interface CardProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: string;
  /**
   * @defaultValue 'outline'
   */
  variant?: CardVariants["variant"];
  /**
   * @defaultValue 'md'
   */
  size?: CardVariants["size"];
  class?: HTMLAttributes["class"];
  ui?: Partial<typeof theme.slots>;
}

export interface CardSlots {
  title: (props?: object) => any;
  header: (props?: object) => any;
  default: (props?: object) => any;
  footer: (props?: object) => any;
}
</script>

<script setup lang="ts">
import { Primitive } from "reka-ui";
import { computed, type HTMLAttributes } from "vue";

const props = defineProps<CardProps>();
const slots = defineSlots<CardSlots>();

const ui = computed(() => tv({ extend: theme })({ variant: props.variant }));
</script>
