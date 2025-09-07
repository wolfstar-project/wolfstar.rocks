<template>
  <Primitive :as="as" :data-orientation="orientation" :class="ui.root({ class: [props.ui?.root, props.class] })" @click="onClick">
    <slot name="avatar">
      <Chip v-if="chip && avatar" inset v-bind="typeof chip === 'object' ? chip : {}" :size="size">
        <UAvatar :alt="name" v-bind="avatar" :size="size" :class="ui.avatar({ class: props.ui?.avatar })" />
      </Chip>
      <Avatar v-else-if="avatar" :alt="name" v-bind="avatar" :size="size" :class="ui.avatar({ class: props.ui?.avatar })" />
    </slot>

    <div :class="ui.wrapper({ class: props.ui?.wrapper })">
      <Link
        v-if="to"
        :aria-label="name"
        v-bind="{ to, target, ...$attrs }"
        class="focus:outline-none peer"
        tabindex="-1"
        raw
      >
        <span class="absolute inset-0" aria-hidden="true"></span>
      </Link>

      <slot>
        <p v-if="name || !!slots.name" :class="ui.name({ class: props.ui?.name })">
          <slot name="name">
            {{ name }}
          </slot>
        </p>
        <p v-if="description || !!slots.description" :class="ui.description({ class: props.ui?.description })">
          <slot name="description">
            {{ description }}
          </slot>
        </p>
      </slot>
    </div>
  </Primitive>
</template>

<script lang="ts">
import type { AvatarProps, ChipProps } from "@/components/ui/element";
import type { LinkProps } from "@/components/ui/link";
import { tv, type VariantProps } from "tailwind-variants";

const theme = tv({
  slots: {
    root: "relative group/user",
    wrapper: "",
    name: "font-medium",
    description: "text-base-content/70",
    avatar: "shrink-0",
  },
  variants: {
    orientation: {
      horizontal: {
        root: "flex items-center",
      },
      vertical: {
        root: "flex flex-col",
      },
    },
    to: {
      true: {
        name: [
          "text-base-content hover:text-primary",
          "transition-colors",
        ],
        description: [
          "peer-hover:text-secondary",
          "transition-colors",
        ],
        avatar: "transform transition-transform duration-200 group-hover/user:scale-110",
      },
      false: {
        name: "text-primary",
        description: "",
      },
    },
    size: {
      xs: {
        root: "gap-1.5",
        wrapper: "flex items-center gap-1.5",
        name: "text-xs",
        description: "text-xs",
      },
      sm: {
        root: "gap-2",
        name: "text-xs",
        description: "text-xs",
      },
      md: {
        root: "gap-2",
        name: "text-sm",
        description: "text-xs",
      },
      lg: {
        root: "gap-2.5",
        name: "text-sm",
        description: "text-sm",
      },
      xl: {
        root: "gap-2.5",
        name: "text-base",
        description: "text-sm",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type UserVariants = VariantProps<typeof theme>;

export interface UserProps {
  /**
   * The element or component this component should render as.
   * @defaultValue 'div'
   */
  as?: any;
  name?: string;
  description?: string;
  avatar?: Omit<AvatarProps, "size"> & { [key: string]: any };
  chip?: boolean | Omit<ChipProps, "size" | "inset">;
  /**
   * @defaultValue 'md'
   */
  size?: UserVariants["size"];
  /**
   * The orientation of the user.
   * @defaultValue 'horizontal'
   */
  orientation?: UserVariants["orientation"];
  to?: LinkProps["to"];
  target?: LinkProps["target"];
  onClick?: (event: MouseEvent) => void | Promise<void>;
  class?: any;
  ui?: Partial<typeof theme.slots>;
}

export interface UserSlots {
  avatar(props?: object): any;
  name(props?: object): any;
  description(props?: object): any;
  default(props?: object): any;
}
</script>

<script setup lang="ts">
import { Primitive } from "reka-ui";
import { computed } from "vue";
import { Avatar, Chip } from "@/components/ui/element";
import { Link } from "@/components/ui/link";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<UserProps>(), {
  orientation: "horizontal",
});
const slots = defineSlots<UserSlots>();

const ui = computed(() => tv({ extend: theme })({
  size: props.size,
  orientation: props.orientation,
  to: !!props.to || !!props.onClick,
}));
</script>
