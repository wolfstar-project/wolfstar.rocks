<template>
  <NumberFieldRoot
    v-bind="rootProps"
    :id="id"
    :class="ui.root({ class: [props.class, props.ui?.root] })"
    :name="name"
    :disabled="disabled"
    @update:model-value="onUpdate"
  >
    <NumberFieldInput
      v-bind="{ ...$attrs, ...ariaAttrs }"
      ref="inputRef"
      :placeholder="placeholder"
      :required="required"
      :class="ui.base({ class: props.ui?.base })"
      @blur="onBlur"
      @focus="emitFormFocus"
    />

    <div :class="ui.increment({ class: props.ui?.increment })">
      <NumberFieldIncrement as-child :disabled="disabled">
        <slot name="increment">
          <Button
            :icon="incrementIcon"
            :color="color"
            :size="size"
            variant="link"
            aria-label="Increment"
            v-bind="typeof increment === 'object' ? increment : undefined"
          />
        </slot>
      </NumberFieldIncrement>
    </div>

    <div :class="ui.decrement({ class: props.ui?.decrement })">
      <NumberFieldDecrement as-child :disabled="disabled">
        <slot name="decrement">
          <Button
            :icon="decrementIcon"
            :color="color"
            :size="size"
            variant="link"
            aria-label="Decrement"
            v-bind="typeof decrement === 'object' ? decrement : undefined"
          />
        </slot>
      </NumberFieldDecrement>
    </div>
  </NumberFieldRoot>
</template>

<script lang="ts">
import type { NumberFieldRootProps } from "reka-ui";
import type { VariantProps } from "tailwind-variants";
import type { ButtonProps } from "../button";
import type { PartialString } from "@/types/utils";
import { tv } from "tailwind-variants";

const inputNumber = tv({
  slots: {
    root: "relative inline-flex items-center",
    base: [
      "input w-full", // Using daisyUI input class
      "disabled:cursor-not-allowed disabled:opacity-50",
    ],
    increment: "absolute flex items-center",
    decrement: "absolute flex items-center",
  },
  variants: {
    color: {
      primary: "input-primary",
      secondary: "input-secondary",
      accent: "input-accent",
      info: "input-info",
      success: "input-success",
      warning: "input-warning",
      error: "input-error",
      neutral: "",
    },
    size: {
      xs: "input-xs",
      sm: "input-sm",
      md: "input-md",
      lg: "input-lg",
      xl: "input-xl",
    },
    variant: {
      border: "input-border",
      ghost: "input-ghost",
    },
    disabled: {
      true: {
        increment: "cursor-not-allowed opacity-50",
        decrement: "cursor-not-allowed opacity-50",
      },
    },
    orientation: {
      horizontal: {
        base: "text-center",
        increment: "inset-y-0 end-0 pe-1",
        decrement: "inset-y-0 start-0 ps-1",
      },
      vertical: {
        increment: "end-0 top-0 scale-80 pe-1 [&>button]:py-0",
        decrement: "end-0 bottom-0 scale-80 pe-1 [&>button]:py-0",
      },
    },
    highlight: {
      true: "",
    },
  },
  compoundVariants: [
    // Focus and highlight states using daisyUI colors
    ...(colors.map(color => ({
      color,
      variant: ["bordered"],
      class: `focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-${color}`,
    })) as any),
    ...(colors.map(color => ({
      color,
      highlight: true,
      class: `ring-2 ring-${color}`,
    })) as any),
    {
      color: "neutral",
      variant: ["bordered"],
      class: "focus-visible:ring-2 focus-visible:ring-base-content focus-visible:outline-none",
    },
    {
      color: "neutral",
      highlight: true,
      class: "ring-2 ring-base-content",
    },
    // Padding compound variants
    {
      orientation: "horizontal",
      size: "xs",
      class: "px-7",
    },
    {
      orientation: "horizontal",
      size: "sm",
      class: "px-8",
    },
    {
      orientation: "horizontal",
      size: "md",
      class: "px-9",
    },
    {
      orientation: "horizontal",
      size: "lg",
      class: "px-10",
    },
    {
      orientation: "horizontal",
      size: "xl",
      class: "px-11",
    },
    {
      orientation: "vertical",
      size: "xs",
      class: "pe-7",
    },
    {
      orientation: "vertical",
      size: "sm",
      class: "pe-8",
    },
    {
      orientation: "vertical",
      size: "md",
      class: "pe-9",
    },
    {
      orientation: "vertical",
      size: "lg",
      class: "pe-10",
    },
    {
      orientation: "vertical",
      size: "xl",
      class: "pe-11",
    },
  ],
  defaultVariants: {
    size: "md",
    color: "primary",
    variant: "border",
  },
});

