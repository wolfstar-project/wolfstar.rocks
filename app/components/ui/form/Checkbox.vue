<!-- eslint-disable vue/no-template-shadow -->
<template>
  <Primitive :as="(!variant || variant === 'list') ? as : Label" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <div :class="ui.container({ class: props.ui?.container })">
      <CheckboxRoot
        :id="id"
        v-bind="{ ...rootProps, ...$attrs, ...ariaAttrs }"
        v-model="modelValue"
        :name="name"
        :disabled="disabled"
        :class="ui.base({ class: props.ui?.base })"
        @update:model-value="onUpdate"
      >
        <template #default="{ modelValue }">
          <CheckboxIndicator :class="ui.indicator({ class: props.ui?.indicator })">
            <Icon v-if="modelValue === 'indeterminate'" :name="indeterminateIcon || 'lucide:minus'" :class="ui.icon({ class: props.ui?.icon })" />
            <Icon v-else :name="icon || 'lucide:check'" :class="ui.icon({ class: props.ui?.icon })" />
          </CheckboxIndicator>
        </template>
      </CheckboxRoot>
    </div>

    <div v-if="(label || !!slots.label) || (description || !!slots.description)" :class="ui.wrapper({ class: props.ui?.wrapper })">
      <component :is="(!variant || variant === 'list') ? Label : 'p'" v-if="label || !!slots.label" :for="id" :class="ui.label({ class: props.ui?.label })">
        <slot name="label" :label="label">
          {{ label }}
        </slot>
      </component>
      <p v-if="description || !!slots.description" :class="ui.description({ class: props.ui?.description })">
        <slot name="description" :description="description">
          {{ description }}
        </slot>
      </p>
    </div>
  </Primitive>
</template>

<script lang="ts">
import type { CheckboxRootProps } from "reka-ui";
import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

const theme = tv({
  slots: {
    root: "relative flex items-start",
    container: "flex items-center",
    base: "rounded-sm ring ring-inset ring-accented overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2",
    indicator: "flex items-center justify-center size-full text-inverted",
    icon: "shrink-0 size-full",
    wrapper: "w-full",
    label: "block font-medium text-default",
    description: "text-muted",
  },
  variants: {
    color: {
      primary: {
        base: "focus-visible:outline-primary",
        indicator: "bg-primary",
      },
      secondary: {
        base: "focus-visible:outline-secondary",
        indicator: "bg-secondary",
      },
      success: {
        base: "focus-visible:outline-success",
        indicator: "bg-success",
      },
      info: {
        base: "focus-visible:outline-info",
        indicator: "bg-info",
      },
      warning: {
        base: "focus-visible:outline-warning",
        indicator: "bg-warning",
      },
      error: {
        base: "focus-visible:outline-error",
        indicator: "bg-error",
      },
      neutral: {
        base: "focus-visible:outline-inverted",
        indicator: "bg-inverted",
      },
    },
    variant: {
      list: {
        root: "",
      },
      card: {
        root: "border border-muted rounded-lg",
      },
    },
    indicator: {
      start: {
        root: "flex-row",
        wrapper: "ms-2",
      },
      end: {
        root: "flex-row-reverse",
        wrapper: "me-2",
      },
      hidden: {
        base: "sr-only",
        wrapper: "text-center",
      },
    },
    size: {
      xs: {
        base: "size-3",
        container: "h-4",
        wrapper: "text-xs",
      },
      sm: {
        base: "size-3.5",
        container: "h-4",
        wrapper: "text-xs",
      },
      md: {
        base: "size-4",
        container: "h-5",
        wrapper: "text-sm",
      },
      lg: {
        base: "size-4.5",
        container: "h-5",
        wrapper: "text-sm",
      },
      xl: {
        base: "size-5",
        container: "h-6",
        wrapper: "text-base",
      },
    },
    required: {
      true: {
        label: "after:content-['*'] after:ms-0.5 after:text-error",
      },
    },
    disabled: {
      true: {
        base: "cursor-not-allowed opacity-75",
        label: "cursor-not-allowed opacity-75",
        description: "cursor-not-allowed opacity-75",
      },
    },
    checked: {
      true: "",
    },
  },
  compoundVariants: [
    {
      size: "xs",
      variant: "card",
      class: {
        root: "p-2.5",
      },
    },
    {
      size: "sm",
      variant: "card",
      class: {
        root: "p-3",
      },
    },
    {
      size: "md",
      variant: "card",
      class: {
        root: "p-3.5",
      },
    },
    {
      size: "lg",
      variant: "card",
      class: {
        root: "p-4",
      },
    },
    {
      size: "xl",
      variant: "card",
      class: {
        root: "p-4.5",
      },
    },
    {
      color: "primary",
      variant: "card",
      class: {
        root: "has-data-[state=checked]:border-primary",
      },
    },
    {
      color: "neutral",
      variant: "card",
      class: {
        root: "has-data-[state=checked]:border-inverted",
      },
    },
    {
      variant: "card",
      disabled: true,
      class: {
        root: "cursor-not-allowed opacity-75",
      },
    },
  ],
  defaultVariants: {
    size: "md",
    color: "primary",
    variant: "list",
    indicator: "start",
  },

});

type CheckboxVariants = VariantProps<typeof theme>;
export interface CheckboxProps extends Pick<CheckboxRootProps, "disabled" | "required" | "name" | "value" | "id" | "defaultValue"> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;
  label?: string;
  description?: string;
  /**
   * @defaultValue 'primary'
   */
  color?: CheckboxVariants["color"];
  /**
   * @defaultValue 'list'
   */
  variant?: CheckboxVariants["variant"];
  /**
   * @defaultValue 'md'
   */
  size?: CheckboxVariants["size"];
  /**
   * Position of the indicator.
   * @defaultValue 'start'
   */
  indicator?: CheckboxVariants["indicator"];
  /**
   * The icon displayed when checked.
   * @defaultValue appConfig.ui.icons.check
   * @IconifyIcon
   */
  icon?: string;
  /**
   * The icon displayed when the checkbox is indeterminate.
   * @defaultValue appConfig.ui.icons.minus
   * @IconifyIcon
   */
  indeterminateIcon?: string;
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface CheckboxEmits {
  change: [payload: Event];
}

export interface CheckboxSlots {
  label(props: { label?: string }): any;
  description(props: { description?: string }): any;
}
</script>

<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { CheckboxIndicator, CheckboxRoot, Label, Primitive, useForwardProps } from "reka-ui";
import { computed, useId } from "vue";
import { Icon } from "@/components/ui/element";
import { useFormField } from "@/composables/useFormField";

defineOptions({ inheritAttrs: false });

const props = defineProps<CheckboxProps>();
const emits = defineEmits<CheckboxEmits>();
const slots = defineSlots<CheckboxSlots>();
const modelValue = defineModel<boolean | "indeterminate">({ default: undefined });

const rootProps = useForwardProps(reactivePick(props, "required", "value", "defaultValue"));

const { id: _id, emitFormChange, emitFormInput, size, color, name, disabled, ariaAttrs } = useFormField<CheckboxProps>(props);
const id = _id.value ?? useId();

const ui = computed(() => tv({ extend: theme })({
  size: size.value,
  color: color.value,
  variant: props.variant,
  indicator: props.indicator,
  required: props.required,
  disabled: disabled.value,
}));

function onUpdate(value: any) {
  // @ts-expect-error - 'target' does not exist in type 'EventInit'
  const event = new Event("change", { target: { value } });
  emits("change", event);
  emitFormChange();
  emitFormInput();
}
</script>
