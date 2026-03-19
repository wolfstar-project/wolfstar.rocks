export default {
	compoundVariants: [
		// Neutral variants
		{
			class: `disabled:btn-disabled aria-disabled:btn-disabled`,
			color: "neutral",
		},
		{
			class: `disabled:btn-disabled aria-disabled:btn-disabled`,
			color: "neutral",
			variant: "outline",
		},
		{
			class: `disabled:btn-disabled aria-disabled:btn-disabled opacity-80`,
			color: "neutral",
			variant: "soft",
		},
		{
			class: `disabled:btn-disabled aria-disabled:btn-disabled`,
			color: "neutral",
			variant: "dash",
		},
		{
			class: `disabled:btn-disabled aria-disabled:btn-disabled`,
			color: "neutral",
			variant: "ghost",
		},
		{
			class: `disabled:btn-disabled aria-disabled:btn-disabled`,
			color: "neutral",
			variant: "link",
		},
		{
			class: `disabled:btn-disabled aria-disabled:btn-disabled`,
			color: "neutral",
		},
		{
			class: "btn-xs",
			size: "xs",
			square: true,
		},
		{
			class: "btn-sm",
			size: "sm",
			square: true,
		},
		{
			class: "btn-md",
			size: "md",
			square: true,
		},
		{
			class: "btn-lg",
			size: "lg",
			square: true,
		},
		{
			class: "btn-xl",
			size: "xl",
			square: true,
		},
		{
			class: {
				leadingIcon: "animate-spin",
			},
			leading: true,
			loading: true,
		},
		{
			class: {
				trailingIcon: "animate-spin",
			},
			leading: false,
			loading: true,
			trailing: true,
		},
	],
	defaultVariants: {
		size: "md",
		variant: "solid",
	},
	slots: {
		base: [
			"btn", // DaisyUI button base class
			//	'inline-flex items-center',
			//	'disabled:cursor-not-allowed aria-disabled:cursor-not-allowed',
			//	'disabled:opacity-75 aria-disabled:opacity-75'
		],
		label: "truncate",
		leadingAvatar: "shrink-0",
		leadingAvatarSize: "",
		leadingIcon: "shrink-0",
		trailingIcon: "shrink-0",
	},
	variants: {
		active: {
			false: {
				base: "",
			},
			true: {
				base: "btn-active",
			},
		},
		block: {
			true: "btn-block",
		},
		circle: {
			true: "btn-circle",
		},
		color: {
			accent: "btn-accent",
			error: "btn-error",
			info: "btn-info",
			neutral: "btn-neutral",
			primary: "btn-primary",
			secondary: "btn-secondary",
			success: "btn-success",
			warning: "btn-warning",
		},
		fieldGroup: {
			horizontal:
				"not-only:first:rounded-e-none not-only:last:rounded-s-none not-last:not-first:rounded-none",
			vertical:
				"not-only:first:rounded-b-none not-only:last:rounded-t-none not-last:not-first:rounded-none",
		},
		leading: {
			true: "",
		},
		loading: {
			true: "",
		},
		responsive: {
			true: {
				label: "hidden sm:inline",
			},
		},
		size: {
			lg: {
				base: "gap-2 btn-lg",
				leadingAvatarSize: "2xs",
				leadingIcon: "size-5",
				trailingIcon: "size-5",
			},
			md: {
				base: "gap-1.5 btn-md",
				leadingAvatarSize: "2xs",
				leadingIcon: "size-5",
				trailingIcon: "size-5",
			},
			sm: {
				base: "gap-1.5 btn-sm",
				leadingAvatarSize: "3xs",
				leadingIcon: "size-4",
				trailingIcon: "size-4",
			},
			xl: {
				base: "gap-2 btn-xl",
				leadingAvatarSize: "xs",
				leadingIcon: "size-6",
				trailingIcon: "size-6",
			},
			xs: {
				base: "gap-1 btn-xs",
				leadingAvatarSize: "3xs",
				leadingIcon: "size-4",
				trailingIcon: "size-4",
			},
		},
		square: {
			true: "btn-square",
		},
		trailing: {
			true: "",
		},
		variant: {
			dash: "btn-dash",
			ghost: "btn-ghost",
			link: "btn-link",
			outline: "btn-outline",
			soft: "btn-ghost",
			solid: "",
		},
	},
};
