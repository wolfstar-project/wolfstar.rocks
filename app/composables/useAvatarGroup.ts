import { inject, provide, computed, type ComputedRef, type InjectionKey } from 'vue';
import type { AvatarGroupProps } from '@/components/ui/avatar-group';

export const AvatarGroupInjectionKey: InjectionKey<ComputedRef<{ size: AvatarGroupProps['size'] }>> = Symbol('avatarGroupInjectionKey');

export function useAvatarGroup(props: { size: AvatarGroupProps['size'] }) {
	const avatarGroup = inject(AvatarGroupInjectionKey, undefined);

	const size = computed(() => props.size ?? avatarGroup?.value.size);
	provide(
		AvatarGroupInjectionKey,
		computed(() => ({ size: size.value }))
	);

	return {
		size
	};
}
