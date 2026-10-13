// The design system's text field: the input surface with a hairline border,
// 6px corners and a 40px line, matching the selects next to it.
export default {
	slots: {
		base: "rounded-[6px] placeholder:text-muted",
	},
	variants: {
		size: {
			md: { base: "min-h-10 px-2 py-1.5 text-sm" },
		},
		variant: {
			outline: "bg-(--field-surface) text-highlighted ring-(--field-border)",
		},
	},
};
