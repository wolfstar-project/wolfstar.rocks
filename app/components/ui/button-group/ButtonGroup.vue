<template>
  <Primitive :as="as" :class="ButtonGroupVariant({ orientation, class: props.class })">
    <slot></slot>
  </Primitive>
</template>

<script setup lang="ts">
import type { ButtonGroupProps, ButtonGroupSlots } from ".";
import { Primitive } from "reka-ui";
import { computed, provide } from "vue";
import { buttonGroupInjectionKey } from "@/composables/useButtonGroup";
import { ButtonGroupVariant } from ".";

const props = withDefaults(defineProps<ButtonGroupProps>(), {
  orientation: "horizontal",
});
defineSlots<ButtonGroupSlots>();

provide(
  buttonGroupInjectionKey,
  computed(() => ({
    orientation: props.orientation,
    size: props.size,
  })),
);
</script>
