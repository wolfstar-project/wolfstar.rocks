// The design system's dialog: a raised panel with 12px corners, a compact
// header whose close button is a small ghost icon, and a tinted action bar.
export default {
	slots: {
		content: "divide-(--home-border-subtle) bg-(--popover-surface) ring-(--field-border)",
		header: "min-h-0 px-5 pt-4 pb-3.5",
		title: "text-[1.0625rem] font-bold",
		description: "mt-0.5 text-[0.8125rem]",
		body: "px-5 py-4.5 sm:p-5",
		footer: "justify-end gap-2.5 bg-base-content/4 px-5 py-3.5",
		close: "top-3 end-3",
	},
	variants: {
		fullscreen: {
			false: { content: "rounded-[12px] shadow-2xl" },
		},
	},
};
