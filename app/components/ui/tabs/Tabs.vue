<template>
  <TabsRoot v-bind="rootProps" :class="ui.root({ class: [props.ui?.root, props.class] })" role="tablist">
    <TabsList :class="ui.list({ class: props.ui?.list })">
      <slot name="list-leading"></slot>

      <TabsTrigger
        v-for="(item, index) of items"
        :key="index"
        :ref="el => (triggersRef[index] = el as ComponentPublicInstance)"
        :value="item.value || String(index)"
        :disabled="item.disabled"
        :class="ui.trigger({ class: [props.ui?.trigger, item.ui?.trigger] })"
        role="tab"
      >
        <slot name="leading" :item="item" :index="index">
          <Icon v-if="item.icon" :name="item.icon" :class="ui.leadingIcon({ class: [props.ui?.leadingIcon, item.ui?.leadingIcon] })" />
          <Avatar v-else-if="item.avatar" :size="((item.ui?.leadingAvatarSize || props.ui?.leadingAvatarSize || ui.leadingAvatarSize()) as AvatarProps['size'])" v-bind="item.avatar" :class="ui.leadingAvatar({ class: [props.ui?.leadingAvatar, item.ui?.leadingAvatar] })" />
        </slot>

        <span v-if="get(item, props.labelKey as string) || !!slots.default" :class="ui.label({ class: [props.ui?.label, item.ui?.label] })">
          <slot :item="item" :index="index">{{ get(item, props.labelKey as string) }}</slot>
        </span>

        <slot name="trailing" :item="item" :index="index">
          <Badge
            v-if="item.badge !== undefined"
            color="neutral"
            variant="outline"
            :size="((item.ui?.trailingBadgeSize || props.ui?.trailingBadgeSize || ui.trailingBadgeSize()) as BadgeProps['size'])"
            v-bind="(typeof item.badge === 'string' || typeof item.badge === 'number') ? { label: item.badge } : item.badge"
            :class="ui.trailingBadge({ class: [props.ui?.trailingBadge, item.ui?.trailingBadge] })"
          />
        </slot>
      </TabsTrigger>

      <slot name="list-trailing"></slot>
    </TabsList>

    <template v-if="!!content">
      <TabsContent v-for="(item, index) of items" :key="index" :value="item.value || String(index)" :class="ui.content({ class: [props.ui?.content, item.ui?.content, item.class] })" role="tabpanel">
        <slot :name="((item.slot || 'content') as keyof TabsSlots<T>)" :item="(item as Extract<T, { slot: string; }>)" :index="index">
          {{ item.content }}
        </slot>
      </TabsContent>
    </template>
  </TabsRoot>
</template>

<script lang="ts">
import type { TabsRootEmits, TabsRootProps } from "reka-ui";
import type { VariantProps } from "tailwind-variants";
import type { AvatarProps } from "@/components/ui/avatar";
import type { BadgeProps } from "@/components/ui/badge";
import type { DynamicSlots } from "@/types/utils";
import { tv } from "tailwind-variants";

