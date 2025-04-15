/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SelectRootProps, SelectContentProps, SelectContentEmits, SelectArrowProps, SelectRootEmits } from 'reka-ui';
import { tv, type VariantProps } from 'tailwind-variants';
import type { AvatarProps } from '../avatar';
import type { ChipProps } from '../chip';
import type {
	AcceptableValue,
	ArrayOrNested,
	GetItemKeys,
	GetModelValue,
	GetModelValueEmits,
	NestedItem,
	PartialString,
	EmitsToProps
} from '@/types/utils';
import { defuFn } from 'defu';
import { inputWithoutTV } from '../input';

const selectWithoutTV = {
	slots: {
		root: () => undefined,
		base: () => [
			'select w-full', // daisyUI base class
			'disabled:cursor-not-allowed disabled:opacity-50'
		],
		value: 'truncate pointer-events-none',
		placeholder: 'text-base-content/60',
		content: 'max-h-60 bg-base-100 shadow-lg rounded-box overflow-hidden',
		viewport: 'divide-y divide-base-200',
		group: 'p-1',
		empty: 'py-2 text-center text-sm text-base-content/60',
		label: 'font-semibold text-base-content',
		separator: 'divider',
		item: [
			'w-full flex items-center select-none cursor-pointer p-2',
			'hover:bg-base-200',
			'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50'
		],
		itemLeadingIcon: 'shrink-0 text-base-content/60',
		itemLeadingAvatar: 'shrink-0',
		itemLeadingChip: 'shrink-0',
		itemTrailing: 'ms-auto inline-flex gap-1.5 items-center',
		itemLabel: 'truncate'
	},
	variants: {
		color: {
			primary: 'select-primary',
			secondary: 'select-secondary',
			accent: 'select-accent',
			info: 'select-info',
			success: 'select-success',
			warning: 'select-warning',
			error: 'select-error',
			neutral: ''
		},
		size: {
			xs: {
				base: 'select-xs',
				item: 'text-xs',
				itemLeadingIcon: 'size-4',
				itemLeadingAvatar: 'size-4',
				itemLeadingChip: 'size-4',
				itemTrailingIcon: 'size-4'
			},
			sm: {
				base: 'select-sm',
				item: 'text-sm',
				itemLeadingIcon: 'size-4',
				itemLeadingAvatar: 'size-4',
				itemLeadingChip: 'size-4',
				itemTrailingIcon: 'size-4'
			},
			md: {
				base: 'select-md',
				item: 'text-base',
				itemLeadingIcon: 'size-5',
				itemLeadingAvatar: 'size-5',
				itemLeadingChip: 'size-5',
				itemTrailingIcon: 'size-5'
			},
			lg: {
				base: 'select-lg',
				item: 'text-lg',
				itemLeadingIcon: 'size-5',
				itemLeadingAvatar: 'size-5',
				itemLeadingChip: 'size-5',
				itemTrailingIcon: 'size-5'
			},
			xl: {
				base: 'select-xl',
				item: 'text-xl',
				itemLeadingIcon: 'size-6',
				itemLeadingAvatar: 'size-6',
				itemLeadingChip: 'size-6',
				itemTrailingIcon: 'size-6'
			}
		},
		variant: {
			bordered: 'select-bordered',
			ghost: 'select-ghost'
		}
	},
	defaultVariants: {
		size: 'md',
		color: 'primary',
		variant: 'bordered'
	}
};

export const select = tv({ extend: defuFn(selectWithoutTV, inputWithoutTV) });

interface SelectItemBase {
	label?: string;
	/**
	 * @IconifyIcon
	 */
	icon?: string;
	avatar?: AvatarProps;
	chip?: ChipProps;
	/**
	 * The item type.
	 * @defaultValue 'item'
	 */
	type?: 'label' | 'separator' | 'item';
	value?: string | number;
	disabled?: boolean;
	onSelect?(e?: Event): void;
	[key: string]: any;
}
export type SelectItem = SelectItemBase | AcceptableValue | boolean;

