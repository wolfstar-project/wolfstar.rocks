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
import type { DynamicSlots } from "~/types/utils";
import { tv } from "tailwind-variants";

const tabs = tv({
  slots: {
    root: "tabs",
    list: "",
    trigger: "tab",
    content: "tab-content p-4",
    leadingIcon: "shrink-0",
    leadingAvatar: "shrink-0",
    leadingAvatarSize: "",
    label: "truncate",
    trailingBadge: "shrink-0",
    trailingBadgeSize: "sm",
  },
  variants: {
    variant: {
      boxed: {
        list: "tabs-boxed",
      },
      bordered: {
        list: "tabs-bordered",
      },
      lifted: {
        list: "tabs-lifted",
      },
    },
    size: {
      xs: "tabs-xs",
      sm: "tabs-sm",
      md: "tabs-md",
      lg: "tabs-lg",
    },
  },
  defaultVariants: {
    variant: "boxed",
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
}));

const triggersRef = ref<ComponentPublicInstance[]>([]);

defineExpose({
  triggersRef,
});
</script>
