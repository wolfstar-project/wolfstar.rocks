<template>
  <component
    :is="props.chip ? Chip : Primitive"
    :as="as"
    v-bind="props.chip ? (typeof props.chip === 'object' ? { inset: true, ...props.chip } : { inset: true }) : {}"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
    :style="props.style"
  >
    <NuxtImg
      v-if="src && !error"
      role="img"
      :src="src"
      :alt="alt"
      :width="sizePx"
      :height="sizePx"
      v-bind="$attrs"
      :class="ui.image({ class: props.ui?.image })"
      @error="onError"
    />

    <Slot v-else v-bind="$attrs">
      <slot>
        <Icon v-if="icon" :name="icon" :class="ui.icon({ class: props.ui?.icon })" />
        <span v-else :class="ui.fallback({ class: props.ui?.fallback })">{{ fallback || '&nbsp;' }}</span>
      </slot>
    </Slot>
  </component>
</template>

<script lang="ts">
import type { VariantProps } from "tailwind-variants";
import { NuxtImg } from "#components";
import { tv } from "tailwind-variants";

const theme = tv({
  base: "avatar",
  slots: {
    root: "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-base-200 align-middle select-none",
    image: "h-full w-full rounded-[inherit] object-cover",
    fallback: "avatar-placeholder truncate leading-none font-medium text-base-content",
    icon: "shrink-0 text-base-content",
  },
  variants: {
    size: {
      xs: "h-8 w-8",
      sm: "h-10 w-10",
      md: "h-16 w-16",
      lg: "h-24 w-24",
      xl: "h-32 w-32",
    },
    status: {
      online: "avatar-online",
      offline: "avatar-offline",
    },
    shape: {
      circle: "mask mask-circle",
      square: "mask mask-squircle",
    },
  },
  defaultVariants: {
    size: "md",
    shape: "circle",
  },
});

type AvatarVariants = VariantProps<typeof theme>;

export interface AvatarProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'span'
   */
  as?: any;
  src?: string;
  alt?: string;
  fallback?: string;
  /**
   * @IconifyIcon
   */
  icon?: string;
  text?: string;
  /**
   * @defaultValue 'md'
   */
  size?: AvatarVariants["size"];
  chip?: boolean | ChipProps;
  class?: any;
  style?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface AvatarSlots {
  default(props?: {}): any;
}
</script>

<script setup lang="ts">
import { Primitive } from "reka-ui";
import { computed, ref } from "vue";
import { Chip, type ChipProps, Icon } from "@/components/ui/element";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<AvatarProps>(), {
  size: "md",
  shape: "circle",
  as: "span",
});

const { size } = useAvatarGroup(props);

const fallback = computed(() => props.text || props.fallback || (props.alt || "").split(" ").map(word => word.charAt(0)).join("").substring(0, 2));

const ui = computed(() => tv({ extend: theme })({
  size: size.value,
}));

const sizePx = computed(() => ({
  "3xs": 16,
  "2xs": 20,
  "xs": 24,
  "sm": 28,
  "md": 32,
  "lg": 36,
  "xl": 40,
  "2xl": 44,
  "3xl": 48,
})[props.size || "md"]);

const error = ref(false);

watch(() => props.src, () => {
  if (error.value) {
    error.value = false;
  }
});

function onError() {
  error.value = true;
}
</script>
