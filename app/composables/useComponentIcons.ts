import type { MaybeRefOrGetter } from "vue";
import type { AvatarProps } from "~/components/ui/element/avatar";
import { computed, toValue } from "vue";

export interface UseComponentIconsProps {
  /**
   * Display an icon based on the `leading` and `trailing` props.
   * @IconifyIcon
   */
  icon?: string;
  /** Display an avatar on the left side. */
  avatar?: AvatarProps;
  /** When `true`, the icon will be displayed on the left side. */
  leading?: boolean;
  /**
   * Display an icon on the left side.
   * @IconifyIcon
   */
  leadingIcon?: string;
  /** When `true`, the icon will be displayed on the right side. */
  trailing?: boolean;
  /**
   * Display an icon on the right side.
   * @IconifyIcon
   */
  trailingIcon?: string;
  /** When `true`, the loading icon will be displayed. */
  loading?: boolean;
  /**
   * The icon when the `loading` prop is `true`.
   * @defaultValue 'lucide:loader-circle'
   * @IconifyIcon
   */
  loadingIcon?: string;
}

export function useComponentIcons(componentProps: MaybeRefOrGetter<UseComponentIconsProps>) {
  const props = computed(() => toValue(componentProps));

  const isLeading = computed(
    () =>
      (props.value.icon && props.value.leading)
      || (props.value.icon && !props.value.trailing)
      || (props.value.loading && !props.value.trailing)
      || !!props.value.leadingIcon,
  );
  const isTrailing = computed(
    () => (props.value.icon && props.value.trailing) || (props.value.loading && props.value.trailing) || !!props.value.trailingIcon,
  );

  const leadingIconName = computed(() => {
    if (props.value.loading) {
      return props.value.loadingIcon || "ic:round-cross";
    }

    return props.value.leadingIcon || props.value.icon;
  });
  const trailingIconName = computed(() => {
    if (props.value.loading && !isLeading.value) {
      return props.value.loadingIcon || "ic:round-cross";
    }

    return props.value.trailingIcon || props.value.icon;
  });

  return {
    isLeading,
    isTrailing,
    leadingIconName,
    trailingIconName,
  };
}
