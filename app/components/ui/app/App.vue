<template>
  <ConfigProvider :use-id="() => (useId() as string)" v-bind="configProviderProps">
    <TooltipProvider v-bind="tooltipProps">
      <Toaster v-if="toaster !== null" v-bind="toasterProps">
        <slot></slot>
      </Toaster>
      <slot v-else></slot>

      <OverlayProvider />
    </TooltipProvider>
  </ConfigProvider>
</template>

<script lang="ts">
import type { ConfigProviderProps, TooltipProviderProps } from "reka-ui";
import type { ToasterProps } from "../toaster";

export interface AppProps extends Omit<ConfigProviderProps, "useId" | "dir" | "locale"> {
  tooltip?: TooltipProviderProps;
  toaster?: ToasterProps | null;
  portal?: string | HTMLElement;
}
export interface AppSlots {
  default(props?: {}): any;
}
</script>

<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { ConfigProvider, TooltipProvider, useForwardProps } from "reka-ui";
import { provide, toRef, useId } from "vue";
import { OverlayProvider } from "@/components/ui/overlay";
import { Toaster } from "@/components/ui/toaster";
import { portalTargetInjectionKey } from "@/composables/usePortal";

const props = withDefaults(defineProps<AppProps>(), {
  portal: "body",
});

defineSlots<AppSlots>();

const configProviderProps = useForwardProps(reactivePick(props, "scrollBody"));
const tooltipProps = toRef(() => props.tooltip);
const toasterProps = toRef(() => props.toaster);

const portal = toRef(() => props.portal);
provide(portalTargetInjectionKey, portal);
</script>
