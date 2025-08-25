<template>
  <TagsInputRoot
    :id="id"
    v-slot="{ modelValue: tags }"
    :model-value="modelValue"
    :default-value="defaultValue"
    :class="ui.root({ class: [ui.base({ class: props.ui?.base }), props.ui?.root, props.class] })"
    v-bind="rootProps"
    :name="name"
    :disabled="disabled"
    @update:model-value="onUpdate"
    @blur="onBlur"
    @focus="onFocus"
  >
    <TagsInputItem
      v-for="(item, index) in tags"
      :key="index"
      :value="item"
      :class="ui.item({ class: [props.ui?.item] })"
    >
      <TagsInputItemText :class="ui.itemText({ class: [props.ui?.itemText] })">
        <slot v-if="!!slots['item-text']" name="item-text" :item="(item as T)" :index="index"></slot>
      </TagsInputItemText>

      <TagsInputItemDelete
        :class="ui.itemDelete({ class: [props.ui?.itemDelete] })"
        :disabled="disabled"
      >
        <slot name="item-delete" :item="(item as T)" :index="index">
          <Icon :name="deleteIcon || 'ic:round-close'" :class="ui.itemDeleteIcon({ class: [props.ui?.itemDeleteIcon] })" />
        </slot>
      </TagsInputItemDelete>
    </TagsInputItem>

    <TagsInputInput
      ref="inputRef"
      v-bind="{ ...$attrs, ...ariaAttrs }"
      :placeholder="placeholder"
      :max-length="maxLength"
      :class="ui.input({ class: props.ui?.input })"
    />

    <slot></slot>

    <span v-if="isLeading || !!avatar || !!slots.leading" :class="ui.leading({ class: props.ui?.leading })">
      <slot name="leading">
        <Icon v-if="isLeading && leadingIconName" :name="leadingIconName" :class="ui.leadingIcon({ class: props.ui?.leadingIcon })" />
        <Avatar v-else-if="!!avatar" :size="((props.ui?.leadingAvatarSize || ui.leadingAvatarSize()) as AvatarProps['size'])" v-bind="avatar" :class="ui.leadingAvatar({ class: props.ui?.leadingAvatar })" />
      </slot>
    </span>

    <span v-if="isTrailing || !!slots.trailing" :class="ui.trailing({ class: props.ui?.trailing })">
      <slot name="trailing">
        <Icon v-if="trailingIconName" :name="trailingIconName" :class="ui.trailingIcon({ class: props.ui?.trailingIcon })" />
      </slot>
    </span>
  </TagsInputRoot>
</template>

<script lang="ts">
import type { AcceptableInputValue, TagsInputRootEmits, TagsInputRootProps } from "reka-ui";
import type { UseComponentIconsProps } from "@/composables/useComponentIcons";
import { tv, type VariantProps } from "tailwind-variants";

const theme = tv({
  slots: {
    root: [
      "relative inline-flex items-center",
      "flex-wrap",
    ],
    base: [
      "rounded-md",
      "transition-colors",
    ],
    leading: "absolute inset-y-0 start-0 flex items-center",
    leadingIcon: "shrink-0 text-dimmed",
    leadingAvatar: "shrink-0",
    leadingAvatarSize: "",
    trailing: "absolute inset-y-0 end-0 flex items-center",
    trailingIcon: "shrink-0 text-dimmed",
    item: "badge badge-neutral data-[state=active]:badge-accent data-disabled:badge-ghost",
    itemText: "",
    itemDelete: "btn btn-ghost btn-circle btn-xs",
    itemDeleteIcon: "shrink-0",
    input: "flex-1 bg-transparent placeholder:text-dimmed focus:outline-none disabled:cursor-not-allowed disabled:opacity-75",
  },
  variants: {
    buttonGroup: {
      horizontal: {
        root: "group has-focus-visible:z-[1]",
        base: "group-not-only:group-first:rounded-e-none group-not-only:group-last:rounded-s-none group-not-last:group-not-first:rounded-none",
      },
      vertical: {
        root: "group has-focus-visible:z-[1]",
        base: "group-not-only:group-first:rounded-b-none group-not-only:group-last:rounded-t-none group-not-last:group-not-first:rounded-none",
      },
    },
    size: {
      xs: {
        base: "input input-xs",
        leadingIcon: "size-4",
        leadingAvatarSize: "3xs",
        trailingIcon: "size-4",
        item: "badge-xs",
        itemDeleteIcon: "size-3",
      },
      sm: {
        base: "input input-sm",
        leadingIcon: "size-4",
        leadingAvatarSize: "3xs",
        trailingIcon: "size-4",
        item: "badge-sm",
        itemDeleteIcon: "size-3",
      },
      md: {
        base: "input input-md",
        leadingIcon: "size-5",
        leadingAvatarSize: "2xs",
        trailingIcon: "size-5",
        item: "badge-md",
        itemDeleteIcon: "size-3.5",
      },
      lg: {
        base: "input input-lg",
        leadingIcon: "size-5",
        leadingAvatarSize: "2xs",
        trailingIcon: "size-5",
        item: "badge-lg",
        itemDeleteIcon: "size-3.5",
      },
      xl: {
        base: "input input-xl",
        leadingIcon: "size-6",
        leadingAvatarSize: "xs",
        trailingIcon: "size-6",
        item: "badge-xl",
        itemDeleteIcon: "size-4",
      },
    },
    variant: {
      outline: "input-bordered",
      soft: "input-ghost",
      subtle: "input-bordered",
      ghost: "input-ghost",
      none: "border-none bg-transparent",
    },
    color: {
      primary: "",
      secondary: "",
      success: "",
      info: "",
      warning: "",
      error: "",
      neutral: "",
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
    type: {
      file: "file:me-1.5 file:font-medium file:text-muted file:outline-none",
    },
  },
  compoundVariants: [
    {
      color: "primary",
      variant: [
        "outline",
        "subtle",
      ],
      class: "input-primary",
    },
    {
      color: "primary",
      highlight: true,
      class: "input-primary",
    },
    {
      color: "neutral",
      variant: [
        "outline",
        "subtle",
      ],
      class: "input-neutral",
    },
    {
      color: "neutral",
      highlight: true,
      class: "input-neutral",
    },
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
    variant: "outline",
  },
});

type InputTags = VariantProps<typeof theme>;

export type InputTagItem = AcceptableInputValue;

export interface InputTagsProps<T extends InputTagItem = InputTagItem> extends Pick<TagsInputRootProps<T>, "modelValue" | "defaultValue" | "addOnPaste" | "addOnTab" | "addOnBlur" | "duplicate" | "disabled" | "delimiter" | "max" | "id" | "convertValue" | "displayValue" | "name" | "required">, UseComponentIconsProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;
  /** The placeholder text when the input is empty. */
  placeholder?: string;
  /** The maximum number of character allowed. */
  maxLength?: number;
  /**
   * @defaultValue 'primary'
   */
  color?: InputTags["color"];
  /**
   * @defaultValue 'outline'
   */
  variant?: InputTags["variant"];
  /**
   * @defaultValue 'md'
   */
  size?: InputTags["size"];
  autofocus?: boolean;
  autofocusDelay?: number;
  /**
   * The icon displayed to delete a tag.
   * @defaultValue 'heroicons:x-mark'
   * @IconifyIcon
   */
  deleteIcon?: string;
  /** Highlight the ring color like a focus state. */
  highlight?: boolean;
  class?: any;
  ui?: typeof theme.slots;
}

