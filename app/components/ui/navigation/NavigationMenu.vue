<!-- eslint-disable vue/block-tag-newline -->
<template>
  <DefineLinkTemplate v-slot="{ item, active, index }">
    <slot :name="((item.slot || 'item') as keyof NavigationMenuSlots<T>)" :item="item" :index="index">
      <slot :name="((item.slot ? `${item.slot}-leading` : 'item-leading') as keyof NavigationMenuSlots<T>)" :item="item" :active="active" :index="index">
        <Avatar v-if="item.avatar" :size="((item.ui?.linkLeadingAvatarSize || props.ui?.linkLeadingAvatarSize || ui.linkLeadingAvatarSize()) as AvatarProps['size'])" v-bind="item.avatar" :class="ui.linkLeadingAvatar({ class: [props.ui?.linkLeadingAvatar, item.ui?.linkLeadingAvatar], active, disabled: !!item.disabled })" />
        <Icon v-else-if="item.icon" :name="item.icon" :class="ui.linkLeadingIcon({ class: [props.ui?.linkLeadingIcon, item.ui?.linkLeadingIcon], active, disabled: !!item.disabled })" />
      </slot>

      <span
        v-if="(!collapsed || orientation !== 'vertical') && (get(item, props.labelKey as string) || !!slots[(item.slot ? `${item.slot}-label` : 'item-label') as keyof NavigationMenuSlots<T>])"
        :class="ui.linkLabel({ class: [props.ui?.linkLabel, item.ui?.linkLabel] })"
      >
        <slot :name="((item.slot ? `${item.slot}-label` : 'item-label') as keyof NavigationMenuSlots<T>)" :item="item" :active="active" :index="index">
          {{ get(item, props.labelKey as string) }}
        </slot>

        <Icon v-if="item.target === '_blank' && externalIcon !== false" :name="typeof externalIcon === 'string' ? externalIcon : 'lucide:external-link'" :class="ui.linkLabelExternalIcon({ class: [props.ui?.linkLabelExternalIcon, item.ui?.linkLabelExternalIcon], active })" />
      </span>

      <component :is="orientation === 'vertical' && item.children?.length && !collapsed ? AccordionTrigger : 'span'" v-if="(!collapsed || orientation !== 'vertical') && (item.badge || (orientation === 'horizontal' && (item.children?.length || !!slots[(item.slot ? `${item.slot}-content` : 'item-content') as keyof NavigationMenuSlots<T>])) || (orientation === 'vertical' && item.children?.length) || item.trailingIcon || !!slots[(item.slot ? `${item.slot}-trailing` : 'item-trailing') as keyof NavigationMenuSlots<T>])" as="span" :class="ui.linkTrailing({ class: [props.ui?.linkTrailing, item.ui?.linkTrailing] })" @click.stop.prevent>
        <slot :name="((item.slot ? `${item.slot}-trailing` : 'item-trailing') as keyof NavigationMenuSlots<T>)" :item="item" :active="active" :index="index">
          <Badge
            v-if="item.badge !== undefined"
            color="neutral"
            variant="outline"
            :size="((item.ui?.linkTrailingBadgeSize || props.ui?.linkTrailingBadgeSize || ui.linkTrailingBadgeSize()) as BadgeProps['size'])"
            v-bind="(typeof item.badge === 'string' || typeof item.badge === 'number') ? { label: item.badge } : item.badge"
            :class="ui.linkTrailingBadge({ class: [props.ui?.linkTrailingBadge, item.ui?.linkTrailingBadge] })"
          />

          <Icon v-if="(orientation === 'horizontal' && (item.children?.length || !!slots[(item.slot ? `${item.slot}-content` : 'item-content') as keyof NavigationMenuSlots<T>])) || (orientation === 'vertical' && item.children?.length)" :name="item.trailingIcon || trailingIcon || 'lucide:chevron-down'" :class="ui.linkTrailingIcon({ class: [props.ui?.linkTrailingIcon, item.ui?.linkTrailingIcon], active })" />
          <Icon v-else-if="item.trailingIcon" :name="item.trailingIcon" :class="ui.linkTrailingIcon({ class: [props.ui?.linkTrailingIcon, item.ui?.linkTrailingIcon], active })" />
        </slot>
      </component>
    </slot>
  </DefineLinkTemplate>

  <DefineItemTemplate v-slot="{ item, index, level = 0 }">
    <component
      :is="(orientation === 'vertical' && !collapsed) ? AccordionItem : NavigationMenuItem"
      as="li"
      :value="item.value || (level > 0 ? `item-${level}-${index}` : `item-${index}`)"
    >
      <div v-if="orientation === 'vertical' && item.type === 'label' && !collapsed" :class="ui.label({ class: [props.ui?.label, item.ui?.label, item.class] })">
        <ReuseLinkTemplate :item="item" :index="index" />
      </div>
      <Link v-else-if="item.type !== 'label'" v-slot="{ active, ...slotProps }" v-bind="(orientation === 'vertical' && item.children?.length && !collapsed && item.type === 'trigger') ? {} : pickLinkProps(item as Omit<NavigationMenuItem, 'type'>)" custom>
        <component
          :is="(orientation === 'horizontal' && (item.children?.length || !!slots[(item.slot ? `${item.slot}-content` : 'item-content') as keyof NavigationMenuSlots<T>])) ? NavigationMenuTrigger : ((orientation === 'vertical' && item.children?.length && !collapsed && !(slotProps as any).href) ? AccordionTrigger : NavigationMenuLink)"
          as-child
          :active="active || item.active"
          :disabled="item.disabled"
          @select="item.onSelect"
        >
          <Popover v-if="orientation === 'vertical' && collapsed && item.children?.length && (!!props.popover || !!item.popover)" v-bind="{ ...popoverProps, ...(typeof item.popover === 'boolean' ? {} : item.popover || {}) }" :ui="{ content: ui.content({ class: [props.ui?.content, item.ui?.content] }) }">
            <LinkBase v-bind="slotProps" :class="ui.link({ class: [props.ui?.link, item.ui?.link, item.class], active: active || item.active, disabled: !!item.disabled, level: level > 0 })">
              <ReuseLinkTemplate :item="item" :active="active || item.active" :index="index" />
            </LinkBase>

            <template #content>
              <slot :name="((item.slot ? `${item.slot}-content` : 'item-content') as keyof NavigationMenuSlots<T>)" :item="item" :active="active || item.active" :index="index">
                <ul :class="ui.childList({ class: [props.ui?.childList, item.ui?.childList] })">
                  <li :class="ui.childLabel({ class: [props.ui?.childLabel, item.ui?.childLabel] })">
                    {{ get(item, props.labelKey as string) }}
                  </li>
                  <li v-for="(childItem, childIndex) in item.children" :key="childIndex" :class="ui.childItem({ class: [props.ui?.childItem, item.ui?.childItem] })">
                    <Link v-slot="{ active: childActive, ...childSlotProps }" v-bind="pickLinkProps(childItem as Omit<NavigationMenuItem, 'type'>)" custom>
                      <NavigationMenuLink as-child :active="childActive" @select="childItem.onSelect">
                        <LinkBase v-bind="childSlotProps" :class="ui.childLink({ class: [props.ui?.childLink, item.ui?.childLink, childItem.class], active: childActive })">
                          <Icon v-if="childItem.icon" :name="childItem.icon" :class="ui.childLinkIcon({ class: [props.ui?.childLinkIcon, item.ui?.childLinkIcon], active: childActive })" />

                          <span :class="ui.childLinkLabel({ class: [props.ui?.childLinkLabel, item.ui?.childLinkLabel], active: childActive })">
                            {{ get(childItem, props.labelKey as string) }}

                            <Icon v-if="childItem.target === '_blank' && externalIcon !== false" :name="typeof externalIcon === 'string' ? externalIcon : 'lucide:external-link'" :class="ui.childLinkLabelExternalIcon({ class: [props.ui?.childLinkLabelExternalIcon, item.ui?.childLinkLabelExternalIcon], active: childActive })" />
                          </span>
                        </LinkBase>
                      </NavigationMenuLink>
                    </Link>
                  </li>
                </ul>
              </slot>
            </template>
          </Popover>
          <Tooltip v-else-if="orientation === 'vertical' && collapsed && (!!props.tooltip || !!item.tooltip)" :text="get(item, props.labelKey as string)" v-bind="{ ...tooltipProps, ...(typeof item.tooltip === 'boolean' ? {} : item.tooltip || {}) }">
            <LinkBase v-bind="slotProps" :class="ui.link({ class: [props.ui?.link, item.ui?.link, item.class], active: active || item.active, disabled: !!item.disabled, level: level > 0 })">
              <ReuseLinkTemplate :item="item" :active="active || item.active" :index="index" />
            </LinkBase>
          </Tooltip>
          <LinkBase v-else v-bind="slotProps" :class="ui.link({ class: [props.ui?.link, item.ui?.link, item.class], active: active || item.active, disabled: !!item.disabled, level: orientation === 'horizontal' || level > 0 })">
            <ReuseLinkTemplate :item="item" :active="active || item.active" :index="index" />
          </LinkBase>
        </component>

        <NavigationMenuContent v-if="orientation === 'horizontal' && (item.children?.length || !!slots[(item.slot ? `${item.slot}-content` : 'item-content') as keyof NavigationMenuSlots<T>])" v-bind="contentProps" :class="ui.content({ class: [props.ui?.content, item.ui?.content] })">
          <slot :name="((item.slot ? `${item.slot}-content` : 'item-content') as keyof NavigationMenuSlots<T>)" :item="item" :active="active || item.active" :index="index">
            <ul :class="ui.childList({ class: [props.ui?.childList, item.ui?.childList] })">
              <li v-for="(childItem, childIndex) in item.children" :key="childIndex" :class="ui.childItem({ class: [props.ui?.childItem, item.ui?.childItem] })">
                <Link v-slot="{ active: childActive, ...childSlotProps }" v-bind="pickLinkProps(childItem as Omit<NavigationMenuItem, 'type'>)" custom>
                  <NavigationMenuLink as-child :active="childActive" @select="childItem.onSelect">
                    <LinkBase v-bind="childSlotProps" :class="ui.childLink({ class: [props.ui?.childLink, item.ui?.childLink, childItem.class], active: childActive })">
                      <Icon v-if="childItem.icon" :name="childItem.icon" :class="ui.childLinkIcon({ class: [props.ui?.childLinkIcon, item.ui?.childLinkIcon], active: childActive })" />

                      <div :class="ui.childLinkWrapper({ class: [props.ui?.childLinkWrapper, item.ui?.childLinkWrapper] })">
                        <p :class="ui.childLinkLabel({ class: [props.ui?.childLinkLabel, item.ui?.childLinkLabel], active: childActive })">
                          {{ get(childItem, props.labelKey as string) }}

                          <Icon v-if="childItem.target === '_blank' && externalIcon !== false" :name="typeof externalIcon === 'string' ? externalIcon : 'lucide:external-link'" :class="ui.childLinkLabelExternalIcon({ class: [props.ui?.childLinkLabelExternalIcon, item.ui?.childLinkLabelExternalIcon], active: childActive })" />
                        </p>
                        <p v-if="childItem.description" :class="ui.childLinkDescription({ class: [props.ui?.childLinkDescription, item.ui?.childLinkDescription], active: childActive })">
                          {{ childItem.description }}
                        </p>
                      </div>
                    </LinkBase>
                  </NavigationMenuLink>
                </Link>
              </li>
            </ul>
          </slot>
        </NavigationMenuContent>
      </Link>

      <AccordionContent v-if="orientation === 'vertical' && item.children?.length && !collapsed" :class="ui.content({ class: [props.ui?.content, item.ui?.content] })">
        <AccordionRoot
          v-bind="({
            ...accordionProps,
            defaultValue: getAccordionDefaultValue(item.children, level + 1)
          } as AccordionRootProps)"
          as="ul"
          :class="ui.childList({ class: props.ui?.childList })"
        >
          <ReuseItemTemplate
            v-for="(childItem, childIndex) in item.children"
            :key="childIndex"
            :item="childItem"
            :index="childIndex"
            :level="level + 1"
            :class="ui.childItem({ class: [props.ui?.childItem, childItem.ui?.childItem] })"
          />
        </AccordionRoot>
      </AccordionContent>
    </component>
  </DefineItemTemplate>

  <NavigationMenuRoot v-bind="{ ...rootProps, ...$attrs }" :data-collapsed="collapsed" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <slot name="list-leading"></slot>

    <template v-for="(list, listIndex) in lists" :key="`list-${listIndex}`">
      <component
        v-bind="orientation === 'vertical' && !collapsed ? {
          ...accordionProps,
          defaultValue: getAccordionDefaultValue(list)
        } : {}"
        :is="orientation === 'vertical' && !collapsed ? AccordionRoot : NavigationMenuList"
        as="ul"
        :class="ui.list({ class: props.ui?.list })"
      >
        <ReuseItemTemplate v-for="(item, index) in list" :key="`list-${listIndex}-${index}`" :item="item" :index="index" :class="ui.item({ class: [props.ui?.item, item.ui?.item] })" />
      </component>

      <div v-if="orientation === 'vertical' && listIndex < lists.length - 1" :class="ui.separator({ class: props.ui?.separator })"></div>
    </template>

    <slot name="list-trailing"></slot>

    <div v-if="orientation === 'horizontal'" :class="ui.viewportWrapper({ class: props.ui?.viewportWrapper })">
      <NavigationMenuIndicator v-if="arrow" :class="ui.indicator({ class: props.ui?.indicator })">
        <div :class="ui.arrow({ class: props.ui?.arrow })"></div>
      </NavigationMenuIndicator>

      <NavigationMenuViewport :class="ui.viewport({ class: props.ui?.viewport })" />
    </div>
  </NavigationMenuRoot>
