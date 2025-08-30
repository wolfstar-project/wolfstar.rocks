<template>
  <Primitive :as="as" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <div v-if="!!slots.left" :class="ui.left({ class: props.ui?.left })">
      <slot name="left"></slot>
    </div>

    <div v-if="!!slots.default || columns?.length" :class="ui.center({ class: props.ui?.center })">
      <slot>
        <div v-for="(column, index) in columns" :key="index">
          <h3 :class="ui.label({ class: props.ui?.label })">
            <slot name="column-label" :column="column">
              {{ column.label }}
            </slot>
          </h3>

          <ul :class="ui.list({ class: props.ui?.list })">
            <li v-for="(link, linkIndex) in column.children" :key="linkIndex" :class="ui.item({ class: [props.ui?.item, link.ui?.item] })">
              <Link v-slot="{ active, ...slotProps }" v-bind="pickLinkProps(link)" custom>
                <LinkBase v-bind="slotProps" :class="ui.link({ class: [props.ui?.link, link.ui?.link, link.class], active })">
                  <slot name="link" :link="(link as T)" :active="active">
                    <slot name="link-leading" :link="(link as T)" :active="active">
                      <Icon v-if="link.icon" :name="link.icon" :class="ui.linkLeadingIcon({ class: [props.ui?.linkLeadingIcon, link.ui?.linkLeadingIcon], active })" />
                    </slot>

                    <span v-if="link.label || !!slots['link-label']" :class="ui.linkLabel({ class: [props.ui?.linkLabel, link.ui?.linkLabel], active })">
                      <slot name="link-label" :link="(link as T)" :active="active">
                        {{ (link as T).label }}
                      </slot>

                      <Icon v-if="link.target === '_blank'" name="lucide:arrow-up-right" :class="ui.linkLabelExternalIcon({ class: [props.ui?.linkLabelExternalIcon, link.ui?.linkLabelExternalIcon], active })" />
                    </span>

                    <slot name="link-trailing" :link="(link as T)" :active="active"></slot>
                  </slot>
                </LinkBase>
              </Link>
            </li>
          </ul>
        </div>
      </slot>
    </div>

    <div v-if="!!slots.right" :class="ui.right({ class: props.ui?.right })">
      <slot name="right"></slot>
    </div>
  </Primitive>
</template>

<script lang="ts">
import type { LinkProps } from "@/components/ui/link";
import { tv } from "tailwind-variants";

const theme = tv({
  slots: {
    root: "xl:grid xl:grid-cols-3 xl:gap-8",
    left: "mb-10 xl:mb-0",
    center: "flex flex-col lg:grid grid-flow-col auto-cols-fr gap-8 xl:col-span-2",
    right: "mt-10 xl:mt-0",
    label: "text-sm font-semibold text-base-content",
    list: "mt-6 space-y-4",
    item: "relative",
    link: "group text-sm flex items-center gap-1.5 focus-visible:outline-primary",
    linkLeadingIcon: "size-5 shrink-0",
    linkLabel: "truncate",
    linkLabelExternalIcon: "size-3 absolute top-0 text-base-300 inline-block",
  },
  variants: {
    active: {
      true: {
        link: "text-primary font-medium",
      },
      false: {
        link: [
          "text-base-content/70 hover:text-base-content",
          "transition-colors",
        ],
      },
    },
  },
});

export interface FooterColumnLink extends Omit<LinkProps, "custom"> {
  label: string;
  /**
   * @IconifyIcon
   */
  icon?: string;
  class?: any;
  ui?: Pick<typeof theme.slots, "item" | "link" | "linkLabel" | "linkLabelExternalIcon" | "linkLeadingIcon">;
}

export interface FooterColumn<T extends FooterColumnLink = FooterColumnLink> {
  label: string;
  children?: T[];
}

export interface FooterColumnsProps<T extends FooterColumnLink = FooterColumnLink> {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;
  class?: any;
  columns?: FooterColumn<T>[];
  ui?: Partial<typeof theme.slots>;
}

type SlotProps<T> = (props: { link: T; active: boolean }) => any;

export interface FooterColumnsSlots<T extends FooterColumnLink = FooterColumnLink> {
  "left"(props?: {}): any;
  "default"(props?: {}): any;
  "right"(props?: {}): any;
  "column-label"?: (props: { column: FooterColumn<T> }) => any;
  "link": SlotProps<T>;
  "link-leading": SlotProps<T>;
  "link-label": SlotProps<T>;
  "link-trailing": SlotProps<T>;
}
</script>

<script setup lang="ts" generic="T extends FooterColumnLink">
import { Primitive } from "reka-ui";
import { computed } from "vue";
import { Icon } from "@/components/ui/icon";
import { Link, LinkBase, pickLinkProps } from "@/components/ui/link";

const props = withDefaults(defineProps<FooterColumnsProps<T>>(), {
  as: "nav",
});
const slots = defineSlots<FooterColumnsSlots<T>>();

const ui = computed(() => tv({ extend: theme })());
</script>
