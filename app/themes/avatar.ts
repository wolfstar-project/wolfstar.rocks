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
			lg: {
				root: "size-12",
			},
			md: {
				root: "size-10",
			},
			sm: {
				root: "size-8",
			},
			xl: {
				root: "size-14",
			},
			xs: {
				root: "size-6",
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