</template>

<script lang="ts">
import type { AccordionRootProps, NavigationMenuContentEmits, NavigationMenuContentProps, NavigationMenuRootEmits, NavigationMenuRootProps } from "reka-ui";
import type { AvatarProps, BadgeProps, IconProps } from "@/components/ui/element";
import type { LinkProps } from "@/components/ui/link";
import type { PopoverProps, TooltipProps } from "@/components/ui/overlay";
import type { ArrayOrNested, DynamicSlots, EmitsToProps, MergeTypes, NestedItem } from "@/types/utils";
import { tv, type VariantProps } from "tailwind-variants";

const theme = tv({
  slots: {
    root: "relative flex gap-1.5 [&>div]:min-w-0",
    list: "isolate min-w-0",
    label: "w-full flex items-center gap-1.5 font-semibold text-xs/5 text-highlighted px-2.5 py-1.5",
    item: "min-w-0",
    link: "group relative w-full flex items-center gap-1.5 font-medium text-sm before:absolute before:z-[-1] before:rounded-md focus:outline-none focus-visible:outline-none dark:focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-2",
    linkLeadingIcon: "shrink-0 size-5",
    linkLeadingAvatar: "shrink-0",
    linkLeadingAvatarSize: "2xs",
    linkTrailing: "group ms-auto inline-flex gap-1.5 items-center",
    linkTrailingBadge: "shrink-0",
    linkTrailingBadgeSize: "sm",
    linkTrailingIcon: "size-5 transform shrink-0 group-data-[state=open]:rotate-180 transition-transform duration-200",
    linkLabel: "truncate",
    linkLabelExternalIcon: "inline-block size-3 align-top text-dimmed",
    childList: "isolate",
    childLabel: "text-xs text-highlighted",
    childItem: "",
    childLink: "group relative size-full flex items-start text-start text-sm before:absolute before:z-[-1] before:rounded-md focus:outline-none focus-visible:outline-none dark:focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-2",
    childLinkWrapper: "min-w-0",
    childLinkIcon: "size-5 shrink-0",
    childLinkLabel: "truncate",
    childLinkLabelExternalIcon: "inline-block size-3 align-top text-dimmed",
    childLinkDescription: "text-muted",
    separator: "px-2 h-px bg-border",
    viewportWrapper: "absolute top-full left-0 flex w-full",
    viewport: "relative overflow-hidden bg-default shadow-lg rounded-md ring ring-default h-(--reka-navigation-menu-viewport-height) w-full transition-[width,height,left] duration-200 origin-[top_center] data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] z-[1]",
    content: "",
    indicator: "absolute data-[state=visible]:animate-[fade-in_100ms_ease-out] data-[state=hidden]:animate-[fade-out_100ms_ease-in] data-[state=hidden]:opacity-0 bottom-0 z-[2] w-(--reka-navigation-menu-indicator-size) translate-x-(--reka-navigation-menu-indicator-position) flex h-2.5 items-end justify-center overflow-hidden transition-[translate,width] duration-200",
    arrow: "relative top-[50%] size-2.5 rotate-45 border border-default bg-default z-[1] rounded-xs",
  },
  variants: {
    color: {
      primary: {
        link: "focus-visible:before:ring-primary",
        childLink: "focus-visible:before:ring-primary",
      },
      secondary: {
        link: "focus-visible:before:ring-secondary",
        childLink: "focus-visible:before:ring-secondary",
      },
      success: {
        link: "focus-visible:before:ring-success",
        childLink: "focus-visible:before:ring-success",
      },
      info: {
        link: "focus-visible:before:ring-info",
        childLink: "focus-visible:before:ring-info",
      },
      warning: {
        link: "focus-visible:before:ring-warning",
        childLink: "focus-visible:before:ring-warning",
      },
      error: {
        link: "focus-visible:before:ring-error",
        childLink: "focus-visible:before:ring-error",
      },
      neutral: {
        link: "focus-visible:before:ring-inverted",
        childLink: "focus-visible:before:ring-inverted",
      },
    },
    highlightColor: {
      primary: "",
      secondary: "",
      success: "",
      info: "",
      warning: "",
      error: "",
      neutral: "",
    },
    variant: {
      pill: "",
      link: "",
    },
    orientation: {
      horizontal: {
        root: "items-center justify-between",
        list: "flex items-center",
        item: "py-2",
        link: "px-2.5 py-1.5 before:inset-x-px before:inset-y-0",
        childList: "grid p-2",
        childLink: "px-3 py-2 gap-2 before:inset-x-px before:inset-y-0",
        childLinkLabel: "font-medium",
        content: "absolute top-0 left-0 w-full max-h-[70vh] overflow-y-auto",
      },
      vertical: {
        root: "flex-col",
        link: "flex-row px-2.5 py-1.5 before:inset-y-px before:inset-x-0",
        childLabel: "px-1.5 py-0.5",
        childLink: "p-1.5 gap-1.5 before:inset-y-px before:inset-x-0",
      },
    },
    contentOrientation: {
      horizontal: {
        viewportWrapper: "justify-center",
        content: "data-[motion=from-start]:animate-[enter-from-left_200ms_ease] data-[motion=from-end]:animate-[enter-from-right_200ms_ease] data-[motion=to-start]:animate-[exit-to-left_200ms_ease] data-[motion=to-end]:animate-[exit-to-right_200ms_ease]",
      },
      vertical: {
        viewport: "sm:w-(--reka-navigation-menu-viewport-width) left-(--reka-navigation-menu-viewport-left)",
      },
    },
    active: {
      true: {
        childLink: "before:bg-elevated text-highlighted",
        childLinkIcon: "text-default",
      },
      false: {
        link: "text-muted",
        linkLeadingIcon: "text-dimmed",
        childLink: [
          "hover:before:bg-elevated/50 text-default hover:text-highlighted",
          "transition-colors before:transition-colors",
        ],
        childLinkIcon: [
          "text-dimmed group-hover:text-default",
          "transition-colors",
        ],
      },
    },
    disabled: {
      true: {
        link: "cursor-not-allowed opacity-75",
      },
    },
    highlight: {
      true: "",
    },
    level: {
      true: "",
    },
    collapsed: {
      true: "",
    },
  },
  compoundVariants: [
    {
      orientation: "horizontal",
      contentOrientation: "horizontal",
      class: {
        childList: "grid-cols-2 gap-2",
      },
    },
    {
      orientation: "horizontal",
      contentOrientation: "vertical",
      class: {
        childList: "gap-1",
        content: "w-60",
      },
    },
    {
      orientation: "vertical",
      collapsed: false,
      class: {
        childList: "ms-5 border-s border-default",
        childItem: "ps-1.5 -ms-px",
        content: "data-[state=open]:animate-[collapsible-down_200ms_ease-out] data-[state=closed]:animate-[collapsible-up_200ms_ease-out] overflow-hidden",
      },
    },
    {
      orientation: "vertical",
      collapsed: true,
      class: {
        link: "px-1.5",
        content: "shadow-sm rounded-sm min-h-6 p-1",
      },
    },
    {
      orientation: "horizontal",
      highlight: true,
      class: {
        link: [
          "after:absolute after:-bottom-2 after:inset-x-2.5 after:block after:h-px after:rounded-full",
          "after:transition-colors",
        ],
      },
    },
    {
      orientation: "vertical",
      highlight: true,
      level: true,
      class: {
        link: [
          "after:absolute after:-start-1.5 after:inset-y-0.5 after:block after:w-px after:rounded-full",
          "after:transition-colors",
        ],
      },
    },
    {
      disabled: false,
      active: false,
      variant: "pill",
      class: {
        link: [
          "hover:text-highlighted hover:before:bg-elevated/50",
          "transition-colors before:transition-colors",
        ],
        linkLeadingIcon: [
          "group-hover:text-default",
          "transition-colors",
        ],
      },
    },
    {
      disabled: false,
      active: false,
      variant: "pill",
      orientation: "horizontal",
      class: {
        link: "data-[state=open]:text-highlighted",
        linkLeadingIcon: "group-data-[state=open]:text-default",
      },
    },
    {
      disabled: false,
      variant: "pill",
      highlight: true,
      orientation: "horizontal",
      class: {
        link: "data-[state=open]:before:bg-elevated/50",
      },
    },
    {
      disabled: false,
      variant: "pill",
      highlight: false,
      active: false,
      orientation: "horizontal",
      class: {
        link: "data-[state=open]:before:bg-elevated/50",
      },
    },
    {
      color: "primary",
      variant: "pill",
      active: true,
      class: {
        link: "text-primary",
        linkLeadingIcon: "text-primary group-data-[state=open]:text-primary",
      },
    },
    {
      color: "neutral",
      variant: "pill",
      active: true,
      class: {
        link: "text-highlighted",
        linkLeadingIcon: "text-highlighted group-data-[state=open]:text-highlighted",
      },
    },
    {
      variant: "pill",
      active: true,
      highlight: false,
      class: {
        link: "before:bg-elevated",
      },
    },
    {
      variant: "pill",
      active: true,
      highlight: true,
      disabled: false,
      class: {
        link: [
          "hover:before:bg-elevated/50",
          "before:transition-colors",
        ],
      },
    },
    {
      disabled: false,
      active: false,
      variant: "link",
      class: {
        link: [
          "hover:text-highlighted",
          "transition-colors",
        ],
        linkLeadingIcon: [
          "group-hover:text-default",
          "transition-colors",
        ],
      },
    },
    {
      disabled: false,
      active: false,
      variant: "link",
      orientation: "horizontal",
      class: {
        link: "data-[state=open]:text-highlighted",
        linkLeadingIcon: "group-data-[state=open]:text-default",
      },
    },
    {
      color: "primary",
      variant: "link",
      active: true,
      class: {
        link: "text-primary",
        linkLeadingIcon: "text-primary group-data-[state=open]:text-primary",
      },
    },
    {
      color: "neutral",
      variant: "link",
      active: true,
      class: {
        link: "text-highlighted",
        linkLeadingIcon: "text-highlighted group-data-[state=open]:text-highlighted",
      },
    },
    {
      highlightColor: "primary",
      highlight: true,
      level: true,
      active: true,
      class: {
        link: "after:bg-primary",
      },
    },
    {
      highlightColor: "neutral",
      highlight: true,
      level: true,
      active: true,
      class: {
        link: "after:bg-inverted",
      },
    },
  ],
  defaultVariants: {
    color: "primary",
    highlightColor: "primary",
    variant: "pill",
  },
});

