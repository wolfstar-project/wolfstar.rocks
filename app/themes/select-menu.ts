import { selectVariants } from "./shared-variants";

export default {
	slots: {
		content:
			"max-h-60 w-(--reka-listbox-trigger-width) bg-base-100 shadow-lg rounded-md ring ring-base-300 overflow-hidden data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] origin-(--reka-listbox-content-transform-origin) pointer-events-auto",
		item: [
			"group relative w-full flex items-center gap-1.5 p-1.5 text-sm select-none outline-none before:absolute before:z-[-1] before:inset-px before:rounded-md data-disabled:cursor-not-allowed data-disabled:opacity-75 text-base-content data-highlighted:not-data-disabled:text-base-content data-highlighted:not-data-disabled:before:bg-base-200",
			"transition-colors before:transition-colors",
		],
		itemLabel: "truncate",
		itemLeadingIcon: [
			"shrink-0 text-base-content/50 group-data-highlighted:not-group-data-disabled:text-base-content",
			"transition-colors",
		],
		label: "font-semibold text-base-content",
		trailingIcon: "shrink-0 text-base-content/50",
	},
	variants: {
		variant: selectVariants,
	},
};
