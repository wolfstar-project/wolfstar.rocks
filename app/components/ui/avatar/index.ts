import { type VariantProps, tv } from 'tailwind-variants';
import type { HTMLAttributes } from 'vue';

export { default as Avatar } from './Avatar.vue';
export { default as AvatarBase } from './AvatarBase.vue';
export { default as AvatarImage } from './AvatarImage.vue';
export { default as AvatarFallback } from './AvatarFallback.vue';

export const avatarVariant = tv({
	base: 'avatar',
	slots: {
		root: 'inline-flex items-center justify-center shrink-0 select-none overflow-hidden rounded-full align-middle bg-base-200',
		image: 'h-full w-full rounded-[inherit] object-cover',
		fallback: 'font-medium leading-none text-base-content truncate',
		icon: 'text-base-content shrink-0'
	},
	variants: {
		size: {
			xs: 'w-8 h-8',
			sm: 'w-10 h-10',
			md: 'w-16 h-16',
			lg: 'w-24 h-24',
			xl: 'w-32 h-32'
		},
		status: {
			online: 'avatar-online',
			offline: 'avatar-offline'
		},
		shape: {
			circle: 'mask mask-circle',
			square: 'mask mask-squircle'
		}
	},
	defaultVariants: {
		size: 'md',
		shape: 'circle'
	}
});

export type AvatarVariants = VariantProps<typeof avatarVariant>;

export interface AvatarProps {
	/**
	 * The element or component this component should render as.
	 * @defaultValue 'span'
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	as?: any;

	src?: string;
	alt?: string;

	fallback?: string;

	shape?: AvatarVariants['shape'];

	class?: HTMLAttributes['class'];

	/**
	 * @IconifyIcon
	 */
	icon?: string;
	text?: string;
	/**
	 * @defaultValue 'md'
	 */
	size?: AvatarVariants['size'];

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	style?: any;

	ui?: Partial<typeof avatarVariant.slots>;
}
