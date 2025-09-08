<!-- eslint-disable vue/block-tag-newline -->
<template>
  <DefineItemTemplate v-slot="{ item, active, index }">
    <slot :name="((item.slot || 'item') as keyof DropdownMenuContentSlots<T>)" :item="(item as Extract<NestedItem<T>, { slot: string; }>)" :index="index">
      <slot :name="((item.slot ? `${item.slot}-leading` : 'item-leading') as keyof DropdownMenuContentSlots<T>)" :item="(item as Extract<NestedItem<T>, { slot: string; }>)" :active="active" :index="index">
        <Icon v-if="item.loading" :name="loadingIcon || 'lucide:loading'" :class="ui.itemLeadingIcon({ class: [uiOverride?.itemLeadingIcon, item.ui?.itemLeadingIcon], color: item?.color, loading: true })" />
        <Icon v-else-if="item.icon" :name="item.icon" :class="ui.itemLeadingIcon({ class: [uiOverride?.itemLeadingIcon, item.ui?.itemLeadingIcon], color: item?.color, active })" />
        <Avatar v-else-if="item.avatar" :size="((item.ui?.itemLeadingAvatarSize || uiOverride?.itemLeadingAvatarSize || ui.itemLeadingAvatarSize()) as AvatarProps['size'])" v-bind="item.avatar" :class="ui.itemLeadingAvatar({ class: [uiOverride?.itemLeadingAvatar, item.ui?.itemLeadingAvatar], active })" />
      </slot>

      <span v-if="get(item, props.labelKey as string) || !!slots[(item.slot ? `${item.slot}-label` : 'item-label') as keyof DropdownMenuContentSlots<T>]" :class="ui.itemLabel({ class: [uiOverride?.itemLabel, item.ui?.itemLabel], active })">
        <slot :name="((item.slot ? `${item.slot}-label` : 'item-label') as keyof DropdownMenuContentSlots<T>)" :item="(item as Extract<NestedItem<T>, { slot: string; }>)" :active="active" :index="index">
          {{ get(item, props.labelKey as string) }}
        </slot>

        <UIcon v-if="item.target === '_blank' && externalIcon !== false" :name="typeof externalIcon === 'string' ? externalIcon : 'lucide:external-link'" :class="ui.itemLabelExternalIcon({ class: [uiOverride?.itemLabelExternalIcon, item.ui?.itemLabelExternalIcon], color: item?.color, active })" />
      </span>

      <span :class="ui.itemTrailing({ class: [uiOverride?.itemTrailing, item.ui?.itemTrailing] })">
        <slot :name="((item.slot ? `${item.slot}-trailing` : 'item-trailing') as keyof DropdownMenuContentSlots<T>)" :item="(item as Extract<NestedItem<T>, { slot: string; }>)" :active="active" :index="index">
          <UIcon v-if="item.children?.length" :name="childrenIcon" :class="ui.itemTrailingIcon({ class: [uiOverride?.itemTrailingIcon, item.ui?.itemTrailingIcon], color: item?.color, active })" />
          <span v-else-if="item.kbds?.length" :class="ui.itemTrailingKbds({ class: [uiOverride?.itemTrailingKbds, item.ui?.itemTrailingKbds] })">
            <UKbd v-for="(kbd, kbdIndex) in item.kbds" :key="kbdIndex" :size="((item.ui?.itemTrailingKbdsSize || uiOverride?.itemTrailingKbdsSize || ui.itemTrailingKbdsSize()) as KbdProps['size'])" v-bind="typeof kbd === 'string' ? { value: kbd } : kbd" />
          </span>
        </slot>

        <DropdownMenu.ItemIndicator as-child>
          <UIcon :name="checkedIcon || 'lucide:check'" :class="ui.itemTrailingIcon({ class: [uiOverride?.itemTrailingIcon, item.ui?.itemTrailingIcon], color: item?.color })" />
        </DropdownMenu.ItemIndicator>
      </span>
    </slot>
  </DefineItemTemplate>

  <DropdownMenu.Portal v-bind="portalProps">
    <component :is="sub ? DropdownMenu.SubContent : DropdownMenu.Content" :class="props.class" v-bind="contentProps">
      <slot name="content-top"></slot>

      <div role="presentation" :class="ui.viewport({ class: uiOverride?.viewport })">
        <DropdownMenu.Group v-for="(group, groupIndex) in groups" :key="`group-${groupIndex}`" :class="ui.group({ class: uiOverride?.group })">
          <template v-for="(item, index) in group" :key="`group-${groupIndex}-${index}`">
            <DropdownMenu.Label v-if="item.type === 'label'" :class="ui.label({ class: [uiOverride?.label, item.ui?.label, item.class] })">
              <ReuseItemTemplate :item="item" :index="index" />
            </DropdownMenu.Label>
            <DropdownMenu.Separator v-else-if="item.type === 'separator'" :class="ui.separator({ class: [uiOverride?.separator, item.ui?.separator, item.class] })" />
            <DropdownMenu.Sub v-else-if="item?.children?.length" :open="item.open" :default-open="item.defaultOpen">
              <DropdownMenu.SubTrigger
                as="button"
                type="button"
                :disabled="item.disabled"
                :text-value="get(item, props.labelKey as string)"
                :class="ui.item({ class: [uiOverride?.item, item.ui?.item, item.class], color: item?.color })"
              >
                <ReuseItemTemplate :item="item" :index="index" />
              </DropdownMenu.SubTrigger>

              <DropdownMenuContent
                sub
                :class="props.class"
                :ui="ui"
                :ui-override="uiOverride"
                :portal="portal"
                :items="(item.children as T)"
                align="start"
                :align-offset="-4"
                :side-offset="3"
                :label-key="labelKey"
                :checked-icon="checkedIcon"
                :loading-icon="loadingIcon"
                :external-icon="externalIcon"
                v-bind="item.content"
              >
                <template v-for="(_, name) in proxySlots" #[name]="slotData">
                  <slot :name="(name as keyof DropdownMenuContentSlots<T>)" v-bind="slotData"></slot>
                </template>
              </DropdownMenuContent>
            </DropdownMenu.Sub>
            <DropdownMenu.CheckboxItem
              v-else-if="item.type === 'checkbox'"
              :model-value="item.checked"
              :disabled="item.disabled"
              :text-value="get(item, props.labelKey as string)"
              :class="ui.item({ class: [uiOverride?.item, item.ui?.item, item.class], color: item?.color })"
              @update:model-value="item.onUpdateChecked"
              @select="item.onSelect"
            >
              <ReuseItemTemplate :item="item" :index="index" />
            </DropdownMenu.CheckboxItem>
            <DropdownMenu.Item
              v-else
              as-child
              :disabled="item.disabled"
              :text-value="get(item, props.labelKey as string)"
              @select="item.onSelect"
            >
              <Link v-slot="{ active, ...slotProps }" v-bind="pickLinkProps(item as Omit<DropdownMenuItem, 'type'>)" custom>
                <LinkBase v-bind="slotProps" :class="ui.item({ class: [uiOverride?.item, item.ui?.item, item.class], color: item?.color, active })">
                  <ReuseItemTemplate :item="item" :active="active" :index="index" />
                </LinkBase>
              </Link>
            </DropdownMenu.Item>
          </template>
        </DropdownMenu.Group>
      </div>

      <slot></slot>

      <slot name="content-bottom"></slot>
    </component>
  </DropdownMenu.Portal>
