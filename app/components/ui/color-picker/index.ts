import type { HTMLAttributes } from 'vue';
import { tv, type VariantProps } from 'tailwind-variants';
import type { HSLObject } from 'colortranslator';
export { default } from './ColorPicker.vue';

export const colorPicker = tv({
	slots: {
		root: 'opacity-100 data-[disabled]:opacity-50',
		picker: 'join join-horizontal gap-4',
		selector: 'rounded-box', // daisyUI box radius
		selectorBackground: 'w-full h-full relative rounded-box',
		selectorThumb: `
      absolute -translate-y-1/2 -translate-x-1/2 
      size-4 ring-2 ring-base-100 rounded-full 
      cursor-pointer data-[disabled]:cursor-not-allowed
    `,
		track: 'w-2 relative rounded-box',
		trackThumb: `
      absolute -translate-y-1/2 -translate-x-1 rtl:translate-x-1
      size-4 rounded-full ring-2 ring-base-100
      cursor-pointer data-[disabled]:cursor-not-allowed
    `
	},
	variants: {
		size: {
			xs: {
				selector: 'w-32 h-32',
				track: 'h-32'
			},
			sm: {
				selector: 'w-36 h-36',
				track: 'h-36'
			},
			md: {
				selector: 'w-40 h-40',
				track: 'h-40'
			},
			lg: {
				selector: 'w-44 h-44',
				track: 'h-44'
			},
			xl: {
				selector: 'w-48 h-48',
				track: 'h-48'
			}
		}
	},
	defaultVariants: {
		size: 'md'
	}
});

type ColorPicker = VariantProps<typeof colorPicker>;

export type HSVColor = {
	h: number;
	s: number;
	v: number;
};

export function HSLtoHSV(hsl: HSLObject): HSVColor {
	const x = hsl.S * (hsl.L < 50 ? hsl.L : 100 - hsl.L);
	const v = hsl.L + x / 100;

	return {
		h: hsl.H,
		s: hsl.L === 0 ? hsl.S : (2 * x) / v,
		v
	};
}

export function HSVtoHSL(hsv: HSVColor): HSLObject {
	const x = ((200 - hsv.s) * hsv.v) / 100;

	return {
		H: hsv.h,
		S: x === 0 || x === 200 ? 0 : Math.round((hsv.s * hsv.v) / (x <= 100 ? x : 200 - x)),
		L: Math.round(x / 2)
	};
}

export type ColorPickerProps = {
	/**
	 * The element or component this component should render as.
	 * @defaultValue 'div'
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	as?: any;
	/**
	 * Throttle time in ms for the color picker
	 */
	throttle?: number;
	/**
	 * Disable the color picker
	 */
	disabled?: boolean;
	/**
	 * The default value of the color picker
	 */
	defaultValue?: string;
	/**
	 * Format of the color
	 * @defaultValue 'hex'
	 */
	format?: 'hex' | 'rgb' | 'hsl' | 'cmyk' | 'lab';
	/**
	 * @defaultValue 'md'
	 */
	size?: ColorPicker['size'];

	class?: HTMLAttributes['class'];
	ui?: ColorPicker['slots'];
};