const tabs = tv({
  slots: {
    root: "tabs flex items-center gap-2",
    list: "relative flex p-1 group",
    indicator: "absolute transition-[translate,width] duration-200",
    trigger: [
      "group relative inline-flex items-center min-w-0 data-[state=inactive]:text-muted hover:data-[state=inactive]:not-disabled:text-default font-medium rounded-md disabled:cursor-not-allowed disabled:tab-disabled",
      "transition-colors",
    ],
    leadingIcon: "shrink-0",
    leadingAvatar: "shrink-0",
    leadingAvatarSize: "",
    label: "truncate",
    trailingBadge: "shrink-0",
    trailingBadgeSize: "sm",
    content: "focus:outline-none w-full ",
  },
  variants: {
    color: {
      ...Object.fromEntries(colors.map(color => [color, ""])),
    },
    variant: {
      pill: {
        list: "bg-elevated rounded-lg",
        trigger: "grow",
        indicator: "rounded-md shadow-xs ",
      },
      link: {
        list: "border-default",
        indicator: "rounded-full",
        trigger: "focus:outline-none ",
      },
      box: {
        list: "tab-box",
      },
      border: {
        list: "tab-border",
      },
      lift: {
        list: "tab-lift",
        trigger: "tab-content",
      },
    },
    orientation: {
      horizontal: {
        root: "flex-col",
        list: "w-full",
        indicator: "left-0 w-[--reka-tabs-indicator-size] translate-x-[--reka-tabs-indicator-position]",
        trigger: "justify-center ",
      },
      vertical: {
        list: "flex-col",
        indicator: "top-0 h-[--reka-tabs-indicator-size] translate-y-[--reka-tabs-indicator-position] ",
      },
    },
    size: {
      xs: {
        trigger: "px-2 py-1 text-xs gap-1",
        leadingIcon: "size-4",
        leadingAvatarSize: "3xs ",
      },
      sm: {
        trigger: "px-2.5 py-1.5 text-xs gap-1.5",
        leadingIcon: "size-4",
        leadingAvatarSize: "3xs ",
      },
      md: {
        trigger: "px-3 py-1.5 text-sm gap-1.5",
        leadingIcon: "size-5",
        leadingAvatarSize: "2xs ",
      },
      lg: {
        trigger: "px-3 py-2 text-sm gap-2",
        leadingIcon: "size-5",
        leadingAvatarSize: "2xs ",
      },
      xl: {
        trigger: "px-3 py-2 text-base gap-2",
        leadingIcon: "size-6",
        leadingAvatarSize: "xs ",
      },
    },
    active: {
      true: {
        root: "tab-active",
      },
      false: {
        root: "",
      },
    },
    responsive: {
      true: {
        label: "hidden sm:inline",
      },
    },
  },
  compoundVariants: [
    {
      orientation: "horizontal",
      variant: "pill",
      class: {
        indicator: "inset-y-1",
      },
    },
    {
      orientation: "horizontal",
      variant: "link",
      class: {
        list: "border-b -mb-px",
        indicator: "-bottom-px h-px ",
      },
    },
    {
      orientation: "vertical",
      variant: "pill",
      class: {
        indicator: "inset-x-1",
        list: "items-center ",
      },
    },
    {
      orientation: "vertical",
      variant: "link",
      class: {
        list: "border-s -ms-px",
        indicator: "-start-px w-px ",
      },
    },
    ...colors.map(color => ([
      {
        color,
        variant: "pill",
        class: {
          indicator: `bg-${color}`,
          trigger: `data-[state=active]:text-neutral data-[state=active]:tab-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-${color} `,
        },
      },
      {
        color,
        variant: "link",
        class: {
          indicator: `bg-${color}`,
          trigger: `data-[state=active]:text-${color} data-[state=active]:tab-active focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-${color} `,
        },
      },
      {
        color,
        variant: "box",
        class: {
          indicator: `bg-${color}`,
          trigger: `data-[state=active]:text-highlighted data-[state=active]:tab-active focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-${color} `,
        },
      },
      {
        color,
        variant: "border",
        class: {
          list: "border-b",
          indicator: `bg-${color}`,
          trigger: `data-[state=active]:text-highlighted data-[state=active]:tab-active focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-${color} `,
        },
      },
    ])) as any,
    {
      color: "primary",
      variant: "pill",
      class: {
        indicator: "bg-primary",
        trigger: "data-[state=active]:text-neutral data-[state=active]:tab-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ",
      },
    },
    {
      color: "neutral",
      variant: "pill",
      class: {
        indicator: "bg-neutral",
        trigger: "data-[state=active]:text-neutral data-[state=active]:tab-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral ",

      },
    },
    {
      color: "primary",
      variant: "link",
      class: {
        indicator: "bg-primary",
        trigger: "data-[state=active]:text-primary data-[state=active]:tab-active focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ",
      },
    },
    {
      color: "neutral",
      variant: "link",
      class: {
        indicator: "bg-neutral",
        trigger: "data-[state=active]:text-highlighted data-[state=active]:tab-active focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral ",
      },
    },
    {
      color: "neutral",
      variant: "box",
      class: {
        indicator: "bg-neutral",
        trigger: "data-[state=active]:text-highlighted data-[state=active]:tab-active focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral ",
      },
    },
    {
      color: "neutral",
      variant: "box",
      class: {
        indicator: "bg-neutral",
        trigger: "data-[state=active]:text-neutral data-[state=active]:tab-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral ",
      },
    },
    {
      color: "neutral",
      variant: "border",
      class: {
        list: "border-b",
        indicator: "bg-neutral",
        trigger: "data-[state=active]:text-highlighted data-[state=active]:tab-active focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral ",
      },
    },
  ],
  defaultVariants: {
    color: "primary",
    variant: "box",
    size: "md",
  },
});

