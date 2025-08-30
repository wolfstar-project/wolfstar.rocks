<template>
  <Button
    v-bind="rootProps"
    :aria-label="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
    :icon="sidebarCollapsed ? 'lucide:panel-left-open' : 'lucide:panel-left-close'"
    :class="ui({ class: props.class, side: props.side })"
    @click="collapseSidebar?.(!sidebarCollapsed)"
  />
</template>

<script lang="ts">
import type { AppConfig } from "@nuxt/schema";
import type { ButtonProps } from "@/components/ui/element";
import { tv } from "tailwind-variants";

const theme = tv({
  base: "hidden lg:flex",
  variants: {
    side: {
      left: "",
      right: "",
    },
  },

});

export interface DashboardSidebarCollapseProps extends /** @vue-ignore */ Pick<ButtonProps, "as" | "size" | "disabled" | "ui"> {
  side?: "left" | "right";
  /**
   * @defaultValue 'neutral'
   */
  color?: ButtonProps["color"];
  /**
   * @defaultValue 'ghost'
   */
  variant?: ButtonProps["variant"];
  class?: any;
}
</script>

<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { useForwardProps } from "reka-ui";
import { computed, ref } from "vue";
import { Button } from "@/components/ui/element";
import { useDashboard } from "@/utils/dashboard";

const props = withDefaults(defineProps<DashboardSidebarCollapseProps>(), {
  color: "neutral",
  variant: "ghost",
  side: "left",
});

const rootProps = useForwardProps(reactivePick(props, "color", "variant", "size"));

const { sidebarCollapsed, collapseSidebar } = useDashboard({ sidebarCollapsed: ref(false), collapseSidebar: () => {} });

const ui = computed(() => tv({ extend: theme }));
</script>
