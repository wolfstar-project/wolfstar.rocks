<template>
  <Button
    v-bind="rootProps"
    :aria-label="sidebarOpen ? 'Close sidebar' : 'Open sidebar'"
    :icon="sidebarOpen ? 'ic:round-close' : 'lucide:menu'"
    :class="ui({ class: props.class, side: props.side })"
    @click="toggleSidebar"
  />
</template>

<script lang="ts">
import type { ButtonProps } from "@/components/ui/button";
import { tv } from "tailwind-variants";

const theme = tv({
  base: "lg:hidden",
  variants: {
    side: {
      left: "",
      right: "",
    },
  },
});

export interface DashboardSidebarToggleProps extends /** @vue-ignore */ Pick<ButtonProps, "as" | "size" | "disabled" | "ui"> {
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
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/utils/dashboard";

const props = withDefaults(defineProps<DashboardSidebarToggleProps>(), {
  color: "neutral",
  variant: "ghost",
  side: "left",
});

const rootProps = useForwardProps(reactivePick(props, "color", "variant", "size"));

const { sidebarOpen, toggleSidebar } = useDashboard({ sidebarOpen: ref(false), toggleSidebar: () => {} });

const ui = computed(() => tv({ extend: theme }));
</script>
