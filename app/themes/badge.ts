import { colors } from "@/utils/constants";

export default {
	compoundVariants: [
		// Square variants with size adjustments
		{
			class: "badge-xs p-0.5",
			size: "xs",
			square: true,
		},
		{
			class: "badge-sm p-1",
			size: "sm",
			square: true,
		},
		{
			class: "badge-md p-1",
			size: "md",
			square: true,
		},
		{
			class: "badge-lg p-1",
			size: "lg",
			square: true,
		},
		{
			class: "badge-xl p-1",
			size: "xl",
			square: true,
		},
	],
	defaultVariants: {
		color: "primary",
		size: "md",
	},
	slots: {
		base: [
			"badge", // DaisyUI badge base class
			"font-medium inline-flex items-center",
		],
		label: "truncate",
		leadingAvatar: "shrink-0",
		leadingAvatarSize: "",
		leadingIcon: "shrink-0",
		trailingIcon: "shrink-0",
	},
	variants: {
		color: Object.fromEntries(colors.map((color) => [color, `badge-${color}`])) as Record<
			UIColors,
			string
		>,
		fieldGroup: {
			horizontal:
				"not-only:first:rounded-e-none not-only:last:rounded-s-none not-last:not-first:rounded-none",
			vertical:
				"not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none",
		},
		size: {
			lg: {
				base: "badge-lg gap-1.5",
				leadingAvatarSize: "2xs",
				leadingIcon: "size-5",
				trailingIcon: "size-5",
			},
			md: {
				base: "badge-md gap-1",
				leadingAvatarSize: "3xs",
				leadingIcon: "size-4",
				trailingIcon: "size-4",
			},
			sm: {
				base: "badge-sm gap-1",
				leadingAvatarSize: "3xs",
				leadingIcon: "size-3",
				trailingIcon: "size-3",
			},
			xl: {
				base: "badge-xl gap-1.5",
				leadingAvatarSize: "2xs",
				leadingIcon: "size-6",
				trailingIcon: "size-6",
			},
			xs: {
				base: "badge-xs gap-1",
				leadingAvatarSize: "3xs",
				leadingIcon: "size-3",
				trailingIcon: "size-3",
			},
		},
		square: {
			true: "",
		},
		variant: {
			ghost: "badge-ghost",
			outline: "badge-outline",
		},
	},
};