export interface InputTagsEmits<T extends InputTagItem> extends TagsInputRootEmits<T> {
  change: [event: Event];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
}

type SlotProps<T extends InputTagItem> = (props: { item: T; index: number }) => any;

export interface InputTagsSlots<T extends InputTagItem = InputTagItem> {
  "leading"(props?: {}): any;
  "default"(props?: {}): any;
  "trailing"(props?: {}): any;
  "item-text": SlotProps<T>;
  "item-delete": SlotProps<T>;
}
</script>

<script setup lang="ts" generic="T extends InputTagItem">
import { reactivePick } from "@vueuse/core";
import { TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText, TagsInputRoot, useForwardPropsEmits } from "reka-ui";
import { computed, onMounted, ref, toRaw } from "vue";
import { Avatar, type AvatarProps } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { useButtonGroup } from "@/composables/useButtonGroup";
import { useComponentIcons } from "@/composables/useComponentIcons";
import { useFormField } from "@/composables/useFormField";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<InputTagsProps<T>>(), {
  type: "text",
  autofocusDelay: 0,
});
const emits = defineEmits<InputTagsEmits<T>>();
const slots = defineSlots<InputTagsSlots<T>>();

const rootProps = useForwardPropsEmits(reactivePick(props, "as", "addOnPaste", "addOnTab", "addOnBlur", "duplicate", "delimiter", "max", "convertValue", "displayValue", "required"), emits);

const { emitFormBlur, emitFormFocus, emitFormChange, emitFormInput, size: formGroupSize, color, id, name, highlight, disabled, ariaAttrs } = useFormField<InputTagsProps>(props);
const { orientation, size: buttonGroupSize } = useButtonGroup<InputTagsProps>(props);
const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(props);

const inputSize = computed(() => buttonGroupSize.value || formGroupSize.value);

const ui = computed(() => tv({ extend: tv(theme) })({
  color: color.value,
  variant: props.variant,
  size: inputSize?.value,
  loading: props.loading,
  highlight: highlight.value,
  leading: isLeading.value || !!props.avatar || !!slots.leading,
  trailing: isTrailing.value || !!slots.trailing,
  buttonGroup: orientation.value,
}));

const inputRef = ref<InstanceType<typeof TagsInputInput> | null>(null);

onMounted(() => {
  setTimeout(() => {
    autoFocus();
  }, props.autofocusDelay);
});

function autoFocus() {
  if (props.autofocus) {
    inputRef.value?.$el?.focus();
  }
}

function onUpdate(value: T[]) {
  if (toRaw(props.modelValue) === value) {
    return;
  }
  // @ts-expect-error - 'target' does not exist in type 'EventInit'
  const event = new Event("change", { target: { value } });
  emits("change", event);
  emitFormChange();
  emitFormInput();
}

function onBlur(event: FocusEvent) {
  emits("blur", event);
  emitFormBlur();
}

function onFocus(event: FocusEvent) {
  emits("focus", event);
  emitFormFocus();
}

defineExpose({
  inputRef,
});
</script>
