export default {
	compoundVariants: [
		{
			class: {
				base: "data-[state=open]:animate-[slide-in-from-top_200ms_ease-in-out]",
			},
			position: ["top-left", "top-center", "top-right"],
		},
		{
			class: {
				base: "data-[state=open]:animate-[slide-in-from-bottom_200ms_ease-in-out]",
			},
			position: ["bottom-left", "bottom-center", "bottom-right"],
		},
		{
			class: "data-[swipe=move]:translate-x-[var(--reka-toast-swipe-move-x)] data-[swipe=end]:translate-x-[var(--reka-toast-swipe-end-x)] data-[swipe=cancel]:translate-x-0",
			swipeDirection: ["left", "right"],
		},
		{
			class: "data-[swipe=move]:translate-y-[var(--reka-toast-swipe-move-y)] data-[swipe=end]:translate-y-[var(--reka-toast-swipe-end-y)] data-[swipe=cancel]:translate-y-0",
			swipeDirection: ["up", "down"],
		},
	],
	defaultVariants: {
		position: "bottom-right",
	},
	slots: {
		base: "toast-item transition-all duration-200 ease-out",
		viewport: "toast z-50",
	},
	variants: {
		position: {
			"bottom-center": {
				viewport: "toast-center",
			},
			"bottom-left": {
				viewport: "toast-start",
			},
			"bottom-right": {
				viewport: "toast-end",
			},
			"top-center": {
				viewport: "toast-top toast-center",
			},
			"top-left": {
				viewport: "toast-top toast-start",
			},
			"top-right": {
				viewport: "toast-top toast-end",
			},
		},
		swipeDirection: {
			down: "data-[swipe=end]:animate-[slide-out-to-bottom_200ms_ease-out]",
			left: "data-[swipe=end]:animate-[slide-out-to-left_200ms_ease-out]",
			right: "data-[swipe=end]:animate-[slide-out-to-right_200ms_ease-out]",
			up: "data-[swipe=end]:animate-[slide-out-to-top_200ms_ease-out]",
		},
	},
};
