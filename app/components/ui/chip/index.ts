import type { VariantProps } from 'tailwind-variants';
import { tv } from 'tailwind-variants';

export { default as Chip } from './Chip.vue';

const colors = ['primary', 'secondary', 'success', 'error', 'info', 'warning', 'neutral'] as const;

export const chip = tv({
	slots: {
		root: 'relative inline-flex shrink-0 items-center justify-center',
		base: 'flex items-center justify-center rounded-full font-medium whitespace-nowrap text-(--ui-bg) ring ring-(--ui-bg)'
	},
	variants: {
		color: {
			...Object.fromEntries((colors || []).map((color: string) => [color, `bg-(--ui-${color})`])),
			neutral: 'bg-(--ui-text-muted)'
		},
		size: {
			'3xs': 'h-[4px] min-w-[4px] text-[4px]',
			'2xs': 'h-[5px] min-w-[5px] text-[5px]',
			xs: 'h-[6px] min-w-[6px] text-[6px]',
			sm: 'h-[7px] min-w-[7px] text-[7px]',
			md: 'h-[8px] min-w-[8px] text-[8px]',
			lg: 'h-[9px] min-w-[9px] text-[9px]',
			xl: 'h-[10px] min-w-[10px] text-[10px]',
			'2xl': 'h-[11px] min-w-[11px] text-[11px]',
			'3xl': 'h-[12px] min-w-[12px] text-[12px]'
		},
		position: {
			'top-right': 'top-0 right-0',
			'bottom-right': 'right-0 bottom-0',
			'top-left': 'top-0 left-0',
			'bottom-left': 'bottom-0 left-0'
		},
		inset: {
			false: ''
		},
		standalone: {
			false: 'absolute'
		}
	},
	compoundVariants: [
		{
			position: 'top-right',
			inset: false,
			class: 'translate-x-1/2 -translate-y-1/2 transform'
		},
		{
			position: 'bottom-right',
			inset: false,
			class: 'translate-x-1/2 translate-y-1/2 transform'
		},
		{
			position: 'top-left',
			inset: false,
			class: '-translate-x-1/2 -translate-y-1/2 transform'
		},
		{
			position: 'bottom-left',
			inset: false,
			class: '-translate-x-1/2 translate-y-1/2 transform'
		}
	],
	defaultVariants: {
		size: 'md',
		color: 'primary',
		position: 'top-right'
	}
});

type ChipVariants = VariantProps<typeof chip>;

export interface ChipProps {
	/**
	 * The element or component this component should render as.
	 * @defaultValue 'div'
	 */
	as?: any;
	/** Display some text inside the chip. */
	text?: string | number;
	/**
	 * @defaultValue 'primary'
	 */
	color?: ChipVariants['color'];
	/**
	 * @defaultValue 'md'
	 */
	size?: ChipVariants['size'];
	/**
	 * The position of the chip.
	 * @defaultValue 'top-right'
	 */
	position?: ChipVariants['position'];
	/** When `true`, keep the chip inside the component for rounded elements. */
	inset?: boolean;
	/** When `true`, render the chip relatively to the parent. */
	standalone?: boolean;
	class?: any;
	ui?: Partial<typeof chip.slots>;
}

export interface ChipEmits {
	(e: 'update:show', payload: boolean): void;
}

export interface ChipSlots {
	default: (props?: object) => any;
	content: (props?: object) => any;
}
