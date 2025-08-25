<!-- eslint-disable vue/no-template-shadow -->
<template>
  <Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
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
          <CheckboxIndicator as-child>
            <Icon
              v-if="modelValue === 'indeterminate'"
              :name="indeterminateIcon || 'ic:baseline-minus'"
              :class="ui.icon({ class: props.ui?.icon })"
            />
            <Icon v-else :name="icon || 'ic:baseline-check'" :class="ui.icon({ class: props.ui?.icon })" />
          </CheckboxIndicator>
        </template>
      </CheckboxRoot>
    </div>

    <div v-if="label || !!slots.label || description || !!slots.description" :class="ui.wrapper({ class: props.ui?.wrapper })">
      <Label v-if="label || !!slots.label" :for="id" :class="ui.label({ class: props.ui?.label })">
        <slot name="label" :label="label">
          {{ label }}
        </slot>
      </Label>
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

const checkbox = tv({
  slots: {
    root: "relative flex items-start",
    base: [
      "checkbox", // daisyUI base checkbox class
      "rounded focus-visible:outline-2 focus-visible:outline-offset-2",
    ],
    container: "flex items-center",
    wrapper: "ms-2",
    icon: "size-full shrink-0",
    label: "block font-medium text-base-content",
    description: "text-base-content/60",
    indicator: "flex items-center justify-center size-full text-base-content",

  },
  variants: {
    color: {
      ...Object.fromEntries(colors.map((color: string) => [color, { indicator: `checkbox-${color}` }])) as {
        [key in UIColors]: {
          indicator: string;
        };
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
        base: "checkbox-xs",
        container: "h-4",
        wrapper: "text-xs",
      },
      sm: {
        base: "checkbox-sm",
        container: "h-4",
        wrapper: "text-xs",
      },
      md: {
        base: "checkbox-md",
        container: "h-5",
        wrapper: "text-sm",
      },
      lg: {
        base: "checkbox-lg",
        container: "h-5",
        wrapper: "text-sm",
      },
      xl: {
        base: "checkbox-xl",
        container: "h-6",
        wrapper: "text-base",
      },
    },
    required: {
      true: {
        label: "after:ms-0.5 after:text-error after:content-['*']",
      },
    },
    disabled: {
      true: {
        base: "cursor-not-allowed opacity-50",
        label: "cursor-not-allowed opacity-50",
        description: "cursor-not-allowed opacity-50",
      },
    },
    checked: {
      true: "",
    },
  },
  compoundVariants: [
    ...(colors.map((color: string) => ({
      color,
      checked: true,
      class: `ring-2 ring-${color} bg-${color}`,
    })) as any),
    {
      color: "neutral",
      checked: true,
      class: "bg-base-content ring-2 ring-base-content",
    },
  ],
  defaultVariants: {
    size: "md",
    color: "primary",
  },
});

type Checkbox = VariantProps<typeof checkbox>;

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
  color?: Checkbox["color"];
  /**
   * @defaultValue 'list'
   */
  variant?: Checkbox["variant"];
  /**
   * @defaultValue 'md'
   */
  size?: Checkbox["size"];
  /**
   * Position of the indicator.
   * @defaultValue 'start'
   */
  indicator?: Checkbox["indicator"];
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
  ui?: Partial<typeof checkbox.slots>;
}

interface CheckboxEmits {
  change: [payload: Event];
}

interface CheckboxSlots {
  label: (props: { label?: string }) => any;
  description: (props: { description?: string }) => any;
}
</script>

<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { CheckboxIndicator, CheckboxRoot, Label, Primitive, useForwardProps } from "reka-ui";
import { computed, useId } from "vue";
import { Icon } from "@/components/ui/icon";
import { useFormField } from "@/composables/useFormField";

defineOptions({ inheritAttrs: false });

const props = defineProps<CheckboxProps>();
const emits = defineEmits<CheckboxEmits>();
const slots = defineSlots<CheckboxSlots>();
const modelValue = defineModel<boolean | "indeterminate">({ default: undefined });

const rootProps = useForwardProps(reactivePick(props, "required", "value", "defaultValue"));

const { id: _id, emitFormChange, emitFormInput, size, color, name, disabled, ariaAttrs } = useFormField<CheckboxProps>(props);
const id = _id.value ?? useId();

const ui = computed(() => checkbox({
  size: size.value,
  color: color.value,
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
