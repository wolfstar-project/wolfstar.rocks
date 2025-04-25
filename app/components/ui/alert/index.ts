import type { AvatarProps } from '@/components/ui/avatar';
import type { ButtonProps } from '@/components/ui/button';
import { type VariantProps, tv } from 'tailwind-variants';
import type { HTMLAttributes } from 'vue';

export { default as Alert } from './Alert.vue';

export const alert = tv({
	slots: {
		root: 'alert w-full',
		wrapper: 'flex flex-1 flex-col',
		title: 'font-medium',
		description: 'opacity-90',
		icon: 'size-5 shrink-0',
		avatar: 'shrink-0',
		avatarSize: '2xl',
		actions: 'flex flex-wrap gap-2',
		close: ''
	},
	variants: {
		color: {
			primary: 'alert-primary',
			secondary: 'alert-secondary',
			accent: 'alert-accent',
			info: 'alert-info',
			success: 'alert-success',
			warning: 'alert-warning',
			error: 'alert-error'
		},
		variant: {
			solid: '',
			outline: '',
			soft: '',
			subtle: ''
		},
		style: {
			outline: 'alert-outline',
			dash: 'alert-dash',
			soft: 'alert-soft'
		},
		orientation: {
			horizontal: {
				root: 'alert-horizontal',
				actions: 'items-center'
			},
			vertical: {
				root: 'alert-vertical',
				actions: 'mt-3 items-start'
			}
		},
		title: {
			true: {
				description: 'mt-1'
			}
		}
	},
	defaultVariants: {
		orientation: 'vertical'
	}
});

type AlertVariants = VariantProps<typeof alert>;

export interface AlertProps {
	/**
	 * The element or component this component should render as.
	 * @defaultValue 'div'
	 */
	as?: string;
	title?: string;
	description?: string;
	/**
	 * @IconifyIcon
	 */
	icon?: string;
	avatar?: AvatarProps;
	/**
	 * @defaultValue 'primary'
	 */
	color?: AlertVariants['color'];
	/**
	 * @defaultValue 'solid'
	 */
	variant?: AlertVariants['variant'];
	/**
	 * The orientation between the content and the actions.
	 * @defaultValue 'vertical'
	 */
	orientation?: AlertVariants['orientation'];
	/**
	 * Display a list of actions:
	 * - under the title and description when orientation is `vertical`
	 * - next to the close button when orientation is `horizontal`
	 * `{ size: 'xs' }`{lang="ts-type"}
	 */
	actions?: ButtonProps[];
	/**
	 * Display a close button to dismiss the alert.
	 * `{ size: 'md', color: 'neutral', variant: 'link' }`{lang="ts-type"}
	 * @emits 'update:open'
	 * @defaultValue false
	 */
	close?: boolean | Partial<ButtonProps>;
	/**
	 * The icon displayed in the close button.
	 * @defaultValue appConfig.ui.icons.close
	 * @IconifyIcon
	 */
	closeIcon?: string;
	class?: HTMLAttributes['class'];
	ui?: Partial<typeof alert.slots>;
}

export interface AlertEmits {
	(e: 'update:open', value: boolean): void;
}

export interface AlertSlots {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	leading(props?: object): any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	title(props?: object): any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	description(props?: object): any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	actions(props?: object): any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	close(props: { ui: any }): any;
}
