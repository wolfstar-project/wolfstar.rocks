import { inject, provide, computed, type ComputedRef, type InjectionKey } from 'vue';
import type { ButtonGroupProps } from '@/components/ui/button-group';

export const ButtonGroupInjectionKey: InjectionKey<ComputedRef<{ size: ButtonGroupProps['size'] }>> = Symbol('buttonGroupInjectionKey');

export function useButtonGroup(props: { size: ButtonGroupProps['size'] }) {
	const avatarGroup = inject(ButtonGroupInjectionKey, undefined);

	const size = computed(() => props.size ?? avatarGroup?.value.size);
	provide(
		ButtonGroupInjectionKey,
		computed(() => ({ size: size.value }))
	);

	return {
		size
	};
}