type NavigationMenuVariants = VariantProps<typeof theme>;

export interface NavigationMenuChildItem extends Omit<NavigationMenuItem, "type" | "ui"> {
  /** Description is only used when `orientation` is `horizontal`. */
  description?: string;
  [key: string]: any;
}

export interface NavigationMenuItem extends Omit<LinkProps, "type" | "raw" | "custom"> {
  label?: string;
  /**
   * @IconifyIcon
   */
  icon?: IconProps["name"];
  avatar?: AvatarProps;
  /**
   * Display a badge on the item.
   * `{ size: 'sm', color: 'neutral', variant: 'outline' }`{lang="ts-type"}
   */
  badge?: string | number | BadgeProps;
  /**
   * Display a tooltip on the item when the menu is collapsed with the label of the item.
   * This has priority over the global `tooltip` prop.
   */
  tooltip?: boolean | TooltipProps;
  /**
   * Display a popover on the item when the menu is collapsed with the children list.
   * This has priority over the global `popover` prop.
   */
  popover?: boolean | PopoverProps;
  /**
   * @IconifyIcon
   */
  trailingIcon?: IconProps["name"];
  /**
   * The type of the item.
   * The `label` type is only displayed in `vertical` orientation.
   * The `trigger` type is used to force the item to be collapsible when its a link in `vertical` orientation.
   * @defaultValue 'link'
   */
  type?: "label" | "trigger" | "link";
  slot?: string;
  /**
   * The value of the item. Avoid using `index` as the value to prevent conflicts in horizontal orientation with Reka UI.
   * @defaultValue `item-${index}`
   */
  value?: string;
  children?: NavigationMenuChildItem[];
  defaultOpen?: boolean;
  open?: boolean;
  onSelect?(e: Event): void;
  class?: any;
  ui?: Pick<Partial<typeof theme.slots>, "item" | "linkLeadingAvatarSize" | "linkLeadingAvatar" | "linkLeadingIcon" | "linkLabel" | "linkLabelExternalIcon" | "linkTrailing" | "linkTrailingBadgeSize" | "linkTrailingBadge" | "linkTrailingIcon" | "label" | "link" | "content" | "childList" | "childLabel" | "childItem" | "childLink" | "childLinkIcon" | "childLinkWrapper" | "childLinkLabel" | "childLinkLabelExternalIcon" | "childLinkDescription">;
  [key: string]: any;
}

