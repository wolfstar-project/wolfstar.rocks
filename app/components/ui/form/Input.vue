<template>
  <Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
    <input
      :id="id"
      ref="inputRef"
      :type="type"
      :value="modelValue"
      :name="name"
      :placeholder="placeholder"
      :class="ui.base({ class: props.ui?.base })"
      :disabled="disabled"
      :required="required"
      :autocomplete="autocomplete"
      v-bind="{ ...$attrs, ...ariaAttrs }"
      @input="onInput"
      @blur="onBlur"
      @change="onChange"
      @focus="emitFormFocus"
    />

    <slot></slot>

    <span v-if="isLeading || !!avatar || !!slots.leading" :class="ui.leading({ class: props.ui?.leading })">
      <slot name="leading">
        <Icon v-if="isLeading && leadingIconName" :name="leadingIconName" :class="ui.leadingIcon({ class: props.ui?.leadingIcon })" />
        <Avatar
          v-else-if="!!avatar"
          :size="(props.ui?.leadingAvatarSize || ui.leadingAvatarSize()) as AvatarProps['size']"
          v-bind="avatar"
          :class="ui.leadingAvatar({ class: props.ui?.leadingAvatar })"
        />
      </slot>
    </span>

    <span v-if="isTrailing || !!slots.trailing" :class="ui.trailing({ class: props.ui?.trailing })">
      <slot name="trailing">
        <Icon v-if="trailingIconName" :name="trailingIconName" :class="ui.trailingIcon({ class: props.ui?.trailingIcon })" />
      </slot>
    </span>
  </Primitive>
</template>

<script lang="ts">
import type { VariantProps } from "tailwind-variants";
import type { HTMLAttributes, InputHTMLAttributes } from "vue";
import type { UseComponentIconsProps } from "@/composables/useComponentIcons";
import type { PartialString } from "@/types/utils";
import { tv } from "tailwind-variants";

const input = tv({
  slots: {
    root: "relative inline-flex items-center",
    base: [
      "input w-full", // Using daisyUI input class
      "disabled:cursor-not-allowed disabled:opacity-50",
    ],
    leading: "absolute inset-y-0 start-0 flex items-center",
    leadingIcon: "shrink-0 text-base-content/50",
    leadingAvatar: "shrink-0",
    leadingAvatarSize: "",
    trailing: "absolute inset-y-0 end-0 flex items-center",
    trailingIcon: "shrink-0 text-base-content/50",
  },
  variants: {
    type: {
      file: "file:mr-1.5 file:font-medium file:text-gray-500 dark:file:text-gray-400 file:outline-none",
    },
    color: {
      primary: "input-primary",
      secondary: "input-secondary",
      success: "input-success",
      info: "input-info",
      warning: "input-warning",
      error: "input-error",
      neutral: "",
    },
    size: {
      xs: {
        base: "input-xs",
        leading: "ps-2",
        trailing: "pe-2",
        leadingIcon: "size-4",
        leadingAvatarSize: "3xs",
        trailingIcon: "size-4",
      },
      sm: {
        base: "input-sm",
        leading: "ps-2.5",
        trailing: "pe-2.5",
        leadingIcon: "size-4",
        leadingAvatarSize: "3xs",
        trailingIcon: "size-4",
      },
      md: {
        base: "input-md",
        leading: "ps-2.5",
        trailing: "pe-2.5",
        leadingIcon: "size-5",
        leadingAvatarSize: "2xs",
        trailingIcon: "size-5",
      },
      lg: {
        base: "input-lg",
        leading: "ps-3",
        trailing: "pe-3",
        leadingIcon: "size-5",
        leadingAvatarSize: "2xs",
        trailingIcon: "size-5",
      },
      xl: {
        base: "input-xl",
        leading: "ps-3",
        trailing: "pe-3",
        leadingIcon: "size-6",
        leadingAvatarSize: "xs",
        trailingIcon: "size-6",
      },
    },
    variant: {
      bordered: "input-bordered",
      ghost: "input-ghost",
      outline: "bg-trasparent",

    },
    leading: {
      true: "",
    },
    trailing: {
      true: "",
    },
    loading: {
      true: "",
    },
    highlight: {
      true: "",
    },
  },
  compoundVariants: [
    {
      color: "primary",
      variant: ["bordered"],
      class: "focus:ring-2 focus:ring-primary focus:outline-none",
    },
    {
      color: "primary",
      highlight: true,
      class: "ring-2 ring-primary",
    },
    {
      color: "neutral",
      variant: ["bordered"],
      class: "focus:ring-2 focus:ring-base-content focus:outline-none",
    },
    {
      color: "neutral",
      highlight: true,
      class: "ring-2 ring-base-content",
    },
    // Keep padding compound variants
    {
      leading: true,
      size: "xs",
      class: "ps-7",
    },
    {
      leading: true,
      size: "sm",
      class: "ps-8",
    },
    {
      leading: true,
      size: "md",
      class: "ps-9",
    },
    {
      leading: true,
      size: "lg",
      class: "ps-10",
    },
    {
      leading: true,
      size: "xl",
      class: "ps-11",
    },
    {
      trailing: true,
      size: "xs",
      class: "pe-7",
    },
    {
      trailing: true,
      size: "sm",
      class: "pe-8",
    },
    {
      trailing: true,
      size: "md",
      class: "pe-9",
    },
    {
      trailing: true,
      size: "lg",
      class: "pe-10",
    },
    {
      trailing: true,
      size: "xl",
      class: "pe-11",
    },
    {
      loading: true,
      leading: true,
      class: {
        leadingIcon: "animate-spin",
      },
    },
    {
      loading: true,
      leading: false,
      trailing: true,
      class: {
        trailingIcon: "animate-spin",
      },
    },
  ],
  defaultVariants: {
    size: "md",
    color: "primary",
    variant: "bordered",
  },
});

