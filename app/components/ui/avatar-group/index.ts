import type { VariantProps } from 'tailwind-variants';
import type { HtmlHTMLAttributes } from 'vue';
import { tv } from 'tailwind-variants';

export { default as AvatarGroup } from './AvatarGroup.vue';

export const avatarGroupVariants = tv({
    slots: {
        root: 'inline-flex flex-row-reverse justify-end',
        base: 'avatar-group -space-x-2',
    },
    variants: {
        size: {
            xs: {
                base: '-me-0.5 ring',
            },
            sm: {
                base: '-me-1.5 ring-2',
            },
            md: {
                base: '-me-1.5 ring-2',
            },
            lg: {
                base: '-me-1.5 ring-2',
            },
            xl: {
                base: '-me-2 ring-3',
            },
        },
    },
    defaultVariants: {
        size: 'md',
    },
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
    default: (props?: object) => any;
}