export interface NavigationMenuProps<T extends ArrayOrNested<NavigationMenuItem> = ArrayOrNested<NavigationMenuItem>> extends Pick<NavigationMenuRootProps, "modelValue" | "defaultValue" | "delayDuration" | "disableClickTrigger" | "disableHoverTrigger" | "skipDelayDuration" | "disablePointerLeaveClose" | "unmountOnHide">, Pick<AccordionRootProps, "disabled" | "type" | "collapsible"> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;
  /**
   * The icon displayed to open the menu.
   * @defaultValue appConfig.ui.icons.chevronDown
   * @IconifyIcon
   */
  trailingIcon?: IconProps["name"];
  /**
   * The icon displayed when the item is an external link.
   * Set to `false` to hide the external icon.
   * @defaultValue appConfig.ui.icons.external
   * @IconifyIcon
   */
  externalIcon?: boolean | IconProps["name"];
  items?: T;
  /**
   * @defaultValue 'primary'
   */
  color?: NavigationMenuVariants["color"];
  /**
   * @defaultValue 'pill'
   */
  variant?: NavigationMenuVariants["variant"];
  /**
   * The orientation of the menu.
   * @defaultValue 'horizontal'
   */
  orientation?: NavigationMenuRootProps["orientation"];
  /**
   * Collapse the navigation menu to only show icons.
   * Only works when `orientation` is `vertical`.
   * @defaultValue false
   */
  collapsed?: boolean;
  /**
   * Display a tooltip on the items when the menu is collapsed with the label of the item.
   * `{ delayDuration: 0, content: { side: 'right' } }`{lang="ts-type"}
   * @defaultValue false
   */
  tooltip?: boolean | TooltipProps;
  /**
   * Display a popover on the items when the menu is collapsed with the children list.
   * `{ mode: 'hover', content: { side: 'right', align: 'start', alignOffset: 2 } }`{lang="ts-type"}
   * @defaultValue false
   */
  popover?: boolean | PopoverProps;
  /** Display a line next to the active item. */
  highlight?: boolean;
  /**
   * @defaultValue 'primary'
   */
  highlightColor?: NavigationMenuVariants["highlightColor"];
  /** The content of the menu. */
  content?: Omit<NavigationMenuContentProps, "as" | "asChild" | "forceMount"> & Partial<EmitsToProps<NavigationMenuContentEmits>>;
  /**
   * The orientation of the content.
   * Only works when `orientation` is `horizontal`.
   * @defaultValue 'horizontal'
   */
  contentOrientation?: NavigationMenuVariants["contentOrientation"];
  /**
   * Display an arrow alongside the menu.
   * @defaultValue false
   */
  arrow?: boolean;
  /**
   * The key used to get the label from the item.
   * @defaultValue 'label'
   */
  labelKey?: keyof NestedItem<T>;
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface NavigationMenuEmits extends NavigationMenuRootEmits {}

