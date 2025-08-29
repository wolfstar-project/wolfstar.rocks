<!-- vue/no-template-shadow -->
<template>
  <DefineCreateItemTemplate>
    <ComboboxGroup :class="ui.group({ class: props.ui?.group })">
      <ComboboxItem
        :class="ui.item({ class: props.ui?.item })"
        :value="searchTerm"
        @select.prevent="emits('create', searchTerm)"
      >
        <span :class="ui.itemLabel({ class: props.ui?.itemLabel })">
          <slot name="create-item-label" :item="searchTerm">
            {{ `Create: ${searchTerm}` }}
          </slot>
        </span>
      </ComboboxItem>
    </ComboboxGroup>
  </DefineCreateItemTemplate>

  <ComboboxRoot
    v-slot="{ modelValue, open }"
    v-bind="rootProps"
    :name="name"
    :disabled="disabled"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
    :as-child="!!multiple"
    ignore-filter
    @update:model-value="onUpdate"
    @update:open="onUpdateOpen"
    @keydown.enter="$event.preventDefault()"
  >
    <ComboboxAnchor :as-child="!multiple" :class="ui.base({ class: props.ui?.base })">
      <TagsInputRoot
        v-if="multiple"
        v-slot="{ modelValue: tags }"
        :model-value="(modelValue as string[])"
        :disabled="disabled"
        :required="required"
        delimiter=""
        as-child
        @blur="onBlur"
        @focus="onFocus"
        @remove-tag="onRemoveTag"
      >
        <TagsInputItem v-for="(item, index) in tags" :key="index" :value="item" :class="ui.tagsItem({ class: [props.ui?.tagsItem, isInputItem(item) && item.ui?.tagsItem] })">
          <TagsInputItemText :class="ui.tagsItemText({ class: [props.ui?.tagsItemText, isInputItem(item) && item.ui?.tagsItemText] })">
            <slot name="tags-item-text" :item="(item as NestedItem<T>)" :index="index">
              {{ displayValue(item as GetItemValue<T, VK>) }}
            </slot>
          </TagsInputItemText>

          <TagsInputItemDelete :class="ui.tagsItemDelete({ class: [props.ui?.tagsItemDelete, isInputItem(item) && item.ui?.tagsItemDelete] })" :disabled="disabled">
            <slot name="tags-item-delete" :item="(item as NestedItem<T>)" :index="index">
              <Icon :name="deleteIcon || 'heroicons:x-mark'" :class="ui.tagsItemDeleteIcon({ class: [props.ui?.tagsItemDeleteIcon, isInputItem(item) && item.ui?.tagsItemDeleteIcon] })" />
            </slot>
          </TagsInputItemDelete>
        </TagsInputItem>

        <ComboboxInput v-model="searchTerm" as-child>
          <TagsInputInput
            :id="id"
            ref="inputRef"
            v-bind="{ ...$attrs, ...ariaAttrs }"
            :placeholder="placeholder"
            :class="ui.tagsInput({ class: props.ui?.tagsInput })"
            @keydown.enter.prevent
          />
        </ComboboxInput>
      </TagsInputRoot>

      <ComboboxInput
        v-else
        :id="id"
        ref="inputRef"
        :display-value="displayValue"
        v-bind="{ ...$attrs, ...ariaAttrs }"
        :type="type"
        :placeholder="placeholder"
        :required="required"
        @blur="onBlur"
        @focus="onFocus"
        @update:model-value="searchTerm = $event"
      />

      <span v-if="isLeading || !!avatar || !!slots.leading" :class="ui.leading({ class: props.ui?.leading })">
        <slot name="leading" :model-value="(modelValue as GetModelValue<T, VK, M>)" :open="open" :ui="ui">
          <Icon v-if="isLeading && leadingIconName" :name="leadingIconName" :class="ui.leadingIcon({ class: props.ui?.leadingIcon })" />
          <Avatar v-else-if="!!avatar" :size="((props.ui?.itemLeadingAvatarSize || ui.itemLeadingAvatarSize()) as AvatarProps['size'])" v-bind="avatar" :class="ui.itemLeadingAvatar({ class: props.ui?.itemLeadingAvatar })" />
        </slot>
      </span>

      <ComboboxTrigger v-if="isTrailing || !!slots.trailing" :class="ui.trailing({ class: props.ui?.trailing })">
        <slot name="trailing" :model-value="(modelValue as GetModelValue<T, VK, M>)" :open="open" :ui="ui">
          <Icon v-if="trailingIconName" :name="trailingIconName" :class="ui.trailingIcon({ class: props.ui?.trailingIcon })" />
        </slot>
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxPortal v-bind="portalProps">
      <ComboboxContent :class="ui.content({ class: props.ui?.content })" v-bind="contentProps">
        <slot name="content-top"></slot>

        <ComboboxEmpty :class="ui.empty({ class: props.ui?.empty })">
          <slot name="empty" :search-term="searchTerm">
            {{ searchTerm ? `No match found for: ${searchTerm}` : 'No data' }}
          </slot>
        </ComboboxEmpty>

        <div role="presentation" :class="ui.viewport({ class: props.ui?.viewport })">
          <ReuseCreateItemTemplate v-if="createItem && createItemPosition === 'top'" />

          <ComboboxGroup v-for="(group, groupIndex) in filteredGroups" :key="`group-${groupIndex}`" :class="ui.group({ class: props.ui?.group })">
            <template v-for="(item, index) in group" :key="`group-${groupIndex}-${index}`">
              <ComboboxLabel v-if="isInputItem(item) && item.type === 'label'" :class="ui.label({ class: [props.ui?.label, item.ui?.label, item.class] })">
                {{ get(item, props.labelKey as string) }}
              </ComboboxLabel>

              <ComboboxSeparator v-else-if="isInputItem(item) && item.type === 'separator'" :class="ui.separator({ class: [props.ui?.separator, item.ui?.separator, item.class] })" />

              <ComboboxItem
                v-else
                :class="ui.item({ class: [props.ui?.item, isInputItem(item) && item.ui?.item, isInputItem(item) && item.class] })"
                :disabled="isInputItem(item) && item.disabled"
                :value="props.valueKey && isInputItem(item) ? get(item, props.valueKey as string) : item"
                @select="onSelect($event, item)"
              >
                <slot name="item" :item="(item as NestedItem<T>)" :index="index">
                  <slot name="item-leading" :item="(item as NestedItem<T>)" :index="index">
                    <Icon v-if="isInputItem(item) && item.icon" :name="item.icon" :class="ui.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon] })" />
                    <Avatar v-else-if="isInputItem(item) && item.avatar" :size="((item.ui?.itemLeadingAvatarSize || props.ui?.itemLeadingAvatarSize || ui.itemLeadingAvatarSize()) as AvatarProps['size'])" v-bind="item.avatar" :class="ui.itemLeadingAvatar({ class: [props.ui?.itemLeadingAvatar, item.ui?.itemLeadingAvatar] })" />
                    <Chip
                      v-else-if="isInputItem(item) && item.chip"
                      :size="((item.ui?.itemLeadingChipSize || props.ui?.itemLeadingChipSize || ui.itemLeadingChipSize()) as ChipProps['size'])"
                      inset
                      standalone
                      v-bind="item.chip"
                      :class="ui.itemLeadingChip({ class: [props.ui?.itemLeadingChip, item.ui?.itemLeadingChip] })"
                    />
                  </slot>

                  <span :class="ui.itemLabel({ class: [props.ui?.itemLabel, isInputItem(item) && item.ui?.itemLabel] })">
                    <slot name="item-label" :item="(item as NestedItem<T>)" :index="index">
                      {{ isInputItem(item) ? get(item, props.labelKey as string) : item }}
                    </slot>
                  </span>

                  <span :class="ui.itemTrailing({ class: [props.ui?.itemTrailing, isInputItem(item) && item.ui?.itemTrailing] })">
                    <slot name="item-trailing" :item="(item as NestedItem<T>)" :index="index"></slot>

                    <ComboboxItemIndicator as-child>
                      <Icon :name="selectedIcon || 'heroicons:check'" :class="ui.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, isInputItem(item) && item.ui?.itemTrailingIcon] })" />
                    </ComboboxItemIndicator>
                  </span>
                </slot>
              </ComboboxItem>
            </template>
          </ComboboxGroup>

          <ReuseCreateItemTemplate v-if="createItem && createItemPosition === 'bottom'" />
        </div>

        <slot name="content-bottom"></slot>

        <ComboboxArrow v-if="!!arrow" v-bind="arrowProps" :class="ui.arrow({ class: props.ui?.arrow })" />
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>

