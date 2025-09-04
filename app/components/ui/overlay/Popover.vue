<template>
  <Component.Root v-slot="{ open }" v-bind="rootProps">
    <Component.Trigger v-if="!!slots.default || !!reference" as-child :reference="reference" :class="props.class">
      <slot :open="open"></slot>
    </Component.Trigger>

    <Component.Anchor v-if="'Anchor' in Component && !!slots.anchor" as-child>
      <slot name="anchor"></slot>
    </Component.Anchor>

    <Component.Portal v-bind="portalProps">
      <Component.Content v-bind="contentProps" :class="ui.content({ class: [!slots.default && props.class, props.ui?.content] })" v-on="contentEvents">
        <slot name="content"></slot>

        <Component.Arrow v-if="!!arrow" v-bind="arrowProps" :class="ui.arrow({ class: props.ui?.arrow })" />
      </Component.Content>
    </Component.Portal>
  </Component.Root>
</template>

<script lang="ts">
import type { HoverCardRootProps, HoverCardTriggerProps, PopoverArrowProps, PopoverContentEmits, PopoverContentProps, PopoverRootEmits, PopoverRootProps } from "reka-ui";
import type { EmitsToProps } from "@/types/utils";
import { tv } from "tailwind-variants";

const theme = tv({
  slots: {
    content: "bg-base-100 shadow-lg rounded-md ring ring-base-200 data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] origin-(--reka-popover-content-transform-origin) focus:outline-none pointer-events-auto",
    arrow: "fill-base-100",
  },
});

export interface PopoverProps extends PopoverRootProps, Pick<HoverCardRootProps, "openDelay" | "closeDelay"> {
  /**
   * The display mode of the popover.
   * @defaultValue 'click'
   */
  mode?: "click" | "hover";
  /**
   * The content of the popover.
   * @defaultValue { side: 'bottom', sideOffset: 8, collisionPadding: 8 }
   */
  content?: Omit<PopoverContentProps, "as" | "asChild" | "forceMount"> & Partial<EmitsToProps<PopoverContentEmits>>;
  /**
   * Display an arrow alongside the popover.
   * @defaultValue false
   */
  arrow?: boolean | Omit<PopoverArrowProps, "as" | "asChild">;
  /**
   * Render the popover in a portal.
   * @defaultValue true
   */
  portal?: boolean | string | HTMLElement;
  /**
   * The reference (or anchor) element that is being referred to for positioning.
   *
   * If not provided will use the current component as anchor.
   */
  reference?: HoverCardTriggerProps["reference"];
  /**
   * When `false`, the popover will not close when clicking outside or pressing escape.
   * @defaultValue true
   */
  dismissible?: boolean;
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface PopoverEmits extends PopoverRootEmits {
  "close:prevent": [];
}

export interface PopoverSlots {
  default(props: { open: boolean }): any;
  content(props?: {}): any;
  anchor(props?: {}): any;
}
</script>

<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { defu } from "defu";
import { useForwardPropsEmits } from "reka-ui";
import { HoverCard, Popover } from "reka-ui/namespaced";
import { computed, toRef } from "vue";
import { usePortal } from "@/composables/usePortal";

const props = withDefaults(defineProps<PopoverProps>(), {
  portal: true,
  mode: "click",
  openDelay: 0,
  closeDelay: 0,
  dismissible: true,
});
const emits = defineEmits<PopoverEmits>();
const slots = defineSlots<PopoverSlots>();

const pick = props.mode === "hover" ? reactivePick(props, "defaultOpen", "open", "openDelay", "closeDelay") : reactivePick(props, "defaultOpen", "open", "modal");
const rootProps = useForwardPropsEmits(pick, emits);
const portalProps = usePortal(toRef(() => props.portal));
const contentProps = toRef(() => defu(props.content, { side: "bottom", sideOffset: 8, collisionPadding: 8 }) as PopoverContentProps);
const contentEvents = computed(() => {
  if (!props.dismissible) {
    const events = ["pointerDownOutside", "interactOutside", "escapeKeyDown"];

    return events.reduce((acc, curr) => {
      acc[curr] = (e: Event) => {
        e.preventDefault();
        emits("close:prevent");
      };
      return acc;
    }, {} as Record<typeof events[number], (e: Event) => void>);
  }

  return {};
});
const arrowProps = toRef(() => props.arrow as PopoverArrowProps);

const ui = computed(() => tv({ extend: theme })({
  side: contentProps.value.side,
}));

const Component = computed(() => props.mode === "hover" ? HoverCard : Popover);
</script>