type SlotProps<T extends NavigationMenuItem> = (props: { item: T; index: number; active?: boolean }) => any;

export type NavigationMenuSlots<
  A extends ArrayOrNested<NavigationMenuItem> = ArrayOrNested<NavigationMenuItem>,
  T extends NestedItem<A> = NestedItem<A>,
> = {
  "item": SlotProps<T>;
  "item-leading": SlotProps<T>;
  "item-label": SlotProps<T>;
  "item-trailing": SlotProps<T>;
  "item-content": SlotProps<T>;
  "list-leading": (props?: object) => any;
  "list-trailing": (props?: object) => any;
} & DynamicSlots<MergeTypes<T>, "leading" | "label" | "trailing" | "content", { index: number; active?: boolean }>;
</script>

<script setup lang="ts" generic="T extends ArrayOrNested<NavigationMenuItem>">
import { createReusableTemplate, reactivePick } from "@vueuse/core";
import { defu } from "defu";
// eslint-disable-next-line ts/no-redeclare
import { AccordionContent, AccordionItem, AccordionRoot, AccordionTrigger, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuRoot, NavigationMenuTrigger, NavigationMenuViewport, useForwardPropsEmits } from "reka-ui";
import { computed, toRef } from "vue";
import { Avatar, Badge, Icon } from "@/components/ui/element";
import { Link, LinkBase, pickLinkProps } from "@/components/ui/link";
import { Popover, Tooltip } from "@/components/ui/overlay";
import { get, isArrayOfArray } from "@/utils/index";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<NavigationMenuProps<T>>(), {
  orientation: "horizontal",
  contentOrientation: "horizontal",
  externalIcon: true,
  delayDuration: 0,
  type: "multiple",
  collapsible: true,
  unmountOnHide: true,
  labelKey: "label",
});
const emits = defineEmits<NavigationMenuEmits>();
const slots = defineSlots<NavigationMenuSlots<T>>();

