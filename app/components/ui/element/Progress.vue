<!-- eslint-disable vue/block-tag-newline -->
<template>
  <Primitive :as="as" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <div v-if="!isIndeterminate && (status || !!slots.status)" :class="ui.status({ class: props.ui?.status })" :style="statusStyle">
      <slot name="status" :percent="percent">
        {{ percent }}%
      </slot>
    </div>

    <ProgressRoot v-bind="rootProps" :max="realMax" :class="ui.base({ class: props.ui?.base })" style="transform: translateZ(0)">
      <ProgressIndicator :class="ui.indicator({ class: props.ui?.indicator })" :style="indicatorStyle" />
    </ProgressRoot>

    <div v-if="hasSteps" :class="ui.steps({ class: props.ui?.steps })">
      <div v-for="(step, index) in max" :key="index" :class="ui.step({ class: props.ui?.step, step: stepVariant(index) })">
        <slot :name="`step-${index}`" :step="step">
          {{ step }}
        </slot>
      </div>
    </div>
  </Primitive>
</template>

<script lang="ts">
import type { ProgressRootEmits, ProgressRootProps } from "reka-ui";
import { tv, type VariantProps } from "tailwind-variants";

const theme = tv({
  slots: {
    root: "gap-2",
    base: "progress",
    indicator: "",
    status: "flex justify-end text-base-content/60 transition-[width] duration-200",
    steps: "grid items-end",
    step: "truncate text-end row-start-1 col-start-1 transition-opacity",
  },
  variants: {
    animation: {
      "carousel": "",
      "carousel-inverse": "",
      "swing": "",
      "elastic": "",
    },
    color: {
      primary: {
        indicator: "progress-primary",
        steps: "text-primary",
      },
      secondary: {
        indicator: "progress-secondary",
        steps: "text-secondary",
      },
      success: {
        indicator: "progress-success",
        steps: "text-success",
      },
      info: {
        indicator: "progress-info",
        steps: "text-info",
      },
      warning: {
        indicator: "progress-warning",
        steps: "text-warning",
      },
      error: {
        indicator: "progress-error",
        steps: "text-error",
      },
      neutral: {
        indicator: "progress-neutral",
        steps: "text-neutral",
      },
    },
    size: {
      "2xs": {
        status: "text-xs",
        steps: "text-xs",
      },
      "xs": {
        status: "text-xs",
        steps: "text-xs",
      },
      "sm": {
        status: "text-sm",
        steps: "text-sm",
      },
      "md": {
        status: "text-sm",
        steps: "text-sm",
      },
      "lg": {
        status: "text-sm",
        steps: "text-sm",
      },
      "xl": {
        status: "text-base",
        steps: "text-base",
      },
      "2xl": {
        status: "text-base",
        steps: "text-base",
      },
    },
    step: {
      active: {
        step: "opacity-100",
      },
      first: {
        step: "opacity-100 text-muted",
      },
      other: {
        step: "opacity-0",
      },
      last: {
        step: "",
      },
    },
    orientation: {
      horizontal: {
        root: "w-full flex flex-col",
        base: "w-full",
        status: "flex-row",
      },
      vertical: {
        root: "h-full flex flex-row-reverse",
        base: "h-full",
        status: "flex-col",
      },
    },
    inverted: {
      true: {
        status: "self-end",
      },
    },
  },
  compoundVariants: [
    {
      inverted: true,
      orientation: "horizontal",
      class: {
        step: "text-start",
        status: "flex-row-reverse",
      },
    },
    {
      inverted: true,
      orientation: "vertical",
      class: {
        steps: "items-start",
        status: "flex-col-reverse",
      },
    },
    {
      orientation: "horizontal",
      size: "2xs",
      class: "h-px",
    },
    {
      orientation: "horizontal",
      size: "xs",
      class: "h-0.5",
    },
    {
      orientation: "horizontal",
      size: "sm",
      class: "h-1",
    },
    {
      orientation: "horizontal",
      size: "md",
      class: "h-2",
    },
    {
      orientation: "horizontal",
      size: "lg",
      class: "h-3",
    },
    {
      orientation: "horizontal",
      size: "xl",
      class: "h-4",
    },
    {
      orientation: "horizontal",
      size: "2xl",
      class: "h-5",
    },
    {
      orientation: "vertical",
      size: "2xs",
      class: "w-px",
    },
    {
      orientation: "vertical",
      size: "xs",
      class: "w-0.5",
    },
    {
      orientation: "vertical",
      size: "sm",
      class: "w-1",
    },
    {
      orientation: "vertical",
      size: "md",
      class: "w-2",
    },
    {
      orientation: "vertical",
      size: "lg",
      class: "w-3",
    },
    {
      orientation: "vertical",
      size: "xl",
      class: "w-4",
    },
    {
      orientation: "vertical",
      size: "2xl",
      class: "w-5",
    },
    {
      orientation: "horizontal",
      animation: "carousel",
      class: {
        indicator: "data-[state=indeterminate]:animate-[carousel_2s_ease-in-out_infinite] data-[state=indeterminate]:rtl:animate-[carousel-rtl_2s_ease-in-out_infinite]",
      },
    },
    {
      orientation: "vertical",
      animation: "carousel",
      class: {
        indicator: "data-[state=indeterminate]:animate-[carousel-vertical_2s_ease-in-out_infinite]",
      },
    },
    {
      orientation: "horizontal",
      animation: "carousel-inverse",
      class: {
        indicator: "data-[state=indeterminate]:animate-[carousel-inverse_2s_ease-in-out_infinite] data-[state=indeterminate]:rtl:animate-[carousel-inverse-rtl_2s_ease-in-out_infinite]",
      },
    },
    {
      orientation: "vertical",
      animation: "carousel-inverse",
      class: {
        indicator: "data-[state=indeterminate]:animate-[carousel-inverse-vertical_2s_ease-in-out_infinite]",
      },
    },
    {
      orientation: "horizontal",
      animation: "swing",
      class: {
        indicator: "data-[state=indeterminate]:animate-[swing_2s_ease-in-out_infinite]",
      },
    },
    {
      orientation: "vertical",
      animation: "swing",
      class: {
        indicator: "data-[state=indeterminate]:animate-[swing-vertical_2s_ease-in-out_infinite]",
      },
    },
    {
      orientation: "horizontal",
      animation: "elastic",
      class: {
        indicator: "data-[state=indeterminate]:animate-[elastic_2s_ease-in-out_infinite]",
      },
    },
    {
      orientation: "vertical",
      animation: "elastic",
      class: {
        indicator: "data-[state=indeterminate]:animate-[elastic-vertical_2s_ease-in-out_infinite]",
      },
    },
  ],
  defaultVariants: {
    animation: "carousel",
    color: "primary",
    size: "md",
  },
},
);

