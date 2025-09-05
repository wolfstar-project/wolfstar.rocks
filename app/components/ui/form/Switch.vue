<template>
  <Primitive :as="as" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <div :class="ui.container({ class: props.ui?.container })">
      <SwitchRoot
        :id="id"
        v-bind="{ ...rootProps, ...$attrs, ...ariaAttrs }"
        v-model="modelValue"
        :name="name"
        :disabled="disabled || loading"
        :class="ui.base({ class: props.ui?.base })"
        @update:model-value="onUpdate"
      >
        <SwitchThumb :class="ui.thumb({ class: props.ui?.thumb })">
          <Icon v-if="loading" :name="loadingIcon || 'lucide:loader'" :class="ui.icon({ class: props.ui?.icon, checked: true, unchecked: true })" />
          <template v-else>
            <Icon v-if="checkedIcon" :name="checkedIcon" :class="ui.icon({ class: props.ui?.icon, checked: true })" />
            <Icon v-if="uncheckedIcon" :name="uncheckedIcon" :class="ui.icon({ class: props.ui?.icon, unchecked: true })" />
          </template>
        </SwitchThumb>
      </SwitchRoot>
    </div>
    <div v-if="(label || !!slots.label) || (description || !!slots.description)" :class="ui.wrapper({ class: props.ui?.wrapper })">
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
import type { SwitchRootProps } from "reka-ui";
import type { IconProps } from "@/components/ui/element";
import { tv, type VariantProps } from "tailwind-variants";

const theme = tv({
  slots: {
    root: "relative flex items-start",
    base: [
      "toggle",
      "transition-[background] duration-200",
    ],
    container: "flex items-center",
    thumb: "group pointer-events-none flex items-center justify-center",
    icon: [
      "absolute shrink-0 opacity-0 size-10/12",
      "transition-[color,opacity] duration-200",
    ],
    wrapper: "ms-2",
    label: "block font-medium text-base-content",
    description: "text-base-content/60",
  },
  variants: {
    color: {
      primary: {
        base: "toggle-primary",
        icon: "group-data-[state=checked]:text-primary-content",
      },
      secondary: {
        base: "toggle-secondary",
        icon: "group-data-[state=checked]:text-secondary-content",
      },
      success: {
        base: "toggle-success",
        icon: "group-data-[state=checked]:text-success-content",
      },
      info: {
        base: "toggle-info",
        icon: "group-data-[state=checked]:text-info-content",
      },
      warning: {
        base: "toggle-warning",
        icon: "group-data-[state=checked]:text-warning-content",
      },
      error: {
        base: "toggle-error",
        icon: "group-data-[state=checked]:text-error-content",
      },
      neutral: {
        base: "toggle-neutral",
        icon: "group-data-[state=checked]:text-neutral-content",
      },
    },
    size: {
      xs: {
        base: "toggle-xs",
        wrapper: "text-xs",
      },
      sm: {
        base: "toggle-sm",
        wrapper: "text-xs",
      },
      md: {
        base: "toggle-md",
        wrapper: "text-sm",
      },
      lg: {
        base: "toggle-lg",
        wrapper: "text-sm",
      },
      xl: {
        base: "toggle-xl",
        wrapper: "text-base",
      },
    },
    checked: {
      true: {
        icon: "group-data-[state=checked]:opacity-100",
      },
    },
    unchecked: {
      true: {
        icon: "group-data-[state=unchecked]:opacity-100",
      },
    },
    loading: {
      true: {
        icon: "animate-spin",
      },
    },
    required: {
      true: {
        label: "after:content-['*'] after:ms-0.5 after:text-error",
      },
    },
    disabled: {
      true: {
        base: "toggle-disabled cursor-not-allowed opacity-75",
        label: "cursor-not-allowed opacity-75",
        description: "cursor-not-allowed opacity-75",
      },
    },
  },
  defaultVariants: {
    color: "primary",
    size: "md",
  },
});

type SwitchVariants = VariantProps<typeof theme>;

export interface SwitchProps extends Pick<SwitchRootProps, "disabled" | "id" | "name" | "required" | "value" | "defaultValue"> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;
  /**
   * @defaultValue 'primary'
   */
  color?: SwitchVariants["color"];
  /**
   * @defaultValue 'md'
   */
  size?: SwitchVariants["size"];
  /** When `true`, the loading icon will be displayed. */
  loading?: boolean;
  /**
   * The icon when the `loading` prop is `true`.
   * @defaultValue appConfig.ui.icons.loading
   * @IconifyIcon
   */
  loadingIcon?: IconProps["name"];
  /**
   * Display an icon when the switch is checked.
   * @IconifyIcon
   */
  checkedIcon?: IconProps["name"];
  /**
   * Display an icon when the switch is unchecked.
   * @IconifyIcon
   */
  uncheckedIcon?: IconProps["name"];
  label?: string;
  description?: string;
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface SwitchEmits {
  change: [event: Event];
}

export interface SwitchSlots {
  label(props: { label?: string }): any;
  description(props: { description?: string }): any;
}
</script>

<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { Label, Primitive, SwitchRoot, SwitchThumb, useForwardProps } from "reka-ui";
import { computed, useId } from "vue";
import { Icon } from "@/components/ui/element";
import { useFormField } from "@/composables/useFormField";

defineOptions({ inheritAttrs: false });

const props = defineProps<SwitchProps>();
const emits = defineEmits<SwitchEmits>();
const slots = defineSlots<SwitchSlots>();
const modelValue = defineModel<boolean>({ default: undefined });

const rootProps = useForwardProps(reactivePick(props, "required", "value", "defaultValue"));

const { id: _id, emitFormChange, emitFormInput, size, color, name, disabled, ariaAttrs } = useFormField<SwitchProps>(props);
const id = _id.value ?? useId();

const ui = computed(() => tv({ extend: theme })({
  size: size.value,
  color: color.value,
  required: props.required,
  loading: props.loading,
  disabled: disabled.value || props.loading,
}));

function onUpdate(value: any) {
  // @ts-expect-error - 'target' does not exist in type 'EventInit'
  const event = new Event("change", { target: { value } });
  emits("change", event);
  emitFormChange();
  emitFormInput();
}
</script>
