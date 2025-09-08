export { default as Alert } from "./Alert.vue";
export type { AlertProps } from "./Alert.vue";
export { default as Avatar } from "./Avatar.vue";
export type { AvatarProps } from "./Avatar.vue";
export { default as AvatarGroup } from "./AvatarGroup.vue";
export type { AvatarGroupProps } from "./AvatarGroup.vue";
export { default as Badge } from "./Badge.vue";
export type { BadgeProps } from "./Badge.vue";
export { default as Button } from "./Button.vue";
export type { ButtonProps, ButtonSlots } from "./Button.vue";
export { default as Card } from "./Card.vue";
export type { CardProps } from "./Card.vue";
export { default as Chip } from "./Chip.vue";
export type { ChipProps } from "./Chip.vue";
export { default as FieldGroup } from "./FieldGroup.vue";
export { default as Icon } from "./Icon.vue";
export type { IconProps } from "./Icon.vue";
export { default as Kbd } from "./Kbd.vue";
export type { KbdProps } from "./Kbd.vue";
export { default as Progress } from "./Progress.vue";
export type { ProgressProps } from "./Progress.vue";
export type { SeparatorProps } from "./Separator.vue";
export { default as Separator } from "./Separator.vue";

export const fieldGroupVariant = {
  fieldGroup: {
    horizontal: "not-only:first:rounded-e-none not-only:last:rounded-s-none not-last:not-first:rounded-none",
    vertical: "not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none",
  },
};

export const fieldGroupVariantWithRoot = {
  fieldGroup: {
    horizontal: {
      root: "group",
      base: "group-not-only:group-first:rounded-e-none group-not-only:group-last:rounded-s-none group-not-last:group-not-first:rounded-none",
    },
    vertical: {
      root: "group",
      base: "group-not-only:group-first:rounded-b-none group-not-only:group-last:rounded-t-none group-not-last:group-not-first:rounded-none",
    },
  },
};