type ProgressVariants = VariantProps<typeof theme>;

export interface ProgressProps extends Pick<ProgressRootProps, "getValueLabel" | "getValueText" | "modelValue"> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;
  /** The maximum progress value. */
  max?: number | Array<any>;
  /** Display the current progress value. */
  status?: boolean;
  /** Whether the progress is visually inverted. */
  inverted?: boolean;
  /**
   * @defaultValue 'md'
   */
  size?: ProgressVariants["size"];
  /**
   * @defaultValue 'primary'
   */
  color?: ProgressVariants["color"];
  /**
   * The orientation of the progress bar.
   * @defaultValue 'horizontal'
   */
  orientation?: ProgressVariants["orientation"];
  /**
   * The animation of the progress bar.
   * @defaultValue 'carousel'
   */
  animation?: ProgressVariants["animation"];
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface ProgressEmits extends ProgressRootEmits {}

export type ProgressSlots = {
  status(props: { percent?: number }): any;
} & {
  [key: string]: (props: { step: number }) => any;
};
</script>

<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { Primitive, ProgressIndicator, ProgressRoot, useForwardPropsEmits } from "reka-ui";
import { computed } from "vue";

const props = withDefaults(defineProps<ProgressProps>(), {
  inverted: false,
  modelValue: null,
  orientation: "horizontal",
});
const emits = defineEmits<ProgressEmits>();
const slots = defineSlots<ProgressSlots>();

const rootProps = useForwardPropsEmits(reactivePick(props, "getValueLabel", "getValueText", "modelValue"), emits);

const isIndeterminate = computed(() => rootProps.value.modelValue === null);
const hasSteps = computed(() => Array.isArray(props.max));

const realMax = computed(() => {
  if (isIndeterminate.value || !props.max) {
    return undefined;
  }

  if (Array.isArray(props.max)) {
    return props.max.length - 1;
  }

  return Number(props.max);
});

const percent = computed(() => {
  if (isIndeterminate.value) {
    return undefined;
  }

  switch (true) {
    case rootProps.value.modelValue! < 0: return 0;
    case rootProps.value.modelValue! > (realMax.value ?? 100): return 100;
    default: return Math.round((rootProps.value.modelValue! / (realMax.value ?? 100)) * 100);
  }
});

const indicatorStyle = computed(() => {
  if (percent.value === undefined) {
    return;
  }

  if (props.orientation === "vertical") {
    return {
      transform: `translateY(${props.inverted ? "" : "-"}${100 - percent.value}%)`,
    };
  }
  else {
    return {
      transform: `translateX(${props.inverted ? "" : "-"}${100 - percent.value}%)`,
    };
  }
});

const statusStyle = computed(() => {
  return {
    [props.orientation === "vertical" ? "height" : "width"]: percent.value ? `${percent.value}%` : "fit-content",
  };
});

function isActive(index: number) {
  return index === Number(props.modelValue);
}

function isFirst(index: number) {
  return index === 0;
}

function isLast(index: number) {
  return index === realMax.value;
}

function stepVariant(index: number | string) {
  index = Number(index);

  if (isActive(index) && !isFirst(index)) {
    return "active";
  }

  if (isFirst(index) && isActive(index)) {
    return "first";
  }

  if (isLast(index) && isActive(index)) {
    return "last";
  }

  return "other";
}

const ui = computed(() => tv({ extend: theme })({
  animation: props.animation,
  size: props.size,
  color: props.color,
  orientation: props.orientation,
  inverted: props.inverted,
}));
</script>
