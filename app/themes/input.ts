import { inputVariants } from "./shared-variants";

export default {
	slots: {
		leading: "absolute inset-y-0 start-0 flex items-center",
		leadingIcon: "shrink-0 text-base-content/50",
		root: "relative inline-flex items-center",
		trailing: "absolute inset-y-0 end-0 flex items-center",
		trailingIcon: "shrink-0 text-base-content/50",
	},
	variants: {
		variant: inputVariants,
	},
};
