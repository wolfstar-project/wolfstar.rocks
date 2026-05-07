export default {
	slots: {
		body: "p-4 sm:p-6 overflow-y-auto",
		center: "hidden lg:flex",
		container:
			"rounded-full px-5 py-2 flex items-center gap-3 w-fit pointer-events-auto backdrop-blur-md border border-white/10 drop-shadow-sm",
		content: "lg:hidden nav-panel-glass pointer-events-auto",
		header: "p-4 sm:p-6 flex items-center justify-between",
		left: "flex items-center gap-1.5",
		overlay: "lg:hidden pointer-events-auto",
		right: "flex items-center gap-1.5",
		root: "sticky top-3 z-50 w-full bg-transparent border-none flex justify-center px-4 pointer-events-none",
		title: "shrink-0 font-bold text-xl text-highlighted flex items-end gap-1.5",
		toggle: "lg:hidden",
	},
	variants: {
		toggleSide: {
			left: {
				toggle: "-ms-1.5",
			},
			right: {
				toggle: "-me-1.5",
			},
		},
	},
};