type Tabs = VariantProps<typeof tabs>;

export interface TabsItem {
  label?: string;
  /**
   * @IconifyIcon
   */
  icon?: string;
  avatar?: AvatarProps;
  /**
   * Display a badge on the item.
   * `{ size: 'sm', color: 'neutral', variant: 'outline' }`{lang="ts-type"}
   */
  badge?: string | number | BadgeProps;
  slot?: string;
  content?: string;
  /** A unique value for the tab item. Defaults to the index. */
  value?: string | number;
  disabled?: boolean;
  class?: HTMLAttributes["class"];
  ui?: Partial<typeof tabs.slots>;
  [key: string]: any;
}

export interface TabsProps<T extends TabsItem = TabsItem> extends Pick<TabsRootProps<string | number>, "defaultValue" | "modelValue" | "activationMode" | "unmountOnHide"> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;
  items?: T[];
  /**
   * @defaultValue 'boxed'
   */
  variant?: Tabs["variant"];
  /**
   * @defaultValue 'md'
   */
  size?: Tabs["size"];
  /**
   * The orientation of the tabs.
   * @defaultValue 'horizontal'
   */
  orientation?: TabsRootProps["orientation"];
  /**
   * The content of the tabs, can be disabled to prevent rendering the content.
   * @defaultValue true
   */
  content?: boolean;
  /**
   * The key used to get the label from the item.
   * @defaultValue 'label'
   */
  labelKey?: string;
  class?: HTMLAttributes["class"];
  ui?: Partial<typeof tabs.slots>;
  color?: Tabs["color"];
  responsive?: boolean;
}
export interface TabsEmits extends TabsRootEmits<string | number> {}

type SlotProps<T extends TabsItem> = (props: { item: T; index: number }) => any;

export type TabsSlots<T extends TabsItem = TabsItem> = {
  "leading": SlotProps<T>;
  "default": SlotProps<T>;
  "trailing": SlotProps<T>;
  "content": SlotProps<T>;
  "size": SlotProps<T>;
  "list-leading": (props?: object) => any;
  "list-trailing": (props?: object) => any;
} & DynamicSlots<T, undefined, { index: number }>;
</script>

<script setup lang="ts" generic="T extends TabsItem">
import type { ComponentPublicInstance, HTMLAttributes } from "vue";
import { reactivePick } from "@vueuse/core";
import { TabsContent, TabsList, TabsRoot, TabsTrigger, useForwardPropsEmits } from "reka-ui";
import { computed, ref } from "vue";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

const props = withDefaults(defineProps<TabsProps<T>>(), {
  content: true,
  defaultValue: "0",
  active: undefined,
  orientation: "horizontal",
  unmountOnHide: true,
  labelKey: "label",
});
const emits = defineEmits<TabsEmits>();
const slots = defineSlots<TabsSlots<T>>();

const rootProps = useForwardPropsEmits(reactivePick(props, "as", "modelValue", "defaultValue", "orientation", "activationMode", "unmountOnHide"), emits);

const ui = computed(() => tabs({
  variant: props.variant,
  size: props.size,
  color: props.color,
  responsive: props.responsive,
}));

const triggersRef = ref<ComponentPublicInstance[]>([]);

defineExpose({
  triggersRef,
});
</script>
