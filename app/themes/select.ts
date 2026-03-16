export default {
	slots: {
		trailingIcon: "shrink-0 text-base-content/50",
	},
	variants: {
		variant: {
			ghost: "text-base-content bg-transparent hover:bg-base-200 focus:bg-base-200 disabled:bg-transparent dark:disabled:bg-transparent",
			none: "text-base-content bg-transparent",
			outline:
				"text-base-content bg-base-100 ring ring-inset ring-base-300 hover:bg-base-200 disabled:bg-base-100",
			soft: "text-base-content bg-base-200/50 hover:bg-base-200 focus:bg-base-200 disabled:bg-base-200/50",
			subtle: "text-base-content bg-base-200 ring ring-inset ring-base-300 hover:bg-base-300/75 disabled:bg-base-200",
		},
	},
};
