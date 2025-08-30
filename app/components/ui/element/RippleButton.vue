<template>
  <Button
    ref="rippleButtonRef"
    v-bind="buttonProps"
    :style="{ '--duration': `${rippleDuration}ms` }"
    class="relative overflow-hidden"
    @click="handleClick"
  >
    <span class="pointer-events-none absolute inset-0">
      <span
        v-for="ripple in buttonRipples"
        :key="ripple.key"
        class="ripple-animation absolute rounded-full opacity-30"
        :style="{
          width: `${ripple.size}px`,
          height: `${ripple.size}px`,
          top: `${ripple.y}px`,
          left: `${ripple.x}px`,
          backgroundColor: rippleColor,
          transform: 'scale(0)',
          animationDuration: `${rippleDuration}ms`,
        }"
      ></span>
    </span>
  </Button>
</template>

<script lang="ts" setup>
import type { ButtonProps } from "@/components/ui/element";
import { useForwardProps } from "reka-ui";
import { computed, ref, watchEffect } from "vue";
import { Button } from "@/components/ui/element";

interface RippleButtonProps extends Omit<ButtonProps, "rippleColor" | "rippleDuration"> {
  rippleColor?: string;
  rippleDuration?: number;
}

const props = withDefaults(defineProps<RippleButtonProps>(), {
  rippleColor: "#ADD8E6",
  rippleDuration: 600,
});

// Estrai le proprietà specifiche del ripple e passa il resto a Button
const { rippleColor, rippleDuration } = props;

const buttonProps = useForwardProps(computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
}));

const rippleButtonRef = ref<HTMLButtonElement | null>(null);
const buttonRipples = ref<Array<{ x: number; y: number; size: number; key: number }>>([]);

function handleClick(event: MouseEvent) {
  createRipple(event);
}

function createRipple(event: MouseEvent) {
  const button = rippleButtonRef.value || rippleButtonRef.value;
  if (!button)
    return;

  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  const newRipple = { x, y, size, key: Date.now() };
  buttonRipples.value.push(newRipple);
}

watchEffect(() => {
  if (buttonRipples.value.length > 0) {
    const lastRipple = buttonRipples.value[buttonRipples.value.length - 1];
    setTimeout(() => {
      buttonRipples.value = buttonRipples.value.filter((ripple) => lastRipple !== undefined && ripple.key !== lastRipple.key);
    }, rippleDuration);
  }
});
</script>

<style scoped>
@keyframes rippling {
	0% {
		opacity: 1;
	}
	100% {
		transform: scale(2);
		opacity: 0;
	}
}

.ripple-animation {
	animation: rippling var(--duration) ease-out;
}
</style>
