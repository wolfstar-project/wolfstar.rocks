import type { ComputedRef, InjectionKey } from "vue";
import type { FieldGroupProps } from "@/components/ui/field-group";
import type { GetObjectField } from "~/types/utils";
import { computed, inject } from "vue";

export const fieldGroupInjectionKey: InjectionKey<
  ComputedRef<{
    size: FieldGroupProps["size"];
    orientation: FieldGroupProps["orientation"];
  }>
> = Symbol("fieldGroupInjectionKey");

interface Props<T> {
  size?: GetObjectField<T, "size">;
}

export function useFieldGroup<T>(props: Props<T>) {
  const fieldGroup = inject(fieldGroupInjectionKey, undefined);
  return {
    orientation: computed(() => fieldGroup?.value.orientation),
    size: computed(() => props?.size ?? fieldGroup?.value.size),
  };
}
