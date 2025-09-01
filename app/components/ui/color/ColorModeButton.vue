<template>
  <ClientOnly v-if="!colorMode?.forced">
    <Button
      :icon="isDark ? 'lucide:moon' : 'lucide:sun'"
      :color="color"
      :variant="variant"
      :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      v-bind="$attrs"
      @click="isDark = !isDark"
    />

    <template #fallback>
      <slot name="fallback">
        <div class="size-8"></div>
      </slot>
    </template>
  </ClientOnly>
</template>

<script lang="ts">
import type { ButtonProps } from "@/components/ui/element";

export interface ColorModeButtonProps extends /** @vue-ignore */ Pick<ButtonProps, "as" | "size" | "disabled" | "ui"> {
  /**
   * @defaultValue 'neutral'
   */
  color?: ButtonProps["color"];
  /**
   * @defaultValue 'ghost'
   */
  variant?: ButtonProps["variant"];
}
</script>

<script setup lang="ts">
import { useColorMode } from "#imports";
import { computed } from "vue";
import { Button } from "@/components/ui/element";

defineOptions({ inheritAttrs: false });

withDefaults(defineProps<ColorModeButtonProps>(), {
  color: "neutral",
  variant: "ghost",
});
defineSlots<{
  fallback(props?: {}): any;
}>();

const colorMode = useColorMode();

const isDark = computed({
  get() {
    return colorMode.value === "dark";
  },
  set(_isDark: boolean) {
    colorMode.preference = _isDark ? "dark" : "light";
  },
});
</script>
