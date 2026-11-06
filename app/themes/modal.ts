// The design system's dialog: a raised panel with 12px corners, a compact
// header whose close button is a small ghost icon, and an action bar on the
// rail's surface, darker than the panel, as the console draws it.
// The scrim behind it is black, as Discord's: Nuxt UI's grey one lightens a
// page that is darker than it (Onyx, Dark) instead of dimming it.
export default {
	slots: {
		overlay: "bg-(--scrim)",
		content: "divide-(--home-border-subtle) bg-(--popover-surface) ring-(--field-border)",
		// Only the body scrolls: a window shorter than the dialog must not squeeze
		// the header or the bar, which share its column.
		header: "min-h-0 shrink-0 px-5 pt-4 pb-3.5",
		title: "text-[1.0625rem] font-bold",
		description: "mt-0.5 text-[0.8125rem]",
		body: "px-5 py-4.5 sm:p-5",
		footer: "shrink-0 justify-end gap-2 bg-(--ink-800) px-5 py-3.5 theme-light:bg-(--discord-server)",
		close: "top-3 end-3",
	},
	variants: {
		fullscreen: {
			false: { content: "rounded-[12px] shadow-2xl" },
		},
	},
};
