import type { ButtonGroupProps } from '@/components/ui/button-group';
import type { ComputedRef, InjectionKey } from 'vue';
import type { GetObjectField } from '~/types/utils';
import { computed, inject } from 'vue';

export const buttonGroupInjectionKey: InjectionKey<
    ComputedRef<{
        size: ButtonGroupProps['size'];
        orientation: ButtonGroupProps['orientation'];
    }>
> = Symbol('buttonGroupInjectionKey');

interface Props<T> {
    size?: GetObjectField<T, 'size'>;
}

export function useButtonGroup<T>(props: Props<T>) {
    const buttonGroup = inject(buttonGroupInjectionKey, undefined);
    return {
        orientation: computed(() => buttonGroup?.value.orientation),
        size: computed(() => props?.size ?? buttonGroup?.value.size),
    };
}