type InputVariants = VariantProps<typeof input>;

export interface InputProps extends UseComponentIconsProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;
  id?: string;
  name?: string;
  type?: InputHTMLAttributes["type"];
  /** The placeholder text when the input is empty. */
  placeholder?: string;
  /**
   * @defaultValue 'primary'
   */
  color?: InputVariants["color"];
  /**
   * @defaultValue 'bordered'
   */
  variant?: InputVariants["variant"];
  /**
   * @defaultValue 'md'
   */
  size?: InputVariants["size"];
  required?: boolean;
  autocomplete?: InputHTMLAttributes["autocomplete"];
  autofocus?: boolean;
  autofocusDelay?: number;
  disabled?: boolean;
  /** Highlight the ring color like a focus state. */
  highlight?: boolean;
  class?: HTMLAttributes["class"];
  ui?: PartialString<typeof input.slots>;
}

export interface InputEmits {
  (e: "update:modelValue", payload: string | number): void;
  (e: "blur", event: FocusEvent): void;
  (e: "change", event: Event): void;
}

export interface InputSlots {
  leading: (props?: object) => any;
  default: (props?: object) => any;
  trailing: (props?: object) => any;
}
</script>

<script setup lang="ts">
import type { AvatarProps } from "@/components/ui/element";
import { Primitive } from "reka-ui";
import { computed, onMounted, ref } from "vue";
import { Avatar, Icon } from "@/components/ui/element";
import { useFormField } from "@/composables/useFormField";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<InputProps>(), {
  type: "text",
  autocomplete: "off",
  autofocusDelay: 0,
});
const emits = defineEmits<InputEmits>();
const slots = defineSlots<InputSlots>();

const [modelValue, modelModifiers] = defineModel<string | number | null>();

const {
  emitFormBlur,
  emitFormInput,
  emitFormChange,
  size: formGroupSize,
  color,
  id,
  name,
  highlight,
  disabled,
  emitFormFocus,
  ariaAttrs,
} = useFormField<InputProps>(props, { deferInputValidation: true });
const { orientation, size: buttonGroupSize } = useFieldGroup<InputProps>(props);
const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(props);

const inputSize = computed(() => buttonGroupSize.value || formGroupSize.value);

const ui = computed(() =>
  input({
    type: props.type as InputVariants["type"],
    color: color.value,
    variant: props.variant,
    size: inputSize?.value,
    loading: props.loading,
    highlight: highlight.value,
    leading: isLeading.value || !!props.avatar || !!slots.leading,
    trailing: isTrailing.value || !!slots.trailing,
    // @ts-expect-error - is bug
    buttonGroup: orientation.value,
  }),
);

const inputRef = ref<HTMLInputElement | null>(null);

// Custom function to handle the v-model properties
function updateInput(value: string | null) {
  if (modelModifiers.trim) {
    value = value?.trim() ?? null;
  }

  if (modelModifiers.number || props.type === "number") {
    (value as any) = looseToNumber(value);
  }

  if (modelModifiers.nullify) {
    value ||= null;
  }

  modelValue.value = value;
  emitFormInput();
}

function onInput(event: Event) {
  if (!modelModifiers.lazy) {
    updateInput((event.target as HTMLInputElement).value);
  }
}

function onChange(event: Event) {
  const value = (event.target as HTMLInputElement).value;

  if (modelModifiers.lazy) {
    updateInput(value);
  }

  // Update trimmed input so that it has same behavior as native input https://github.com/vuejs/core/blob/5ea8a8a4fab4e19a71e123e4d27d051f5e927172/packages/runtime-dom/src/directives/vModel.ts#L63
  if (modelModifiers.trim) {
    (event.target as HTMLInputElement).value = value.trim();
  }

  emitFormChange();
  emits("change", event);
}

function onBlur(event: FocusEvent) {
  emitFormBlur();
  emits("blur", event);
}

function autoFocus() {
  if (props.autofocus) {
    inputRef.value?.focus();
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
