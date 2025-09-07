<!-- eslint-disable vue/block-tag-newline -->
<template>
  <DropdownMenuRoot v-slot="{ open }" v-bind="rootProps">
    <DropdownMenuTrigger v-if="!!slots.default" as-child :class="props.class" :disabled="disabled">
      <slot :open="open"></slot>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      :class="ui.content({ class: [!slots.default && props.class, props.ui?.content] })"
      :ui="ui"
      :ui-override="props.ui"
      v-bind="contentProps"
      :items="items"
      :portal="portal"
      :label-key="(labelKey as keyof NestedItem<T>)"
      :checked-icon="checkedIcon"
      :loading-icon="loadingIcon"
      :external-icon="externalIcon"
    >
      <template v-for="(_, name) in proxySlots" #[name]="slotData">
        <slot :name="(name as keyof DropdownMenuSlots<T>)" v-bind="slotData"></slot>
      </template>

      <DropdownMenuArrow v-if="!!arrow" v-bind="arrowProps" :class="ui.arrow({ class: props.ui?.arrow })" />
    </DropdownMenuContent>
  </DropdownMenuRoot>
</template>

<script lang="ts">
import type { DropdownMenuArrowProps, DropdownMenuContentEmits, DropdownMenuContentProps, DropdownMenuRootEmits, DropdownMenuRootProps } from "reka-ui";
import type { AvatarProps, IconProps, KbdProps } from "@/components/ui/element";
import type { LinkProps } from "@/components/ui/link";
import type { ArrayOrNested, DynamicSlots, EmitsToProps, MergeTypes, NestedItem } from "@/types/utils";
import { tv, type VariantProps } from "tailwind-variants";

const theme = tv({
  slots: {
    content: "min-w-32 bg-base-100 shadow-lg rounded-md ring ring-base-200 overflow-hidden data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] origin-(--reka-dropdown-menu-content-transform-origin) flex flex-col",
    viewport: "relative divide-y divide-base-200 scroll-py-1 overflow-y-auto flex-1",
    arrow: "fill-base-100",
    group: "p-1 isolate",
    label: "w-full flex items-center font-semibold text-base-content",
    separator: "-mx-1 my-1 h-px bg-base-300",
    item: "group relative w-full flex items-center select-none outline-none before:absolute before:z-[-1] before:inset-px before:rounded-md data-disabled:cursor-not-allowed data-disabled:opacity-75",
    itemLeadingIcon: "shrink-0",
    itemLeadingAvatar: "shrink-0",
    itemLeadingAvatarSize: "",
    itemTrailing: "ms-auto inline-flex gap-1.5 items-center",
    itemTrailingIcon: "shrink-0",
    itemTrailingKbds: "hidden lg:inline-flex items-center shrink-0",
    itemTrailingKbdsSize: "",
    itemLabel: "truncate",
    itemLabelExternalIcon: "inline-block size-3 align-top text-base-content/60",
  },
  variants: {
    color: {
      primary: "",
      secondary: "",
      success: "",
      info: "",
      warning: "",
      error: "",
      neutral: "",
    },
    active: {
      true: {
        item: "text-base-content before:bg-base-200",
        itemLeadingIcon: "text-base-content",
      },
      false: {
        item: [
          "text-base-content/80 data-highlighted:text-base-content data-[state=open]:text-base-content data-highlighted:before:bg-base-200/50 data-[state=open]:before:bg-base-200/50",
          "transition-colors before:transition-colors",
        ],
        itemLeadingIcon: [
          "text-base-content/60 group-data-highlighted:text-base-content group-data-[state=open]:text-base-content",
          "transition-colors",
        ],
      },
    },
    loading: {
      true: {
        itemLeadingIcon: "animate-spin",
      },
    },
    size: {
      xs: {
        label: "p-1 text-xs gap-1",
        item: "p-1 text-xs gap-1",
        itemLeadingIcon: "size-4",
        itemLeadingAvatarSize: "3xs",
        itemTrailingIcon: "size-4",
        itemTrailingKbds: "gap-0.5",
        itemTrailingKbdsSize: "sm",
      },
      sm: {
        label: "p-1.5 text-xs gap-1.5",
        item: "p-1.5 text-xs gap-1.5",
        itemLeadingIcon: "size-4",
        itemLeadingAvatarSize: "3xs",
        itemTrailingIcon: "size-4",
        itemTrailingKbds: "gap-0.5",
        itemTrailingKbdsSize: "sm",
      },
      md: {
        label: "p-1.5 text-sm gap-1.5",
        item: "p-1.5 text-sm gap-1.5",
        itemLeadingIcon: "size-5",
        itemLeadingAvatarSize: "2xs",
        itemTrailingIcon: "size-5",
        itemTrailingKbds: "gap-0.5",
        itemTrailingKbdsSize: "md",
      },
      lg: {
        label: "p-2 text-sm gap-2",
        item: "p-2 text-sm gap-2",
        itemLeadingIcon: "size-5",
        itemLeadingAvatarSize: "2xs",
        itemTrailingIcon: "size-5",
        itemTrailingKbds: "gap-1",
        itemTrailingKbdsSize: "md",
      },
      xl: {
        label: "p-2 text-base gap-2",
        item: "p-2 text-base gap-2",
        itemLeadingIcon: "size-6",
        itemLeadingAvatarSize: "xs",
        itemTrailingIcon: "size-6",
        itemTrailingKbds: "gap-1",
        itemTrailingKbdsSize: "lg",
      },
    },
  },
  compoundVariants: [
    {
      color: "primary",
      active: false,
      class: {
        item: "text-primary data-highlighted:text-primary data-highlighted:before:bg-primary/10 data-[state=open]:before:bg-primary/10",
        itemLeadingIcon: "text-primary/75 group-data-highlighted:text-primary group-data-[state=open]:text-primary",
      },
    },
    {
      color: "primary",
      active: true,
      class: {
        item: "text-primary before:bg-primary/10",
        itemLeadingIcon: "text-primary",
      },
    },
  ],
  defaultVariants: {
    size: "md",
  },
});