type SelectVariants = VariantProps<typeof select>;

export interface SelectProps<
	T extends ArrayOrNested<SelectItem> = ArrayOrNested<SelectItem>,
	VK extends GetItemKeys<T> = 'value',
	M extends boolean = false
> extends Omit<SelectRootProps<T>, 'dir' | 'multiple' | 'modelValue' | 'defaultValue' | 'by'>,
		UseComponentIconsProps {
	id?: string;
	/** The placeholder text when the select is empty. */
	placeholder?: string;
	/**
	 * @defaultValue 'primary'
	 */
	color?: SelectVariants['color'];
	/**
	 * @defaultValue 'outline'
	 */
	variant?: SelectVariants['variant'];
	/**
	 * @defaultValue 'md'
	 */
	size?: SelectVariants['size'];
	/**
	 * The icon displayed to open the menu.
	 * @defaultValue appConfig.ui.icons.chevronDown
	 * @IconifyIcon
	 */
	trailingIcon?: string;
	/**
	 * The icon displayed when an item is selected.
	 * @defaultValue appConfig.ui.icons.check
	 * @IconifyIcon
	 */
	selectedIcon?: string;
	/**
	 * The content of the menu.
	 * @defaultValue { side: 'bottom', sideOffset: 8, collisionPadding: 8, position: 'popper' }
	 */
	content?: Omit<SelectContentProps, 'as' | 'asChild' | 'forceMount'> & Partial<EmitsToProps<SelectContentEmits>>;
	/**
	 * Display an arrow alongside the menu.
	 * @defaultValue false
	 */
	arrow?: boolean | Omit<SelectArrowProps, 'as' | 'asChild'>;
	/**
	 * Render the menu in a portal.
	 * @defaultValue true
	 */
	portal?: boolean;
	/**
	 * When `items` is an array of objects, select the field to use as the value.
	 * @defaultValue 'value'
	 */
	valueKey?: VK;
	/**
	 * When `items` is an array of objects, select the field to use as the label.
	 * @defaultValue 'label'
	 */
	labelKey?: keyof NestedItem<T>;
	items?: T;
	/** The value of the Select when initially rendered. Use when you do not need to control the state of the Select. */
	defaultValue?: GetModelValue<T, VK, M>;
	/** The controlled value of the Select. Can be bind as `v-model`. */
	modelValue?: GetModelValue<T, VK, M>;
	/** Whether multiple options can be selected or not. */
	multiple?: M & boolean;
	/** Highlight the ring color like a focus state. */
	highlight?: boolean;
	class?: any;
	ui?: PartialString<typeof select.slots>;
}

export type SelectEmits<A extends ArrayOrNested<SelectItem>, VK extends GetItemKeys<A> | undefined, M extends boolean> = Omit<
	SelectRootEmits,
	'update:modelValue'
> & {
	change: [payload: Event];
	blur: [payload: FocusEvent];
	focus: [payload: FocusEvent];
} & GetModelValueEmits<A, VK, M>;

type SlotProps<T extends SelectItem> = (props: { item: T; index: number }) => any;

export interface SelectSlots<
	A extends ArrayOrNested<SelectItem> = ArrayOrNested<SelectItem>,
	VK extends GetItemKeys<A> | undefined = undefined,
	M extends boolean = false,
	T extends NestedItem<A> = NestedItem<A>
> {
	'leading'(props: { modelValue?: GetModelValue<A, VK, M>; open: boolean; ui: ReturnType<typeof select> }): any;
	'default'(props: { modelValue?: GetModelValue<A, VK, M>; open: boolean }): any;
	'trailing'(props: { modelValue?: GetModelValue<A, VK, M>; open: boolean; ui: ReturnType<typeof select> }): any;
	item: SlotProps<T>;
	'item-leading': SlotProps<T>;
	'item-label': SlotProps<T>;
	'item-trailing': SlotProps<T>;
}
