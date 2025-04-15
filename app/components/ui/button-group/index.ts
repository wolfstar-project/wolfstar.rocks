import { tv, type VariantProps } from 'tailwind-variants';
import type { HtmlHTMLAttributes } from 'vue';
export { default as ButtonGroup } from './ButtonGroup.vue';

export const buttonGroupVariant = {
	buttonGroup: {
		horizontal: 'not-only:first:rounded-e-none not-only:last:rounded-s-none not-last:not-first:rounded-none',
		vertical: 'not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none'
	}
};

export const buttonGroupVariantWithRoot = {
	buttonGroup: {
		horizontal: {
			root: 'group',
			base: 'group-not-only:group-first:rounded-e-none group-not-only:group-last:rounded-s-none group-not-last:group-not-first:rounded-none'
		},
		vertical: {
			root: 'group',
			base: 'group-not-only:group-first:rounded-b-none group-not-only:group-last:rounded-t-none group-not-last:group-not-first:rounded-none'
		}
	}
};

export const ButtonGroupVariant = tv({
	base: 'relative join',
	variants: {
		size: {
			xs: '',
			sm: '',
			md: '',
			lg: '',
			xl: ''
		},
		orientation: {
			horizontal: 'inline-flex -space-x-px',
			vertical: 'flex flex-col -space-y-px'
		}
	}
});

export type ButtonGroupVariants = VariantProps<typeof ButtonGroupVariant>;

export interface ButtonGroupProps {
	/**
	 * The element or component this component should render as.
	 * @defaultValue 'div'
	 */
	as?: string;
	/**
	 * @defaultValue 'md'
	 */
	size?: ButtonGroupVariants['size'];
	/**
	 * The orientation the buttons are laid out.
	 * @defaultValue 'horizontal'
	 */
	orientation?: ButtonGroupVariants['orientation'];
	class?: HtmlHTMLAttributes['class'];
}

export interface ButtonGroupSlots {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	default(props?: object): any;
}
