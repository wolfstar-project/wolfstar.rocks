// The design system's text field: the input surface with a hairline border,
// 6px corners and a 40px line, matching the selects next to it.
export default {
	slots: {
		base: "rounded-[6px] placeholder:text-muted",
	},
	variants: {
		size: {
			// The sizes of this component are plain class strings for its field.
			md: "h-10 text-sm",
		},
		variant: {
			outline: "bg-(--field-surface) text-highlighted ring-(--field-border)",
		},
	},
};
