import { tv, type VariantProps } from 'tailwind-variants';
import type { HtmlHTMLAttributes } from 'vue';
export { default as AvatarGroup } from './AvatarGroup.vue';

export const avatarGroupVariants = tv({
	slots: {
		root: 'inline-flex flex-row-reverse justify-end',
		base: 'avatar-group -space-x-2'
	},
	variants: {
		size: {
			xs: {
				base: 'ring -me-0.5'
			},
			sm: {
				base: 'ring-2 -me-1.5'
			},
			md: {
				base: 'ring-2 -me-1.5'
			},
			lg: {
				base: 'ring-2 -me-1.5'
			},
			xl: {
				base: 'ring-3 -me-2'
			}
		}
	},
	defaultVariants: {
		size: 'md'
	}
});

export type AvatarGroupVariants = VariantProps<typeof avatarGroupVariants>;

export interface AvatarGroupProps {
	/**
	 * The element or component this component should render as.
	 * @defaultValue 'div'
	 */
	as?: string;
	/**
	 * @defaultValue 'md'
	 */
	size?: AvatarGroupVariants['size'];
	/**
	 * The maximum number of avatars to display.
	 */
	max?: number | string;
	class?: HtmlHTMLAttributes['class'];
	ui?: Partial<typeof avatarGroupVariants.slots>;
}

export interface AvatarGroupSlots {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	default(props?: object): any;
}
