<template>
  <Button
    v-bind="buttonProps"
    :class="cn('group relative overflow-hidden rounded-full', props.class)"
  >
    <template #default>
      <div class="flex items-center gap-2">
        <div
          class="size-2 scale-100 rounded-lg bg-primary transition-all duration-300 group-hover:scale-[100.8]"
        ></div>
        <span
          class="inline-block whitespace-nowrap transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0"
        >
          {{ text }}
        </span>
      </div>

      <div
        class="absolute top-0 z-10 flex size-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100"
      >
        <span class="whitespace-nowrap">{{ text }}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-arrow-right"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </div>
    </template>
  </Button>
</template>

<script lang="ts" setup>
import type { ButtonProps } from "@/components/ui/button";
import { useForwardProps } from "reka-ui";
import { computed } from "vue";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface AnimatedButtonProps extends Omit<ButtonProps, "text"> {
  text?: string;
}

const props = withDefaults(defineProps<AnimatedButtonProps>(), {
  text: "Button",
});

// Estrai le proprietà specifiche dell'animazione e passa il resto a Button
const { text } = props;

const buttonProps = useForwardProps(computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
}));
</script>