type DropdownMenuVariants = VariantProps<typeof theme>;

export interface DropdownMenuItem extends Omit<LinkProps, "type" | "raw" | "custom"> {
  label?: string;
  /**
   * @IconifyIcon
   */
  icon?: IconProps["name"];
  color?: DropdownMenuVariants["color"];
  avatar?: AvatarProps;
  content?: Omit<DropdownMenuContentProps, "as" | "asChild" | "forceMount"> & Partial<EmitsToProps<DropdownMenuContentEmits>>;
  kbds?: KbdProps["value"][] | KbdProps[];
  /**
   * The item type.
   * @defaultValue 'link'
   */
  type?: "label" | "separator" | "link" | "checkbox";
  slot?: string;
  loading?: boolean;
  disabled?: boolean;
  checked?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  children?: ArrayOrNested<DropdownMenuItem>;
  onSelect?(e: Event): void;
  onUpdateChecked?(checked: boolean): void;
  class?: any;
  ui?: Pick<Partial<typeof theme.slots>, "item" | "label" | "separator" | "itemLeadingIcon" | "itemLeadingAvatarSize" | "itemLeadingAvatar" | "itemLabel" | "itemLabelExternalIcon" | "itemTrailing" | "itemTrailingIcon" | "itemTrailingKbds" | "itemTrailingKbdsSize">;
  [key: string]: any;
}

export interface DropdownMenuProps<T extends ArrayOrNested<DropdownMenuItem> = ArrayOrNested<DropdownMenuItem>> extends Omit<DropdownMenuRootProps, "dir"> {
  /**
   * @defaultValue 'md'
   */
  size?: DropdownMenuVariants["size"];
  items?: T;
  /**
   * The icon displayed when an item is checked.
   * @defaultValue appConfig.ui.icons.check
   * @IconifyIcon
   */
  checkedIcon?: IconProps["name"];
  /**
   * The icon displayed when an item is loading.
   * @defaultValue appConfig.ui.icons.loading
   * @IconifyIcon
   */
  loadingIcon?: IconProps["name"];
  /**
   * The icon displayed when the item is an external link.
   * Set to `false` to hide the external icon.
   * @defaultValue appConfig.ui.icons.external
   * @IconifyIcon
   */
  externalIcon?: boolean | IconProps["name"];
  /**
   * The content of the menu.
   * @defaultValue { side: 'bottom', sideOffset: 8, collisionPadding: 8 }
   */
  content?: Omit<DropdownMenuContentProps, "as" | "asChild" | "forceMount"> & Partial<EmitsToProps<DropdownMenuContentEmits>>;
  /**
   * Display an arrow alongside the menu.
   * @defaultValue false
   */
  arrow?: boolean | Omit<DropdownMenuArrowProps, "as" | "asChild">;
  /**
   * Render the menu in a portal.
   * @defaultValue true
   */
  portal?: boolean | string | HTMLElement;
  /**
   * The key used to get the label from the item.
   * @defaultValue 'label'
   */
  labelKey?: keyof NestedItem<T>;
  disabled?: boolean;
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface DropdownMenuEmits extends DropdownMenuRootEmits {}

type SlotProps<T extends DropdownMenuItem> = (props: { item: T; active?: boolean; index: number }) => any;

export type DropdownMenuSlots<
  A extends ArrayOrNested<DropdownMenuItem> = ArrayOrNested<DropdownMenuItem>,
  T extends NestedItem<A> = NestedItem<A>,
> = {
  "default"(props: { open: boolean }): any;
  "item": SlotProps<T>;
  "item-leading": SlotProps<T>;
  "item-label": SlotProps<T>;
  "item-trailing": SlotProps<T>;
  "content-top": (props?: {}) => any;
  "content-bottom": (props?: {}) => any;
} & DynamicSlots<MergeTypes<T>, "leading" | "label" | "trailing", { active?: boolean; index: number }>;
</script>

<script setup lang="ts" generic="T extends ArrayOrNested<DropdownMenuItem>">
import { reactivePick } from "@vueuse/core";
import { defu } from "defu";
import { DropdownMenuArrow, DropdownMenuRoot, DropdownMenuTrigger, useForwardPropsEmits } from "reka-ui";
import { computed, toRef } from "vue";
import { DropdownMenuContent } from "@/components/ui/overlay";
import { omit } from "@/utils";

const props = withDefaults(defineProps<DropdownMenuProps<T>>(), {
  portal: true,
  modal: true,
  externalIcon: true,
  labelKey: "label",
});
const emits = defineEmits<DropdownMenuEmits>();
const slots = defineSlots<DropdownMenuSlots<T>>();

const rootProps = useForwardPropsEmits(reactivePick(props, "defaultOpen", "open", "modal"), emits);
const contentProps = toRef(() => defu(props.content, { side: "bottom", sideOffset: 8, collisionPadding: 8 }) as DropdownMenuContentProps);
const arrowProps = toRef(() => props.arrow as DropdownMenuArrowProps);
const proxySlots = omit(slots, ["default"]);

const ui = computed(() => tv({ extend: theme })({
  size: props.size,
}));
</script>