</template>

<script lang="ts">
import type { DropdownMenuContentEmits as RekaDropdownMenuContentEmits, DropdownMenuContentProps as RekaDropdownMenuContentProps } from "reka-ui";
import type { AvatarProps, IconProps, KbdProps } from "@/components/ui/element";
import type { DropdownMenuItem, DropdownMenuSlots } from "@/components/ui/overlay";
import type { ArrayOrNested, DynamicSlots, MergeTypes, NestedItem } from "@/types/utils";
import { tv } from "tailwind-variants";

// eslint-disable-next-line unused-imports/no-unused-vars
const theme = tv({
  slots: {
    content: "min-w-32 bg-default shadow-lg rounded-md ring ring-default overflow-hidden data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] origin-(--reka-dropdown-menu-content-transform-origin) flex flex-col",
    viewport: "relative divide-y divide-default scroll-py-1 overflow-y-auto flex-1",
    arrow: "fill-default",
    group: "p-1 isolate",
    label: "w-full flex items-center font-semibold text-highlighted",
    separator: "-mx-1 my-1 h-px bg-border",
    item: "group relative w-full flex items-center select-none outline-none before:absolute before:z-[-1] before:inset-px before:rounded-md data-disabled:cursor-not-allowed data-disabled:opacity-75",
    itemLeadingIcon: "shrink-0",
    itemLeadingAvatar: "shrink-0",
    itemLeadingAvatarSize: "",
    itemTrailing: "ms-auto inline-flex gap-1.5 items-center",
    itemTrailingIcon: "shrink-0",
    itemTrailingKbds: "hidden lg:inline-flex items-center shrink-0",
    itemTrailingKbdsSize: "",
    itemLabel: "truncate",
    itemLabelExternalIcon: "inline-block size-3 align-top text-dimmed",
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
        item: "text-highlighted before:bg-elevated",
        itemLeadingIcon: "text-default",
      },
      false: {
        item: [
          "text-default data-highlighted:text-highlighted data-[state=open]:text-highlighted data-highlighted:before:bg-elevated/50 data-[state=open]:before:bg-elevated/50",
          "transition-colors before:transition-colors",
        ],
        itemLeadingIcon: [
          "text-dimmed group-data-highlighted:text-default group-data-[state=open]:text-default",
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

interface DropdownMenuContentProps<T extends ArrayOrNested<DropdownMenuItem>> extends Omit<RekaDropdownMenuContentProps, "as" | "asChild" | "forceMount"> {
  items?: T;
  portal?: boolean | string | HTMLElement;
  sub?: boolean;
  labelKey: keyof NestedItem<T>;
  /**
   * @IconifyIcon
   */
  checkedIcon?: IconProps["name"];
  /**
   * @IconifyIcon
   */
  loadingIcon?: IconProps["name"];
  /**
   * @IconifyIcon
   */
  externalIcon?: boolean | IconProps["name"];
  class?: any;
  ui: { [K in keyof Required<Partial<typeof theme.slots>>]: (props?: Record<string, any>) => string };
  uiOverride?: Partial<typeof theme.slots>;
}

interface DropdownMenuContentEmits extends RekaDropdownMenuContentEmits {}

type DropdownMenuContentSlots<
  A extends ArrayOrNested<DropdownMenuItem> = ArrayOrNested<DropdownMenuItem>,
  T extends NestedItem<A> = NestedItem<A>,
> = Pick<DropdownMenuSlots<A>, "item" | "item-leading" | "item-label" | "item-trailing" | "content-top" | "content-bottom"> & {
  default(props?: {}): any;
} & DynamicSlots<MergeTypes<T>, "leading" | "label" | "trailing", { active?: boolean; index: number }>;
</script>

<script setup lang="ts" generic="T extends ArrayOrNested<DropdownMenuItem>">
import { createReusableTemplate, reactiveOmit } from "@vueuse/core";
import { useForwardPropsEmits } from "reka-ui";
import { DropdownMenu } from "reka-ui/namespaced";
import { computed, toRef } from "vue";
import { Avatar, Icon, Kbd } from "@/components/ui/element";
import { Link, LinkBase, pickLinkProps } from "@/components/ui/link";
import { usePortal } from "@/composables/usePortal";
import { get, isArrayOfArray, omit } from "@/utils";

const props = defineProps<DropdownMenuContentProps<T>>();
const emits = defineEmits<DropdownMenuContentEmits>();
const slots = defineSlots<DropdownMenuContentSlots<T>>();

const portalProps = usePortal(toRef(() => props.portal));
const contentProps = useForwardPropsEmits(reactiveOmit(props, "sub", "items", "portal", "labelKey", "checkedIcon", "loadingIcon", "externalIcon", "class", "ui", "uiOverride"), emits);
const proxySlots = omit(slots, ["default"]);

const [DefineItemTemplate, ReuseItemTemplate] = createReusableTemplate<{ item: DropdownMenuItem; active?: boolean; index: number }>();

const childrenIcon = computed(() => "lucide:chevron-left");
const groups = computed<DropdownMenuItem[][]>(() =>
  props.items?.length
    ? isArrayOfArray(props.items)
      ? props.items
      : [props.items]
    : [],
);
</script>
