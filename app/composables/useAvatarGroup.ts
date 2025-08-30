import type { ComputedRef, InjectionKey } from "vue";
import type { AvatarGroupProps } from "@/components/ui/element";
import { computed, inject, provide } from "vue";

export const AvatarGroupInjectionKey: InjectionKey<ComputedRef<{ size: AvatarGroupProps["size"] }>> = Symbol("avatarGroupInjectionKey");

export function useAvatarGroup(props: { size: AvatarGroupProps["size"] }) {
  const avatarGroup = inject(AvatarGroupInjectionKey, undefined);

  const size = computed(() => props.size ?? avatarGroup?.value.size);
  provide(
    AvatarGroupInjectionKey,
    computed(() => ({ size: size.value })),
  );

  return {
    size,
  };
}
