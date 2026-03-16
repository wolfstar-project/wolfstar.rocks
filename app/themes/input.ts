export default {
	slots: {
		leading: "absolute inset-y-0 start-0 flex items-center",
		leadingIcon: "shrink-0 text-base-content/50",
		root: "relative inline-flex items-center",
		trailing: "absolute inset-y-0 end-0 flex items-center",
		trailingIcon: "shrink-0 text-base-content/50",
	},
	variants: {
		variant: {
			ghost: "text-base-content bg-transparent hover:bg-base-200 focus:bg-base-200 disabled:bg-transparent dark:disabled:bg-transparent",
			none: "text-base-content bg-transparent",
			outline: "text-base-content bg-base-100 ring ring-inset ring-base-300",
			soft: "text-base-content bg-base-200/50 hover:bg-base-200 focus:bg-base-200 disabled:bg-base-200/50",
			subtle: "text-base-content bg-base-200 ring ring-inset ring-base-300",
		},
	},
};
