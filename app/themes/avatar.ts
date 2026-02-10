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
		root: "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-base-200 align-middle select-none",
	},
	variants: {
		shape: {
			circle: "mask mask-circle",
			square: "mask mask-squircle",
		},
		size: {
			lg: "h-24 w-24",
			md: "h-16 w-16",
			sm: "h-10 w-10",
			xl: "h-32 w-32",
			xs: "h-8 w-8",
		},
		status: {
			offline: "avatar-offline",
			online: "avatar-online",
		},
	},
};
