export default {
	base: "avatar",
	defaultVariants: {
		shape: "circle",
		size: "md",
	},
	slots: {
		fallback: "avatar-placeholder truncate leading-none font-medium text-base-content",
		icon: "shrink-0 text-base-content",
		image: "h-full w-full rounded-[inherit] object-cover",
		root: "avatar inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-base-200 align-middle select-none",
	},
	variants: {
		shape: {
			circle: {
				root: "mask mask-circle",
			},
			square: {
				root: "mask mask-squircle",
			},
		},
		size: {
			"3xs": {
				root: "size-4 text-[8px]",
			},
			"2xs": {
				root: "size-5 text-[10px]",
			},
			"xs": {
				root: "size-6 text-xs",
			},
			"sm": {
				root: "size-7 text-sm",
			},
			"md": {
				root: "size-8 text-base",
			},
			"lg": {
				root: "size-9 text-lg",
			},
			"xl": {
				root: "size-10 text-xl",
			},
			"2xl": {
				root: "size-11 text-[22px]",
			},
			"3xl": {
				root: "size-12 text-2xl",
			},
		},
		status: {
			offline: {
				root: "avatar-offline",
			},
			online: {
				root: "avatar-online",
			},
		},
	},
};
