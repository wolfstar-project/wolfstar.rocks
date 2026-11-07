// Menus open the same raised popover as the selects: 36px rows with 5px
// corners, a soft highlight, and hairlines between groups.
export default {
	slots: {
		content:
			"min-w-52 rounded-[8px] bg-(--popover-surface) shadow-(--popover-shadow) ring-(--field-border)",
		viewport: "divide-(--home-border-subtle)",
		group: "p-1",
		label: "px-2.5 py-2 text-sm",
		item: "min-h-9 items-center rounded-[5px] px-2.5 py-1.5 text-sm text-highlighted before:inset-0 before:rounded-[5px] data-highlighted:not-data-disabled:before:bg-base-content/6",
		itemLeadingIcon: "size-4.5 text-muted",
		itemTrailingIcon: "size-4.5 text-muted",
	},
};