const rootProps = useForwardPropsEmits(computed(() => ({
  as: props.as,
  modelValue: props.modelValue,
  defaultValue: props.defaultValue,
  delayDuration: props.delayDuration,
  skipDelayDuration: props.skipDelayDuration,
  orientation: props.orientation,
  disableClickTrigger: props.disableClickTrigger,
  disableHoverTrigger: props.disableHoverTrigger,
  disablePointerLeaveClose: props.disablePointerLeaveClose,
  unmountOnHide: props.unmountOnHide,
})), emits);
const accordionProps = useForwardPropsEmits(reactivePick(props, "collapsible", "disabled", "type", "unmountOnHide"), emits);
const contentProps = toRef(() => props.content);
const tooltipProps = toRef(() => defu(typeof props.tooltip === "boolean" ? {} : props.tooltip, { delayDuration: 0, content: { side: "right" } }) as TooltipProps);
const popoverProps = toRef(() => defu(typeof props.popover === "boolean" ? {} : props.popover, { mode: "hover", content: { side: "right", align: "start", alignOffset: 2 } }) as PopoverProps);

const [DefineLinkTemplate, ReuseLinkTemplate] = createReusableTemplate<{ item: NavigationMenuItem; index: number; active?: boolean }>();
const [DefineItemTemplate, ReuseItemTemplate] = createReusableTemplate<{ item: NavigationMenuItem; index: number; level?: number }>({
  props: {
    item: Object,
    index: Number,
    level: Number,
  },
});

const ui = computed(() => tv({ extend: theme })({
  orientation: props.orientation,
  contentOrientation: props.orientation === "vertical" ? undefined : props.contentOrientation,
  collapsed: props.collapsed,
  color: props.color,
  variant: props.variant,
  highlight: props.highlight,
  highlightColor: props.highlightColor || props.color,
}));

const lists = computed<NavigationMenuItem[][]>(() =>
  props.items?.length
    ? isArrayOfArray(props.items)
      ? props.items
      : [props.items]
    : [],
);

function getAccordionDefaultValue(list: NavigationMenuItem[], level = 0) {
  const indexes = list.reduce((acc: string[], item, index) => {
    if (item.defaultOpen || item.open) {
      acc.push(item.value || (level > 0 ? `item-${level}-${index}` : `item-${index}`));
    }
    return acc;
  }, []);

  return props.type === "single" ? indexes[0] : indexes;
}
</script>
