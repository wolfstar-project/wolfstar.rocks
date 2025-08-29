export { default as FieldGroup } from "./FieldGroup.vue";

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