<script lang="ts">
import type { ComboboxArrowProps, ComboboxContentEmits, ComboboxContentProps, ComboboxRootEmits, ComboboxRootProps } from "reka-ui";
import type { VariantProps } from "tailwind-variants";
import type { InputHTMLAttributes } from "vue";
import type { ChipProps } from "@/components/ui/chip";
import type { InputProps } from "@/components/ui/input";
import type { UseComponentIconsProps } from "@/composables/useComponentIcons";
import type { AcceptableValue, ArrayOrNested, EmitsToProps, GetItemKeys, GetItemValue, GetModelValue, GetModelValueEmits, NestedItem } from "@/types/utils";
import { tv } from "tailwind-variants";

const theme = tv({
  slots: {
    root: "relative inline-flex items-center",
    base: [
      "input",
    ],
    leading: "absolute inset-y-0 start-0 flex items-center",
    leadingIcon: "shrink-0 text-base-content/50",
    leadingAvatar: "shrink-0",
    leadingAvatarSize: "",
    trailing: "group absolute inset-y-0 end-0 flex items-center disabled:cursor-not-allowed disabled:opacity-75",
    trailingIcon: "shrink-0 text-base-content/50",
    arrow: "fill-base-100",
    content: "max-h-60 w-(--reka-combobox-trigger-width) bg-base-100 shadow-lg rounded-md ring ring-base-300 overflow-hidden data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] origin-(--reka-combobox-content-transform-origin) pointer-events-auto flex flex-col",
    viewport: "relative divide-y divide-base-200 scroll-py-1 overflow-y-auto flex-1",
    group: "p-1 isolate",
    empty: "text-center text-base-content bg-base-300",
    label: "font-semibold text-base-content",
    separator: "-mx-1 my-1 h-px bg-base-300",
    item: [
      "group relative w-full flex items-center gap-1.5 p-1.5 text-sm select-none outline-none before:absolute before:z-[-1] before:inset-px before:rounded-md data-disabled:cursor-not-allowed data-disabled:opacity-75 text-base-content data-highlighted:not-data-disabled:text-base-content data-highlighted:not-data-disabled:before:bg-base-200",
      "transition-colors before:transition-colors",
    ],
    itemLeadingIcon: [
      "shrink-0 text-base-content/50 group-data-highlighted:not-group-data-disabled:text-base-content",
      "transition-colors",
    ],
    itemLeadingAvatar: "shrink-0",
    itemLeadingAvatarSize: "",
    itemLeadingChip: "shrink-0",
    itemLeadingChipSize: "",
    itemTrailing: "ms-auto inline-flex gap-1.5 items-center",
    itemTrailingIcon: "shrink-0",
    itemLabel: "truncate",
    tagsItem: "px-1.5 py-0.5 rounded-sm font-medium inline-flex items-center gap-0.5 ring ring-inset ring-base-300 bg-base-200 text-base-content data-disabled:cursor-not-allowed data-disabled:opacity-75",
    tagsItemText: "truncate",
    tagsItemDelete: [
      "inline-flex items-center rounded-xs text-base-content/50 hover:text-base-content hover:bg-base-300/75 disabled:pointer-events-none",
      "transition-colors",
    ],
    tagsItemDeleteIcon: "shrink-0",
    tagsInput: "flex-1 border-0 bg-transparent placeholder:text-base-content/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-75",
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
        base: "input-xs",
        leading: "ps-2",
        trailing: "pe-2",
        leadingIcon: "size-4",
        leadingAvatarSize: "3xs",
        trailingIcon: "size-4",
        label: "p-1 text-[10px]/3 gap-1",
        item: "p-1 text-xs gap-1",
        itemLeadingIcon: "size-4",
        itemLeadingAvatarSize: "3xs",
        itemLeadingChip: "size-4",
        itemLeadingChipSize: "sm",
        itemTrailingIcon: "size-4",
        tagsItem: "text-[10px]/3",
        tagsItemDeleteIcon: "size-3",
        empty: "p-1 text-xs",
      },
      sm: {
        base: "input-sm",
        leading: "ps-2.5",
        trailing: "pe-2.5",
        leadingIcon: "size-4",
        leadingAvatarSize: "3xs",
        trailingIcon: "size-4",
        label: "p-1.5 text-[10px]/3 gap-1.5",
        item: "p-1.5 text-xs gap-1.5",
        itemLeadingIcon: "size-4",
        itemLeadingAvatarSize: "3xs",
        itemLeadingChip: "size-4",
        itemLeadingChipSize: "sm",
        itemTrailingIcon: "size-4",
        tagsItem: "text-[10px]/3",
        tagsItemDeleteIcon: "size-3",
        empty: "p-1.5 text-xs",
      },
      md: {
        base: "input-md",
        leading: "ps-2.5",
        trailing: "pe-2.5",
        leadingIcon: "size-5",
        leadingAvatarSize: "2xs",
        trailingIcon: "size-5",
        label: "p-1.5 text-xs gap-1.5",
        item: "p-1.5 text-sm gap-1.5",
        itemLeadingIcon: "size-5",
        itemLeadingAvatarSize: "2xs",
        itemLeadingChip: "size-5",
        itemLeadingChipSize: "md",
        itemTrailingIcon: "size-5",
        tagsItem: "text-xs",
        tagsItemDeleteIcon: "size-3.5",
        empty: "p-1.5 text-sm",
      },
      lg: {
        base: "input-lg",
        leading: "ps-2",
        trailing: "pe-3",
        leadingIcon: "size-5",
        leadingAvatarSize: "2xs",
        trailingIcon: "size-5",
        label: "p-2 text-xs gap-2",
        item: "p-2 text-sm gap-2",
        itemLeadingIcon: "size-5",
        itemLeadingAvatarSize: "2xs",
        itemLeadingChip: "size-5",
        itemLeadingChipSize: "md",
        itemTrailingIcon: "size-5",
        tagsItem: "text-xs",
        tagsItemDeleteIcon: "size-3.5",
        empty: "p-2 text-sm",
      },
      xl: {
        base: "input-xl",
        leading: "ps-3",
        trailing: "pe-3",
        leadingIcon: "size-6",
        leadingAvatarSize: "xs",
        trailingIcon: "size-6",
        label: "p-2 text-sm gap-2",
        item: "p-2 text-base gap-2",
        itemLeadingIcon: "size-6",
        itemLeadingAvatarSize: "xs",
        itemLeadingChip: "size-6",
        itemLeadingChipSize: "lg",
        itemTrailingIcon: "size-6",
        tagsItem: "text-sm",
        tagsItemDeleteIcon: "size-4",
        empty: "p-2 text-base",
      },
    },
    variant: {
      outline: "text-base-content bg-base-100 ring ring-inset ring-base-300",
      soft: "text-base-content bg-base-200/50 hover:bg-base-200 focus:bg-base-200 disabled:bg-base-200/50",
      subtle: "text-base-content bg-base-200 ring ring-inset ring-base-300",
      ghost: "text-base-content bg-transparent hover:bg-base-200 focus:bg-base-200 disabled:bg-transparent dark:disabled:bg-transparent",
      none: "text-base-content bg-transparent",
    },
    color: {
      primary: "input-primary",
      secondary: "input-secondary",
      success: "input-success",
      info: "input-info",
      warning: "input-warning",
      error: "input-error",
      neutral: "input-neutral",
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
      file: "file:me-1.5 file:font-medium file:text-base-content/50 file:outline-none",
    },
    multiple: {
      true: {
        root: "flex flex-wrap",
      },
      false: {
        base: "w-full border-0 placeholder:text-base-content/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-75",
      },
    },
  },
  compoundVariants: [
    {
      variant: "soft",
      multiple: true,
      class: "has-focus:bg-elevated",
    },
    {
      variant: "ghost",
      multiple: true,
      class: "has-focus:bg-elevated",
    },
    {
      color: "primary",
      multiple: true,
      variant: [
        "outline",
        "subtle",
      ],
      class: "has-focus-visible:ring-2 has-focus-visible:ring-primary",
    },
    {
      color: "neutral",
      multiple: true,
      variant: [
        "outline",
        "subtle",
      ],
      class: "has-focus-visible:ring-2 has-focus-visible:ring-neutral",
    },
    {
      color: "primary",
      variant: [
        "outline",
        "subtle",
      ],
      class: "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
    },
    {
      color: "primary",
      highlight: true,
      class: "ring ring-inset ring-primary",
    },
    {
      color: "neutral",
      variant: [
        "outline",
        "subtle",
      ],
      class: "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral",
    },
    {
      color: "neutral",
      highlight: true,
      class: "ring ring-inset ring-neutral",
    },
    {
      color: "secondary",
      highlight: true,
      class: "ring ring-inset ring-secondary",
    },
    {
      color: "success",
      highlight: true,
      class: "ring ring-inset ring-success",
    },
    {
      color: "info",
      highlight: true,
      class: "ring ring-inset ring-info",
    },
    {
      color: "warning",
      highlight: true,
      class: "ring ring-inset ring-warning",
    },
    {
      color: "error",
      highlight: true,
      class: "ring ring-inset ring-error",
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

type InputMenu = VariantProps<typeof theme>;

interface _InputMenuItem {
  label?: string;
  /**
   * @IconifyIcon
   */
  icon?: string;
  avatar?: AvatarProps;
  chip?: ChipProps;
  /**
   * The item type.
   * @defaultValue 'item'
   */
  type?: "label" | "separator" | "item";
  disabled?: boolean;
  onSelect?(e?: Event): void;
  class?: any;
  ui?: Pick<typeof theme.slots, "tagsItem" | "tagsItemText" | "tagsItemDelete" | "tagsItemDeleteIcon" | "label" | "separator" | "item" | "itemLeadingIcon" | "itemLeadingAvatarSize" | "itemLeadingAvatar" | "itemLeadingChip" | "itemLeadingChipSize" | "itemLabel" | "itemTrailing" | "itemTrailingIcon">;
  [key: string]: any;
}
export type InputMenuItem = _InputMenuItem | AcceptableValue | boolean;

export interface InputMenuProps<T extends ArrayOrNested<InputMenuItem> = ArrayOrNested<InputMenuItem>, VK extends GetItemKeys<T> | undefined = undefined, M extends boolean = false> extends Pick<ComboboxRootProps<T>, "open" | "defaultOpen" | "disabled" | "name" | "resetSearchTermOnBlur" | "resetSearchTermOnSelect" | "highlightOnHover" | "openOnClick" | "openOnFocus">, UseComponentIconsProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;
  id?: string;
  type?: InputHTMLAttributes["type"];
  /** The placeholder text when the input is empty. */
  placeholder?: string;
  /**
   * @defaultValue 'primary'
   */
  color?: InputMenu["color"];
  /**
   * @defaultValue 'outline'
   */
  variant?: InputMenu["variant"];
  /**
   * @defaultValue 'md'
   */
  size?: InputMenu["size"];
  required?: boolean;
  autofocus?: boolean;
  autofocusDelay?: number;
  /**
   * The icon displayed to open the menu.
   * @defaultValue 'heroicons:chevron-down'
   * @IconifyIcon
   */
  trailingIcon?: string;
  /**
   * The icon displayed when an item is selected.
   * @defaultValue 'heroicons:check'
   * @IconifyIcon
   */
  selectedIcon?: string;
  /**
   * The icon displayed to delete a tag.
   * Works only when `multiple` is `true`.
   * @defaultValue 'heroicons:x-mark'
   * @IconifyIcon
   */
  deleteIcon?: string;
  /**
   * The content of the menu.
   * @defaultValue { side: 'bottom', sideOffset: 8, collisionPadding: 8, position: 'popper' }
   */
  content?: Omit<ComboboxContentProps, "as" | "asChild" | "forceMount"> & Partial<EmitsToProps<ComboboxContentEmits>>;
  /**
   * Display an arrow alongside the menu.
   * @defaultValue false
   */
  arrow?: boolean | Omit<ComboboxArrowProps, "as" | "asChild">;
  /**
   * Render the menu in a portal.
   * @defaultValue true
   */
  portal?: boolean | string | HTMLElement;
  /**
   * When `items` is an array of objects, select the field to use as the value instead of the object itself.
   * @defaultValue undefined
   */
  valueKey?: VK;
  /**
   * When `items` is an array of objects, select the field to use as the label.
   * @defaultValue 'label'
   */
  labelKey?: keyof NestedItem<T>;
  items?: T;
  /** The value of the InputMenu when initially rendered. Use when you do not need to control the state of the InputMenu. */
  defaultValue?: GetModelValue<T, VK, M>;
  /** The controlled value of the InputMenu. Can be binded-with with `v-model`. */
  modelValue?: GetModelValue<T, VK, M>;
  /** Whether multiple options can be selected or not. */
  multiple?: M & boolean;
  /** Highlight the ring color like a focus state. */
  highlight?: boolean;
  /**
   * Determines if custom user input that does not exist in options can be added.
   * @defaultValue false
   */
  createItem?: boolean | "always" | { position?: "top" | "bottom"; when?: "empty" | "always" };
  /**
   * Fields to filter items by.
   * @defaultValue [labelKey]
   */
  filterFields?: string[];
  /**
   * When `true`, disable the default filters, useful for custom filtering (useAsyncData, useFetch, etc.).
   * @defaultValue false
   */
  ignoreFilter?: boolean;
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export type InputMenuEmits<A extends ArrayOrNested<InputMenuItem>, VK extends GetItemKeys<A> | undefined, M extends boolean> = Pick<ComboboxRootEmits, "update:open"> & {
  "change": [payload: Event];
  "blur": [payload: FocusEvent];
  "focus": [payload: FocusEvent];
  "create": [item: string];
  /** Event handler when highlighted element changes. */
  "highlight": [payload: {
    ref: HTMLElement;
    value: GetModelValue<A, VK, M>;
  } | undefined];
  "remove-tag": [item: GetModelValue<A, VK, M>];
} & GetModelValueEmits<A, VK, M>;

type SlotProps<T extends InputMenuItem> = (props: { item: T; index: number }) => any;

export interface InputMenuSlots<
  A extends ArrayOrNested<InputMenuItem> = ArrayOrNested<InputMenuItem>,
  VK extends GetItemKeys<A> | undefined = undefined,
  M extends boolean = false,
  T extends NestedItem<A> = NestedItem<A>,
> {
  "leading"(props: {
    modelValue?: GetModelValue<A, VK, M>;
    open: boolean;
    ui: { [K in keyof Required<typeof theme.slots>]: (props?: Record<string, any>) => string };
  }): any;
  "trailing"(props: {
    modelValue?: GetModelValue<A, VK, M>;
    open: boolean;
    ui: { [K in keyof Required<typeof theme.slots>]: (props?: Record<string, any>) => string };
  }): any;
  "empty"(props: { searchTerm?: string }): any;
  "item": SlotProps<T>;
  "item-leading": SlotProps<T>;
  "item-label": SlotProps<T>;
  "item-trailing": SlotProps<T>;
  "tags-item-text": SlotProps<T>;
  "tags-item-delete": SlotProps<T>;
  "content-top": (props?: object) => any;
  "content-bottom": (props?: object) => any;
  "create-item-label"(props: { item: string }): any;
}
</script>

<script setup lang="ts" generic="T extends ArrayOrNested<InputMenuItem>, VK extends GetItemKeys<T> | undefined = undefined, M extends boolean = false">
import { createReusableTemplate, reactivePick } from "@vueuse/core";
import { defu } from "defu";
import { isEqual } from "ohash/utils";
import { ComboboxAnchor, ComboboxArrow, ComboboxContent, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxItemIndicator, ComboboxLabel, ComboboxPortal, ComboboxRoot, ComboboxSeparator, ComboboxTrigger, TagsInputInput, TagsInputItem, TagsInputItemDelete, TagsInputItemText, TagsInputRoot, useFilter, useForwardPropsEmits } from "reka-ui";
import { computed, nextTick, onMounted, ref, toRaw, toRef } from "vue";
import { Avatar, type AvatarProps } from "@/components/ui/avatar";
import { Chip } from "@/components/ui/chip";
import { Icon } from "@/components/ui/icon";
import { useComponentIcons } from "@/composables/useComponentIcons";
import { useFormField } from "@/composables/useFormField";
import { usePortal } from "@/composables/usePortal";
import { compare, get, getDisplayValue, isArrayOfArray } from "@/utils";
import { useFieldGroup } from "~/composables/useFieldGroup";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<InputMenuProps<T, VK, M>>(), {
  type: "text",
  autofocusDelay: 0,
  portal: true,
  labelKey: "label" as never,
  resetSearchTermOnBlur: true,
  resetSearchTermOnSelect: true,
});
const emits = defineEmits<InputMenuEmits<T, VK, M>>();
const slots = defineSlots<InputMenuSlots<T, VK, M>>();

const searchTerm = defineModel<string>("searchTerm", { default: "" });
const { contains } = useFilter({ sensitivity: "base" });

const rootProps = useForwardPropsEmits(reactivePick(props, "as", "modelValue", "defaultValue", "open", "defaultOpen", "required", "multiple", "resetSearchTermOnBlur", "resetSearchTermOnSelect", "highlightOnHover", "openOnClick", "openOnFocus"), emits);
const portalProps = usePortal(toRef(() => props.portal));
const contentProps = toRef(() => defu(props.content, { side: "bottom", sideOffset: 8, collisionPadding: 8, position: "popper" }) as ComboboxContentProps);
const arrowProps = toRef(() => props.arrow as ComboboxArrowProps);

const { emitFormBlur, emitFormFocus, emitFormChange, emitFormInput, size: formGroupSize, color, id, name, highlight, disabled, ariaAttrs } = useFormField<InputProps>(props);
const { orientation, size: fieldGroupSize } = useFieldGroup<InputProps>(props);
const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(toRef(() => defu(props, { trailingIcon: "lucide:chevron-down" })));

const inputSize = computed(() => fieldGroupSize.value || formGroupSize.value);

const [DefineCreateItemTemplate, ReuseCreateItemTemplate] = createReusableTemplate();

const ui = computed(() => tv({ extend: theme })({
  color: color.value,
  variant: props.variant,
  size: inputSize?.value,
  loading: props.loading,
  highlight: highlight.value,
  leading: isLeading.value || !!props.avatar || !!slots.leading,
  trailing: isTrailing.value || !!slots.trailing,
  multiple: props.multiple,
  buttonGroup: orientation.value,
}));

function displayValue(value: GetItemValue<T, VK>): string {
  return getDisplayValue(items.value, value, {
    labelKey: props.labelKey,
    valueKey: props.valueKey,
  }) ?? "";
}

const groups = computed<InputMenuItem[][]>(() =>
  props.items?.length
    ? isArrayOfArray(props.items)
      ? props.items
      : [props.items]
    : [],
);

const items = computed(() => groups.value.flatMap(group => group) as T[]);

const filteredGroups = computed(() => {
  if (props.ignoreFilter || !searchTerm.value) {
    return groups.value;
  }

  const fields = Array.isArray(props.filterFields) ? props.filterFields : [props.labelKey] as string[];

  return groups.value.map(items => items.filter((item) => {
    if (item === undefined || item === null) {
      return false;
    }

    if (typeof item !== "object") {
      return contains(String(item), searchTerm.value);
    }

    if (item.type && ["label", "separator"].includes(item.type)) {
      return true;
    }

    return fields.some((field) => {
      const value = get(item, field);
      return value !== undefined && value !== null && contains(String(value), searchTerm.value);
    });
  })).filter(group => group.filter(item =>
    !isInputItem(item) || (!item.type || !["label", "separator"].includes(item.type)),
  ).length > 0);
});
const filteredItems = computed(() => filteredGroups.value.flatMap(group => group));

const createItem = computed(() => {
  if (!props.createItem || !searchTerm.value) {
    return false;
  }

  const newItem = props.valueKey ? { [props.valueKey]: searchTerm.value } as NestedItem<T> : searchTerm.value;

  if ((typeof props.createItem === "object" && props.createItem.when === "always") || props.createItem === "always") {
    return !filteredItems.value.find(item => compare(item, newItem, props.valueKey as string));
  }

  return !filteredItems.value.length;
});
const createItemPosition = computed(() => typeof props.createItem === "object" ? props.createItem.position : "bottom");

const inputRef = ref<InstanceType<typeof ComboboxInput> | null>(null);

function autoFocus() {
  if (props.autofocus) {
    inputRef.value?.$el?.focus();
  }
}

onMounted(() => {
  nextTick(() => {
    searchTerm.value = "";
  });

  setTimeout(() => {
    autoFocus();
  }, props.autofocusDelay);
});

function onUpdate(value: any) {
  if (toRaw(props.modelValue) === value) {
    return;
  }
  // @ts-expect-error - 'target' does not exist in type 'EventInit'
  const event = new Event("change", { target: { value } });
  emits("change", event);
  emitFormChange();
  emitFormInput();

  if (props.resetSearchTermOnSelect) {
    searchTerm.value = "";
  }
}

function onBlur(event: FocusEvent) {
  emits("blur", event);
  emitFormBlur();
}

function onFocus(event: FocusEvent) {
  emits("focus", event);
  emitFormFocus();
}

function onUpdateOpen(value: boolean) {
  let timeoutId;

  if (!value) {
    const event = new FocusEvent("blur");

    emits("blur", event);
    emitFormBlur();

    // Since we use `displayValue` prop inside ComboboxInput we should reset searchTerm manually
    // https://reka-ui.com/docs/components/combobox#api-reference
    if (props.resetSearchTermOnBlur) {
      const STATE_ANIMATION_DELAY_MS = 100;

      timeoutId = setTimeout(() => {
        searchTerm.value = "";
      }, STATE_ANIMATION_DELAY_MS);
    }
  }
  else {
    const event = new FocusEvent("focus");
    emits("focus", event);
    emitFormFocus();
    clearTimeout(timeoutId);
  }
}

function onRemoveTag(event: any) {
  if (props.multiple) {
    const modelValue = props.modelValue as GetModelValue<T, VK, true>;
    const filteredValue = modelValue.filter(value => !isEqual(value, event));
    emits("update:modelValue", filteredValue as GetModelValue<T, VK, M>);
    emits("remove-tag", event);
    onUpdate(filteredValue);
  }
}

function onSelect(e: Event, item: InputMenuItem) {
  if (!isInputItem(item)) {
    return;
  }

  if (item.disabled) {
    e.preventDefault();
    return;
  }

  item.onSelect?.(e);
}

function isInputItem(item: InputMenuItem): item is _InputMenuItem {
  return typeof item === "object" && item !== null;
}

defineExpose({
  inputRef,
});
</script>
