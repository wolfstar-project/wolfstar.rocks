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
    :id="id"
    v-slot="{ modelValue, open }"
    v-bind="{ ...rootProps, ...$attrs, ...ariaAttrs }"
    ignore-filter
    as-child
    :name="name"
    :disabled="disabled"
    @update:model-value="onUpdate"
    @update:open="onUpdateOpen"
  >
    <ComboboxAnchor as-child>
      <ComboboxTrigger ref="triggerRef" :class="ui.base({ class: [props.ui?.base, props.class] })" tabindex="0">
        <span v-if="isLeading || !!avatar || !!slots.leading" :class="ui.leading({ class: props.ui?.leading })">
          <slot name="leading" :model-value="(modelValue as GetModelValue<T, VK, M>)" :open="open" :ui="ui">
            <UIcon v-if="isLeading && leadingIconName" :name="leadingIconName" :class="ui.leadingIcon({ class: props.ui?.leadingIcon })" />
            <UAvatar v-else-if="!!avatar" :size="((props.ui?.itemLeadingAvatarSize || ui.itemLeadingAvatarSize()) as AvatarProps['size'])" v-bind="avatar" :class="ui.itemLeadingAvatar({ class: props.ui?.itemLeadingAvatar })" />
          </slot>
        </span>

        <slot :model-value="(modelValue as GetModelValue<T, VK, M>)" :open="open">
          <template v-for="displayedModelValue in [displayValue(modelValue as GetModelValue<T, VK, M>)]" :key="displayedModelValue">
            <span v-if="displayedModelValue !== undefined && displayedModelValue !== null" :class="ui.value({ class: props.ui?.value })">
              {{ displayedModelValue }}
            </span>
            <span v-else :class="ui.placeholder({ class: props.ui?.placeholder })">
              {{ placeholder ?? '&nbsp;' }}
            </span>
          </template>
        </slot>

        <span v-if="isTrailing || !!slots.trailing" :class="ui.trailing({ class: props.ui?.trailing })">
          <slot name="trailing" :model-value="(modelValue as GetModelValue<T, VK, M>)" :open="open" :ui="ui">
            <UIcon v-if="trailingIconName" :name="trailingIconName" :class="ui.trailingIcon({ class: props.ui?.trailingIcon })" />
          </slot>
        </span>
      </ComboboxTrigger>
    </ComboboxAnchor>

    <ComboboxPortal v-bind="portalProps">
      <ComboboxContent :class="ui.content({ class: props.ui?.content })" v-bind="contentProps">
        <FocusScope trapped :class="ui.focusScope({ class: props.ui?.focusScope })">
          <slot name="content-top"></slot>

          <ComboboxInput v-if="!!searchInput" v-model="searchTerm" :display-value="() => searchTerm" as-child>
            <UInput autofocus autocomplete="off" :size="size" v-bind="searchInputProps" :class="ui.input({ class: props.ui?.input })" />
          </ComboboxInput>

          <ComboboxEmpty :class="ui.empty({ class: props.ui?.empty })">
            <slot name="empty" :search-term="searchTerm">
              {{ searchTerm ? `Not matching ${searchTerm}` : 'No data' }}
            </slot>
          </ComboboxEmpty>

          <div role="presentation" :class="ui.viewport({ class: props.ui?.viewport })">
            <ReuseCreateItemTemplate v-if="createItem && createItemPosition === 'top'" />

            <ComboboxGroup v-for="(group, groupIndex) in filteredGroups" :key="`group-${groupIndex}`" :class="ui.group({ class: props.ui?.group })">
              <template v-for="(item, index) in group" :key="`group-${groupIndex}-${index}`">
                <ComboboxLabel v-if="isSelectItem(item) && item.type === 'label'" :class="ui.label({ class: [props.ui?.label, item.ui?.label, item.class] })">
                  {{ get(item, props.labelKey as string) }}
                </ComboboxLabel>

                <ComboboxSeparator v-else-if="isSelectItem(item) && item.type === 'separator'" :class="ui.separator({ class: [props.ui?.separator, item.ui?.separator, item.class] })" />

                <ComboboxItem
                  v-else
                  :class="ui.item({ class: [props.ui?.item, isSelectItem(item) && item.ui?.item, isSelectItem(item) && item.class] })"
                  :disabled="isSelectItem(item) && item.disabled"
                  :value="props.valueKey && isSelectItem(item) ? get(item, props.valueKey as string) : item"
                  @select="onSelect($event, item)"
                >
                  <slot name="item" :item="(item as NestedItem<T>)" :index="index">
                    <slot name="item-leading" :item="(item as NestedItem<T>)" :index="index">
                      <UIcon v-if="isSelectItem(item) && item.icon" :name="item.icon" :class="ui.itemLeadingIcon({ class: [props.ui?.itemLeadingIcon, item.ui?.itemLeadingIcon] })" />
                      <UAvatar v-else-if="isSelectItem(item) && item.avatar" :size="((item.ui?.itemLeadingAvatarSize || props.ui?.itemLeadingAvatarSize || ui.itemLeadingAvatarSize()) as AvatarProps['size'])" v-bind="item.avatar" :class="ui.itemLeadingAvatar({ class: [props.ui?.itemLeadingAvatar, item.ui?.itemLeadingAvatar] })" />
                      <UChip
                        v-else-if="isSelectItem(item) && item.chip"
                        :size="((props.ui?.itemLeadingChipSize || ui.itemLeadingChipSize()) as ChipProps['size'])"
                        inset
                        standalone
                        v-bind="item.chip"
                        :class="ui.itemLeadingChip({ class: [props.ui?.itemLeadingChip, item.ui?.itemLeadingChip] })"
                      />
                    </slot>

                    <span :class="ui.itemLabel({ class: [props.ui?.itemLabel, isSelectItem(item) && item.ui?.itemLabel] })">
                      <slot name="item-label" :item="(item as NestedItem<T>)" :index="index">
                        {{ isSelectItem(item) ? get(item, props.labelKey as string) : item }}
                      </slot>
                    </span>

                    <span :class="ui.itemTrailing({ class: [props.ui?.itemTrailing, isSelectItem(item) && item.ui?.itemTrailing] })">
                      <slot name="item-trailing" :item="(item as NestedItem<T>)" :index="index"></slot>

                      <ComboboxItemIndicator as-child>
                        <UIcon :name="selectedIcon || 'lucide:check'" :class="ui.itemTrailingIcon({ class: [props.ui?.itemTrailingIcon, isSelectItem(item) && item.ui?.itemTrailingIcon] })" />
                      </ComboboxItemIndicator>
                    </span>
                  </slot>
                </ComboboxItem>
              </template>
            </ComboboxGroup>

            <ReuseCreateItemTemplate v-if="createItem && createItemPosition === 'bottom'" />
          </div>

          <slot name="content-bottom"></slot>
        </FocusScope>

        <ComboboxArrow v-if="!!arrow" v-bind="arrowProps" :class="ui.arrow({ class: props.ui?.arrow })" />
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>

