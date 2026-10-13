// The design system's select: a 40px field on the input surface that opens a
// raised popover of 36px rows. The chosen row is tinted and carries the check.
export default {
	slots: {
		base: "rounded-[6px] data-[state=open]:ring-primary",
		placeholder: "text-muted",
		trailingIcon: "text-muted",
		content:
			"w-max max-w-85 min-w-[max(var(--reka-combobox-trigger-width),13.75rem)] rounded-[8px] bg-(--popover-surface) shadow-(--popover-shadow) ring-(--field-border)",
		group: "p-1",
		label: "px-2.5 pt-2 pb-1 text-[0.6875rem] font-bold tracking-[0.06em] text-muted uppercase",
		item: "min-h-9 items-center rounded-[5px] text-highlighted before:inset-0 before:rounded-[5px] data-highlighted:not-data-disabled:before:bg-base-content/6 data-[state=checked]:before:bg-primary/14 data-[state=checked]:data-highlighted:not-data-disabled:before:bg-primary/14",
		itemTrailing: "gap-2.5",
		itemTrailingIcon: "text-primary",
		empty: "px-2.5 py-3.5 text-start text-muted",
		// The search field sits in its own strip above the options.
		input: "border-b border-(--home-border-subtle) p-2 [&_[data-slot=leading]]:start-2 [&_input]:h-8.5 [&_input]:rounded-[6px] [&_input]:bg-(--field-surface) [&_input]:text-[0.8125rem] [&_input]:ring [&_input]:ring-(--field-border) [&_input]:ring-inset",
	},
	variants: {
		size: {
			sm: {
				base: "h-8 px-2.5 text-[0.8125rem]",
				item: "gap-2.5 px-2.5 py-1.5 text-sm",
				itemTrailingIcon: "size-4.5",
			},
			md: {
				base: "h-10 gap-2 px-3 text-sm",
				item: "gap-2.5 px-2.5 py-1.5 text-sm",
				itemTrailingIcon: "size-4.5",
				empty: "text-[0.8125rem]",
			},
		},
		variant: {
			outline: "bg-(--field-surface) text-highlighted ring-(--field-border)",
		},
	},
};
