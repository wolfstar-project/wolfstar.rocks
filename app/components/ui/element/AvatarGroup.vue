<template>
  <Primitive :as="as" :class="ui.root({ class: [props.class, props.ui?.root] })">
    <Avatar v-if="hiddenCount > 0" :text="`+${hiddenCount}`" :class="ui.base({ class: props.ui?.base })" />
    <component :is="avatar" v-for="(avatar, count) in visibleAvatars" :key="count" :class="ui.base({ class: props.ui?.base })" />
  </Primitive>
</template>

<script lang="ts">
import type { VariantProps } from "tailwind-variants";
import type { HtmlHTMLAttributes } from "vue";
import { tv } from "tailwind-variants";

const theme = tv({
  slots: {
    root: "inline-flex flex-row-reverse justify-end",
    base: "avatar-group -space-x-2",
  },
  variants: {
    size: {
      xs: {
        base: "-me-0.5 ring",
      },
      sm: {
        base: "-me-1.5 ring-2",
      },
      md: {
        base: "-me-1.5 ring-2",
      },
      lg: {
        base: "-me-1.5 ring-2",
      },
      xl: {
        base: "-me-2 ring-3",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type AvatarGroupVariants = VariantProps<typeof theme>;

export interface AvatarGroupProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: string;
  /**
   * @defaultValue 'md'
   */
  size?: AvatarGroupVariants["size"];
  /**
   * The maximum number of avatars to display.
   */
  max?: number | string;
  class?: HtmlHTMLAttributes["class"];
  ui?: Partial<typeof theme.slots>;
}

export interface AvatarGroupSlots {
  default: (props?: object) => any;
}
</script>

<script setup lang="ts">
import { Primitive } from "reka-ui";
import { computed, provide } from "vue";
import { Avatar } from "@/components/ui/element";
import { AvatarGroupInjectionKey } from "@/composables/useAvatarGroup";

const props = defineProps<AvatarGroupProps>();
const slots = defineSlots<AvatarGroupSlots>();

const ui = computed(() =>
  tv({ extend: theme })({
    size: props.size,
  }),
);

const max = computed(() => (typeof props.max === "string" ? Number.parseInt(props.max, 10) : props.max));

const children = computed(() => {
  let children = slots.default?.();
  if (children?.length) {
    children = children

      .flatMap((child: any) => {
        if (typeof child.type === "symbol") {
          // `v-if="false"` or commented node
          if (typeof child.children === "string") {
            // eslint-disable-next-line array-callback-return
            return;
          }

          return child.children;
        }

        return child;
      })
      .filter(Boolean);
  }

  return children || [];
});

const visibleAvatars = computed(() => {
  if (!children.value.length) {
    return [];
  }

  if (!max.value || max.value <= 0) {
    return [...children.value].reverse();
  }

  return [...children.value].slice(0, max.value).reverse();
});

const hiddenCount = computed(() => {
  if (!children.value.length) {
    return 0;
  }

  return children.value.length - visibleAvatars.value.length;
});

provide(
  AvatarGroupInjectionKey,
  computed(() => ({
    size: props.size,
  })),
);
</script>
