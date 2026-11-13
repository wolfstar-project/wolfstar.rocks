// The design system's toggle, modelled on Discord's: a grey track when off,
// green when on, and a white knob either way. 40×24 with a 16px knob.
export default {
	slots: {
		base: "data-[state=unchecked]:bg-(--ink-300) theme-light:data-[state=unchecked]:bg-(--field-border)",
		thumb: "bg-white shadow-[0_2px_4px_oklch(0%_0_0/0.3)]",
	},
	variants: {
		size: {
			md: {
				base: "w-10 border-4",
				container: "h-6",
				thumb: "size-4 data-[state=checked]:translate-x-4 data-[state=checked]:rtl:-translate-x-4",
			},
		},
	},
	defaultVariants: {
		color: "success",
	},
};
