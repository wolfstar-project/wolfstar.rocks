import type { HSLObject } from 'colortranslator';
import type { VariantProps } from 'tailwind-variants';
import type { HTMLAttributes } from 'vue';
import { tv } from 'tailwind-variants';

export { default } from './ColorPicker.vue';

export const colorPicker = tv({
    slots: {
        root: 'opacity-100 data-[disabled]:opacity-50',
        picker: 'join-horizontal join gap-4',
        selector: 'rounded-box', // daisyUI box radius
        selectorBackground: 'relative h-full w-full rounded-box',
        selectorThumb: `absolute size-4 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full ring-2 ring-base-100 data-[disabled]:cursor-not-allowed`,
        track: 'relative w-2 rounded-box',
        trackThumb: `absolute size-4 -translate-x-1 -translate-y-1/2 cursor-pointer rounded-full ring-2 ring-base-100 data-[disabled]:cursor-not-allowed rtl:translate-x-1`,
    },
    variants: {
        size: {
            xs: {
                selector: 'h-32 w-32',
                track: 'h-32',
            },
            sm: {
                selector: 'h-36 w-36',
                track: 'h-36',
            },
            md: {
                selector: 'h-40 w-40',
                track: 'h-40',
            },
            lg: {
                selector: 'h-44 w-44',
                track: 'h-44',
            },
            xl: {
                selector: 'h-48 w-48',
                track: 'h-48',
            },
        },
    },
    defaultVariants: {
        size: 'md',
    },
});

type ColorPicker = VariantProps<typeof colorPicker>;

export interface HSVColor {
    h: number;
    s: number;
    v: number;
}

export function HSLtoHSV(hsl: HSLObject): HSVColor {
    const x = hsl.S * (hsl.L < 50 ? hsl.L : 100 - hsl.L);
    const v = hsl.L + x / 100;

    return {
        h: hsl.H,
        s: hsl.L === 0 ? hsl.S : (2 * x) / v,
        v,
    };
}

export function HSVtoHSL(hsv: HSVColor): HSLObject {
    const x = ((200 - hsv.s) * hsv.v) / 100;

    return {
        H: hsv.h,
        S: x === 0 || x === 200 ? 0 : Math.round((hsv.s * hsv.v) / (x <= 100 ? x : 200 - x)),
        L: Math.round(x / 2),
    };
}

export interface ColorPickerProps {
    /**
     * The element or component this component should render as.
     * @defaultValue 'div'
     */

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
}