<script lang="ts">
import type { ComboboxArrowProps, ComboboxContentEmits, ComboboxContentProps, ComboboxRootEmits, ComboboxRootProps } from "reka-ui";
import type { AvatarProps, ChipProps, IconProps } from "@/components/ui/element";
import type { UseComponentIconsProps } from "@/composables/useComponentIcons";
import type { AcceptableValue, ArrayOrNested, EmitsToProps, GetItemKeys, GetItemValue, GetModelValue, GetModelValueEmits, NestedItem } from "@/types/utils";
import { tv, type VariantProps } from "tailwind-variants";

const theme = tv({
  slots: {
    base: [
      "relative group rounded-md inline-flex items-center focus:outline-none disabled:cursor-not-allowed disabled:opacity-75",
      "transition-colors",
    ],
    leading: "absolute inset-y-0 start-0 flex items-center",
    leadingIcon: "shrink-0 text-base-content/50",
    leadingAvatar: "shrink-0",
    leadingAvatarSize: "",
    trailing: "absolute inset-y-0 end-0 flex items-center",
    trailingIcon: "shrink-0 text-base-content/50",
    value: "truncate pointer-events-none",
    placeholder: "truncate text-base-content/50",
    arrow: "fill-base-100",
    content: [
      "max-h-60 w-(--reka-select-trigger-width) bg-base-100 shadow-lg rounded-md ring ring-base-200 overflow-hidden data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] origin-(--reka-select-content-transform-origin) pointer-events-auto flex flex-col",
      "origin-(--reka-combobox-content-transform-origin) w-(--reka-combobox-trigger-width)",
    ],
    viewport: "relative divide-y divide-base-200 scroll-py-1 overflow-y-auto flex-1",
    group: "p-1 isolate",
    empty: "text-center text-base-content/50",
    label: "font-semibold text-base-content",
    separator: "-mx-1 my-1 h-px bg-base-200",
    item: [
      "group relative w-full flex items-center select-none outline-none before:absolute before:z-[-1] before:inset-px before:rounded-md data-disabled:cursor-not-allowed data-disabled:opacity-75 text-base-content data-highlighted:not-data-disabled:text-base-content data-highlighted:not-data-disabled:before:bg-base-200/50",
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
    input: "border-b border-base-200",
    focusScope: "flex flex-col min-h-0",
  },
  variants: {
    fieldGroup: {
      horizontal: "not-only:first:rounded-e-none not-only:last:rounded-s-none not-last:not-first:rounded-none focus-visible:z-[1]",
      vertical: "not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none focus-visible:z-[1]",
    },
    size: {
      xs: {
        base: "px-2 py-1 text-xs gap-1",
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
        empty: "p-1 text-xs",
      },
      sm: {
        base: "px-2.5 py-1.5 text-xs gap-1.5",
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
        empty: "p-1.5 text-xs",
      },
      md: {
        base: "px-2.5 py-1.5 text-sm gap-1.5",
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
        empty: "p-1.5 text-sm",
      },
      lg: {
        base: "px-3 py-2 text-sm gap-2",
        leading: "ps-3",
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
        empty: "p-2 text-sm",
      },
      xl: {
        base: "px-3 py-2 text-base gap-2",
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
      file: "file:me-1.5 file:font-medium file:text-base-content/50 file:outline-none",
    },
  },
  compoundVariants: [
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
      class: "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-base-content",
    },
    {
      color: "neutral",
      highlight: true,
      class: "ring ring-inset ring-base-content",
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

type SelectMenuVariants = VariantProps<typeof theme>;

interface _SelectMenuItem {
  label?: string;
  /**
   * @IconifyIcon
   */
  icon?: IconProps["name"];
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
  ui?: Pick<Partial<typeof theme.slots>, "label" | "separator" | "item" | "itemLeadingIcon" | "itemLeadingAvatarSize" | "itemLeadingAvatar" | "itemLeadingChipSize" | "itemLeadingChip" | "itemLabel" | "itemTrailing" | "itemTrailingIcon">;
  [key: string]: any;
}
export type SelectMenuItem = _SelectMenuItem | AcceptableValue | boolean;

export interface SelectMenuProps<T extends ArrayOrNested<SelectMenuItem> = ArrayOrNested<SelectMenuItem>, VK extends GetItemKeys<T> | undefined = undefined, M extends boolean = false> extends Pick<ComboboxRootProps<T>, "open" | "defaultOpen" | "disabled" | "name" | "resetSearchTermOnBlur" | "resetSearchTermOnSelect" | "highlightOnHover">, UseComponentIconsProps {
  id?: string;
  /** The placeholder text when the select is empty. */
  placeholder?: string;
  /**
   * Whether to display the search input or not.
   * Can be an object to pass additional props to the input.
   * `{ placeholder: 'Search...', variant: 'none' }`{lang="ts-type"}
   * @defaultValue true
   */
  searchInput?: boolean | InputProps;
  /**
   * @defaultValue 'primary'
   */
  color?: SelectMenuVariants["color"];
  /**
   * @defaultValue 'outline'
   */
  variant?: SelectMenuVariants["variant"];
  /**
   * @defaultValue 'md'
   */
  size?: SelectMenuVariants["size"];
  required?: boolean;
  /**
   * The icon displayed to open the menu.
   * @defaultValue appConfig.ui.icons.chevronDown
   * @IconifyIcon
   */
  trailingIcon?: IconProps["name"];
  /**
   * The icon displayed when an item is selected.
   * @defaultValue appConfig.ui.icons.check
   * @IconifyIcon
   */
  selectedIcon?: IconProps["name"];
  /**
   * The content of the menu.
   * @defaultValue { side: 'bottom', sideOffset: 8, collisionPadding: 8, position: 'popper' }
   */
  content?: Omit<ComboboxContentProps, "as" | "asChild" | "forceMount"> & Partial<EmitsToProps<ComboboxContentEmits>>;
  /**
   * Display an arrow alongside the menu.
   * @defaultValue false
   * @IconifyIcon
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
  /** The value of the SelectMenu when initially rendered. Use when you do not need to control the state of the SelectMenu. */
  defaultValue?: GetModelValue<T, VK, M>;
  /** The controlled value of the SelectMenu. Can be binded-with with `v-model`. */
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
  autofocus?: boolean;
  autofocusDelay?: number;
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export type SelectMenuEmits<A extends ArrayOrNested<SelectMenuItem>, VK extends GetItemKeys<A> | undefined, M extends boolean> = Pick<ComboboxRootEmits, "update:open"> & {
  change: [event: Event];
  blur: [event: FocusEvent];
  focus: [event: FocusEvent];
  create: [item: string];
  /** Event handler when highlighted element changes. */
  highlight: [payload: {
    ref: HTMLElement;
    value: GetModelValue<A, VK, M>;
  } | undefined];
} & GetModelValueEmits<A, VK, M>;

type SlotProps<T extends SelectMenuItem> = (props: { item: T; index: number }) => any;

export interface SelectMenuSlots<
  A extends ArrayOrNested<SelectMenuItem> = ArrayOrNested<SelectMenuItem>,
  VK extends GetItemKeys<A> | undefined = undefined,
  M extends boolean = false,
  T extends NestedItem<A> = NestedItem<A>,
> {
  "leading"(props: {
    modelValue?: GetModelValue<A, VK, M>;
    open: boolean;
    ui: { [K in keyof Required<Partial<typeof theme.slots>>]: (props?: Record<string, any>) => string };
  }): any;
  "default"(props: {
    modelValue?: GetModelValue<A, VK, M>;
    open: boolean;
  }): any;
  "trailing"(props: {
    modelValue?: GetModelValue<A, VK, M>;
    open: boolean;
    ui: { [K in keyof Required<Partial<typeof theme.slots>>]: (props?: Record<string, any>) => string };
  }): any;
  "empty"(props: { searchTerm?: string }): any;
  "item": SlotProps<T>;
  "item-leading": SlotProps<T>;
  "item-label": SlotProps<T>;
  "item-trailing": SlotProps<T>;
  "content-top": (props?: object) => any;
  "content-bottom": (props?: object) => any;
  "create-item-label"(props: { item: string }): any;
}
</script>

<!-- eslint-disable vue/no-template-shadow -->
<script setup lang="ts" generic="T extends ArrayOrNested<SelectMenuItem>, VK extends GetItemKeys<T> | undefined = undefined, M extends boolean = false">
import { createReusableTemplate, reactivePick } from "@vueuse/core";
import { defu } from "defu";
import { ComboboxAnchor, ComboboxArrow, ComboboxContent, ComboboxEmpty, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxItemIndicator, ComboboxLabel, ComboboxPortal, ComboboxRoot, ComboboxSeparator, ComboboxTrigger, FocusScope, useFilter, useForwardPropsEmits } from "reka-ui";
import { computed, onMounted, ref, toRaw, toRef } from "vue";
import { Avatar, Chip, Icon } from "@/components/ui/element";
import { Input, type InputProps } from "@/components/ui/form";
import { useComponentIcons } from "@/composables/useComponentIcons";
import { useFieldGroup } from "@/composables/useFieldGroup";
import { useFormField } from "@/composables/useFormField";
import { usePortal } from "@/composables/usePortal";
import { compare, get, getDisplayValue, isArrayOfArray } from "@/utils/index";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<SelectMenuProps<T, VK, M>>(), {
  portal: true,
  searchInput: true,
  labelKey: "label" as never,
  resetSearchTermOnBlur: true,
  resetSearchTermOnSelect: true,
  autofocusDelay: 0,
});
const emits = defineEmits<SelectMenuEmits<T, VK, M>>();
const slots = defineSlots<SelectMenuSlots<T, VK, M>>();

const searchTerm = defineModel<string>("searchTerm", { default: "" });

const { contains } = useFilter({ sensitivity: "base" });

const rootProps = useForwardPropsEmits(reactivePick(props, "modelValue", "defaultValue", "open", "defaultOpen", "required", "multiple", "resetSearchTermOnBlur", "resetSearchTermOnSelect", "highlightOnHover"), emits);
const portalProps = usePortal(toRef(() => props.portal));
const contentProps = toRef(() => defu(props.content, { side: "bottom", sideOffset: 8, collisionPadding: 8, position: "popper" }) as ComboboxContentProps);
const arrowProps = toRef(() => props.arrow as ComboboxArrowProps);
const searchInputProps = toRef(() => defu(props.searchInput, { placeholder: "Search....", variant: "none" }) as InputProps);

const { emitFormBlur, emitFormFocus, emitFormInput, emitFormChange, size: formGroupSize, color, id, name, highlight, disabled, ariaAttrs } = useFormField<InputProps>(props);
const { orientation, size: fieldGroupSize } = useFieldGroup<InputProps>(props);
const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(toRef(() => defu(props, { trailingIcon: "lucide:chevron-down" })));

const selectSize = computed(() => fieldGroupSize.value || formGroupSize.value);

const [DefineCreateItemTemplate, ReuseCreateItemTemplate] = createReusableTemplate();

const ui = computed(() => tv({ extend: theme })({
  color: color.value,
  variant: props.variant,
  size: selectSize?.value,
  loading: props.loading,
  highlight: highlight.value,
  leading: isLeading.value || !!props.avatar || !!slots.leading,
  trailing: isTrailing.value || !!slots.trailing,
  fieldGroup: orientation.value,
}));

function displayValue(value: GetItemValue<T, VK> | GetItemValue<T, VK>[]): string | undefined {
  if (props.multiple && Array.isArray(value)) {
    const displayedValues = value
      .map(item => getDisplayValue(items.value, item, {
        labelKey: props.labelKey,
        valueKey: props.valueKey,
      }))
      .filter((v): v is string => v != null && v !== "");

    return displayedValues.length > 0 ? displayedValues.join(", ") : undefined;
  }

  return getDisplayValue(items.value, value, {
    labelKey: props.labelKey,
    valueKey: props.valueKey,
  });
}

const groups = computed<SelectMenuItem[][]>(() =>
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
    !isSelectItem(item) || (!item.type || !["label", "separator"].includes(item.type)),
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

const triggerRef = ref<InstanceType<typeof ComboboxTrigger> | null>(null);

function autoFocus() {
  if (props.autofocus) {
    triggerRef.value?.$el?.focus({
      focusVisible: true,
    });
  }
}

onMounted(() => {
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

function onSelect(e: Event, item: SelectMenuItem) {
  if (!isSelectItem(item)) {
    return;
  }

  if (item.disabled) {
    e.preventDefault();
    return;
  }

  item.onSelect?.(e);
}

function isSelectItem(item: SelectMenuItem): item is _SelectMenuItem {
  return typeof item === "object" && item !== null;
}

defineExpose({
  triggerRef,
});
</script>
