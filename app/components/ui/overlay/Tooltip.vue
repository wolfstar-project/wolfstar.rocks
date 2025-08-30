<template>
  <TooltipRoot v-slot="{ open }" v-bind="rootProps" :disabled="!(text || kbds?.length || !!slots.content) || props.disabled">
    <TooltipTrigger v-if="!!slots.default || !!reference" v-bind="$attrs" as-child :reference="reference" :class="props.class">
      <slot :open="open"></slot>
    </TooltipTrigger>

    <TooltipPortal v-bind="portalProps">
      <TooltipContent v-bind="contentProps" :class="ui.content({ class: [!slots.default && props.class, props.ui?.content] })">
        <slot name="content">
          <span v-if="text" :class="ui.text({ class: props.ui?.text })">{{ text }}</span>

          <span v-if="kbds?.length" :class="ui.kbds({ class: props.ui?.kbds })">
            <Kbd v-for="(kbd, index) in kbds" :key="index" :size="((props.ui?.kbdsSize || ui.kbdsSize()) as KbdProps['size'])" v-bind="typeof kbd === 'string' ? { value: kbd } : kbd" />
          </span>
        </slot>

        <TooltipArrow v-if="!!arrow" v-bind="arrowProps" :class="ui.arrow({ class: props.ui?.arrow })" />
      </TooltipContent>
    </TooltipPortal>
  </TooltipRoot>
</template>

<script lang="ts">
import type { AppConfig } from "@nuxt/schema";
import type { TooltipArrowProps, TooltipContentEmits, TooltipContentProps, TooltipRootEmits, TooltipRootProps, TooltipTriggerProps } from "reka-ui";
import type { KbdProps } from "@/components/ui/element";
import type { EmitsToProps } from "@/types/utils";
import { tv } from "tailwind-variants";

const theme = tv({
  slots: {
    content: "flex items-center gap-1 bg-base-100 text-base-content shadow-sm rounded-sm ring ring-base-300 h-6 px-2.5 py-1 text-xs select-none data-[state=delayed-open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] origin-(--reka-tooltip-content-transform-origin) pointer-events-auto",
    arrow: "fill-base-100",
    text: "truncate",
    kbds: "hidden lg:inline-flex items-center shrink-0 gap-0.5 not-first-of-type:before:content-['·'] not-first-of-type:before:me-0.5",
    kbdsSize: "sm",
  },

});

export interface TooltipProps extends TooltipRootProps {
  /** The text content of the tooltip. */
  text?: string;
  /** The keyboard keys to display in the tooltip. */
  kbds?: KbdProps["value"][] | KbdProps[];
  /**
   * The content of the tooltip.
   * @defaultValue { side: 'bottom', sideOffset: 8, collisionPadding: 8 }
   */
  content?: Omit<TooltipContentProps, "as" | "asChild"> & Partial<EmitsToProps<TooltipContentEmits>>;
  /**
   * Display an arrow alongside the tooltip.
   * @defaultValue false
   */
  arrow?: boolean | Omit<TooltipArrowProps, "as" | "asChild">;
  /**
   * Render the tooltip in a portal.
   * @defaultValue true
   */
  portal?: boolean | string | HTMLElement;
  /**
   * The reference (or anchor) element that is being referred to for positioning.
   *
   * If not provided will use the current component as anchor.
   */
  reference?: TooltipTriggerProps["reference"];
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface TooltipEmits extends TooltipRootEmits {}

export interface TooltipSlots {
  default(props: { open: boolean }): any;
  content(props?: {}): any;
}
</script>

<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { defu } from "defu";
import { TooltipArrow, TooltipContent, TooltipPortal, TooltipRoot, TooltipTrigger, useForwardPropsEmits } from "reka-ui";
import { computed, toRef } from "vue";
import { Kbd } from "@/components/ui/element";
import { usePortal } from "@/composables/usePortal";

const props = withDefaults(defineProps<TooltipProps>(), {
  portal: true,
});
const emits = defineEmits<TooltipEmits>();
const slots = defineSlots<TooltipSlots>();

const rootProps = useForwardPropsEmits(reactivePick(props, "defaultOpen", "open", "delayDuration", "disableHoverableContent", "disableClosingTrigger", "ignoreNonKeyboardFocus"), emits);
const portalProps = usePortal(toRef(() => props.portal));
const contentProps = toRef(() => defu(props.content, { side: "bottom", sideOffset: 8, collisionPadding: 8 }) as TooltipContentProps);
const arrowProps = toRef(() => props.arrow as TooltipArrowProps);

const ui = computed(() => tv({ extend: theme })({
  side: contentProps.value.side,
}));
</script>
