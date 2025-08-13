<template>
  <SelectScrollUpButton
    data-slot="select-scroll-up-button"
    v-bind="forwardedProps"
    :class="cn('flex cursor-default items-center justify-center py-1', props.class)"
  >
    <slot>
      <Icon name="radix-icons:chevronup" class="size-4" />
    </slot>
  </SelectScrollUpButton>
</template>

<script setup lang="ts">
import type { SelectScrollUpButtonProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { SelectScrollUpButton, useForwardProps } from "reka-ui";
import { computed } from "vue";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/utils/cn";

const props = defineProps<SelectScrollUpButtonProps & { class?: HTMLAttributes["class"] }>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>