type InputNumberVariants = VariantProps<typeof inputNumber>;

export interface InputNumberProps
  extends Pick<
    NumberFieldRootProps,
    | "modelValue"
    | "defaultValue"
    | "min"
    | "max"
    | "step"
    | "stepSnapping"
    | "disabled"
    | "required"
    | "id"
    | "name"
    | "formatOptions"
    | "disableWheelChange"
  > {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;
  /** The placeholder text when the input is empty. */
  placeholder?: string;
  color?: InputNumberVariants["color"];
  variant?: InputNumberVariants["variant"];
  size?: InputNumberVariants["size"];
  /** Highlight the ring color like a focus state. */
  highlight?: boolean;
  /**
   * The orientation of the input menu.
   * @defaultValue 'horizontal'
   */
  orientation?: "vertical" | "horizontal";
  /**
   * Configure the increment button. The `color` and `size` are inherited.
   * @defaultValue { variant: 'link' }
   */
  increment?: ButtonProps;
  /**
   * The icon displayed to increment the value.
   * @defaultValue appConfig.ui.icons.plus
   * @IconifyIcon
   */
  incrementIcon?: string;
  /**
   * Configure the decrement button. The `color` and `size` are inherited.
   * @defaultValue { variant: 'link' }
   */
  decrement?: ButtonProps;
  /**
   * The icon displayed to decrement the value.
   * @defaultValue appConfig.ui.icons.minus
   * @IconifyIcon
   */
  decrementIcon?: string;
  autofocus?: boolean;
  autofocusDelay?: number;
  class?: any;
  ui?: PartialString<typeof inputNumber.slots>;
}

export interface InputNumberEmits {
  (e: "update:modelValue", payload: number): void;
  (e: "blur", event: FocusEvent): void;
  (e: "change", payload: Event): void;
}

export interface InputNumberSlots {
  increment: (props?: object) => any;
  decrement: (props?: object) => any;
}
</script>

<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput, NumberFieldRoot, useForwardPropsEmits } from "reka-ui";
import { computed, onMounted, ref } from "vue";
import { Button } from "@/components/ui/button";
import { useFormField } from "@/composables/useFormField";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<InputNumberProps>(), {
  orientation: "horizontal",
});
const emits = defineEmits<InputNumberEmits>();
defineSlots<InputNumberSlots>();

const rootProps = useForwardPropsEmits(
  reactivePick(props, "as", "modelValue", "defaultValue", "min", "max", "step", "stepSnapping", "formatOptions", "disableWheelChange"),
  emits,
);

const { emitFormBlur, emitFormFocus, emitFormChange, emitFormInput, id, color, size, name, highlight, disabled, ariaAttrs }
	= useFormField<InputNumberProps>(props);

const ui = computed(() =>
  inputNumber({
    color: color.value,
    variant: props.variant,
    size: size.value,
    highlight: highlight.value,
    orientation: props.orientation,
  }),
);

const incrementIcon = computed(() => props.incrementIcon || (props.orientation === "horizontal" ? "ic:baseline-plus" : "ic:baseline-arrow-drop-up"));
const decrementIcon = computed(() => props.decrementIcon || (props.orientation === "horizontal" ? "ic:baseline-minus" : "ic:baseline-arrow-drop-down"));

const inputRef = ref<InstanceType<typeof NumberFieldInput> | null>(null);

function onUpdate(value: number) {
  // @ts-expect-error - 'target' does not exist in type 'EventInit'
  const event = new Event("change", { target: { value } });
  emits("change", event);

  emitFormChange();
  emitFormInput();
}

function onBlur(event: FocusEvent) {
  emitFormBlur();
  emits("blur", event);
}

function autoFocus() {
  if (props.autofocus) {
    inputRef.value?.$el?.focus();
  }
}

onMounted(() => {
  setTimeout(() => {
    autoFocus();
  }, props.autofocusDelay);
});

defineExpose({
  inputRef,
});
</script>
