<template>
  <DefineButtonTemplate>
    <Button
      :icon="icon || 'lucide:search'"
      :label="label || 'Search...'"
      :variant="variant || (collapsed ? 'ghost' : 'outline')"
      v-bind="{
        ...rootProps,
        ...(collapsed ? {
          'square': true,
          'label': undefined,
          'aria-label': label || 'Search...'
        } : {}),
        ...$attrs
      }"
      :class="ui.base({ class: [props.ui?.base, props.class] })"
      :ui="transformUI(ui, props.ui)"
      @click="toggleSearch"
    >
      <template v-for="(_, name) in proxySlots" #[name]="slotData">
        <slot :name="name" v-bind="slotData"></slot>
      </template>

      <template v-if="!collapsed" #trailing>
        <div :class="ui.trailing({ class: props.ui?.trailing })">
          <slot name="trailing">
            <template v-if="kbds?.length">
              <Kbd v-for="(kbd, index) in kbds" :key="index" variant="subtle" v-bind="typeof kbd === 'string' ? { value: kbd } : kbd" />
            </template>
          </slot>
        </div>
      </template>
    </Button>
  </DefineButtonTemplate>

  <Tooltip v-if="collapsed && tooltip" :text="label || 'Search...'" v-bind="tooltipProps">
    <ReuseButtonTemplate />
  </Tooltip>
  <ReuseButtonTemplate v-else />
</template>

<script lang="ts">
import type { ButtonProps, ButtonSlots, KbdProps } from "@/components/ui/element";
import type { TooltipProps } from "@/components/ui/overlay";
import { tv } from "tailwind-variants";

const theme = tv({ slots: {
  base: "",
  trailing: "hidden lg:flex items-center gap-0.5 ms-auto",

} });

export interface DashboardSearchButtonProps {
  /**
   * The icon displayed in the button.
   * @defaultValue appConfig.ui.icons.search
   * @IconifyIcon
   */
  icon?: string;
  /**
   * The label displayed in the button.
   * @defaultValue 'Search...'
   */
  label?: string;
  /**
   * The color of the button.
   * @defaultValue 'neutral'
   */
  color?: ButtonProps["color"];
  /**
   * The variant of the button.
   * Defaults to 'outline' when not collapsed, 'ghost' when collapsed.
   */
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  /**
   * Whether the button is collapsed.
   * @defaultValue false
   */
  collapsed?: boolean;
  /**
   * Display a tooltip on the button when is collapsed with the button label.
   * This has priority over the global `tooltip` prop.
   */
  tooltip?: boolean | TooltipProps;
  /**
   * The keyboard keys to display in the button.
   * `{ variant: 'subtle' }`{lang="ts-type"}
   * @defaultValue ['meta', 'k']
   */
  kbds?: KbdProps["value"][] | KbdProps[];
  ui?: typeof theme.slots & ButtonProps["ui"];
  class?: any;
}
</script>

<script setup lang="ts">
import { createReusableTemplate, reactivePick } from "@vueuse/core";
import { defu } from "defu";
import { useForwardProps } from "reka-ui";
import { computed, toRef } from "vue";
import { Button, Kbd } from "@/components/ui/element";
import { Tooltip } from "@/components/ui/overlay";
import { omit, transformUI } from "@/utils";
import { useDashboard } from "@/utils/dashboard";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<DashboardSearchButtonProps>(), {
  color: "neutral",
  collapsed: false,
  tooltip: false,
  kbds: () => ["meta", "k"],
});
const slots = defineSlots<ButtonSlots>();

const [DefineButtonTemplate, ReuseButtonTemplate] = createReusableTemplate();

const proxySlots = omit(slots, ["trailing"]);

const rootProps = useForwardProps(reactivePick(props, "color", "size"));
const tooltipProps = toRef(() => defu(typeof props.tooltip === "boolean" ? {} : props.tooltip, { delayDuration: 0, content: { side: "right" } }) as TooltipProps);

const { toggleSearch } = useDashboard({ toggleSearch: () => {} });

const ui = computed(() => tv({ extend: theme })());
</script>
