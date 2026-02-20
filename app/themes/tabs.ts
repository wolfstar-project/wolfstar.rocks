import { colors } from "@/utils/constants";

export default {
	compoundVariants: [
		...((colors || []).map((color: string) => [
			{
				class: {
					indicator: `bg-${color}`,
					trigger: `data-[state=active]:text-neutral data-[state=active]:tab-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-${color} `,
				},
				color,
				variant: "pill",
			},
			{
				class: {
					indicator: `bg-${color}`,
					trigger: `data-[state=active]:text-${color} data-[state=active]:tab-active focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-${color} `,
				},
				color,
				variant: "link",
			},
			{
				class: {
					indicator: `bg-${color}`,
					trigger: `data-[state=active]:text-highlighted data-[state=active]:tab-active focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-${color} `,
				},
				color,
				variant: "box",
			},
			{
				class: {
					indicator: `bg-${color}`,
					list: "border-b",
					trigger: `data-[state=active]:text-highlighted data-[state=active]:tab-active focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-${color} `,
				},
				color,
				variant: "border",
			},
			{
				class: {
					indicator: `bg-${color}`,
					trigger: `data-[state=active]:text-highlighted data-[state=active]:tab-active focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-${color} `,
				},
				color,
				variant: "transparent",
			},
		]) as any),
		{
			class: {
				indicator: "inset-y-1",
			},
			orientation: "horizontal",
			variant: "pill",
		},
		{
			class: {
				indicator: "-bottom-px h-px",
				list: "border-b -mb-px",
			},
			orientation: "horizontal",
			variant: "link",
		},
		{
			class: {
				indicator: "inset-x-1",
				list: "items-center",
			},
			orientation: "vertical",
			variant: "pill",
		},
		{
			class: {
				indicator: "-start-px w-px",
				list: "border-s -ms-px",
			},
			orientation: "vertical",
			variant: "link",
		},
		{
			class: {
				indicator: "bg-primary",
				trigger:
					"data-[state=active]:text-inverted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
			},
			color: "primary",
			variant: "pill",
		},
		{
			class: {
				indicator: "bg-inverted",
				trigger:
					"data-[state=active]:text-inverted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inverted",
			},
			color: "neutral",
			variant: "pill",
		},
		{
			class: {
				indicator: "bg-primary",
				trigger:
					"data-[state=active]:text-primary focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
			},
			color: "primary",
			variant: "link",
		},
		{
			class: {
				indicator: "bg-inverted",
				trigger:
					"data-[state=active]:text-highlighted focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-inverted",
			},
			color: "neutral",
			variant: "link",
		},
		{
			class: {
				indicator: "bg-neutral",
				trigger:
					"data-[state=active]:text-highlighted data-[state=active]:tab-active focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral ",
			},
			color: "neutral",
			variant: "box",
		},
		{
			class: {
				indicator: "bg-neutral",
				trigger:
					"data-[state=active]:text-neutral data-[state=active]:tab-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral ",
			},
			color: "neutral",
			variant: "box",
		},
		{
			class: {
				indicator: "bg-neutral",
				list: "border-b",
				trigger:
					"data-[state=active]:text-highlighted data-[state=active]:tab-active focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neutral ",
			},
			color: "neutral",
			variant: "border",
		},
	],
	defaultVariants: {
		color: "primary",
		size: "md",
		variant: "box",
	},
	slots: {
		content: "focus:outline-none w-full",
		indicator: "absolute transition-[translate,width] duration-200",
		label: "truncate",
		leadingAvatar: "shrink-0",
		leadingAvatarSize: "",
		leadingIcon: "shrink-0",
		list: "relative flex p-1 group",
		root: "tabs flex items-center gap-2",
		trailingBadge: "shrink-0",
		trailingBadgeSize: "sm",
		trigger: [
			"tab group relative inline-flex items-center min-w-0 data-[state=inactive]:text-muted hover:data-[state=inactive]:not-disabled:text-default font-medium rounded-md disabled:cursor-not-allowed disabled:tab-disabled",
			"transition-colors",
		],
	},
	variants: {
		active: {
			false: {
				root: "",
			},
			true: {
				root: "tab-active",
			},
		},
		color: {
			...Object.fromEntries((colors || []).map((color: string) => [color, ""])),
			neutral: "",
		},
		orientation: {
			horizontal: {
				indicator:
					"left-0 w-(--reka-tabs-indicator-size) translate-x-(--reka-tabs-indicator-position)",
				list: "w-full justify-center",
				root: "flex-col",
				trigger: "justify-center",
			},
			vertical: {
				indicator:
					"top-0 h-(--reka-tabs-indicator-size) translate-y-(--reka-tabs-indicator-position)",
				list: "flex-col",
			},
		},
		responsive: {
			true: {
				label: "hidden sm:inline",
			},
		},
		size: {
			lg: {
				leadingAvatarSize: "2xs",
				leadingIcon: "size-5",
				trigger: "px-3 py-2 text-sm gap-2",
			},
			md: {
				leadingAvatarSize: "2xs",
				leadingIcon: "size-5",
				trigger: "px-3 py-1.5 text-sm gap-1.5",
			},
			sm: {
				leadingAvatarSize: "3xs",
				leadingIcon: "size-4",
				trigger: "px-2.5 py-1.5 text-xs gap-1.5",
			},
			xl: {
				leadingAvatarSize: "xs",
				leadingIcon: "size-6",
				trigger: "px-3 py-2 text-base gap-2",
			},
			xs: {
				leadingAvatarSize: "3xs",
				leadingIcon: "size-4",
				trigger: "px-2 py-1 text-xs gap-1",
			},
		},
		variant: {
			border: {
				trigger: "tabs-border",
			},
			box: {
				trigger: "tabs-box",
			},
			lift: {
				trigger: "tabs-lift",
			},
			link: {
				indicator: "rounded-full",
				list: "border-default",
				trigger: "focus:outline-none",
			},
			pill: {
				indicator: "rounded-md shadow-xs",
				list: "bg-elevated rounded-lg",
				trigger: "grow",
			},
			transparent: {
				root: "",
				trigger: "",
			},
		},
	},
};
