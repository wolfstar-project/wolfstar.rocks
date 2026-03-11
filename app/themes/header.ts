export default {
	slots: {
		body: "p-4 sm:p-6 overflow-y-auto",
		center: "hidden lg:flex",
		container: "flex items-center justify-between gap-3 h-full",
		content: "lg:hidden nav-panel-glass",
		header: "px-4 sm:px-6 h-(--ui-header-height) shrink-0 flex items-center justify-between gap-3",
		left: "lg:flex-1 flex items-center gap-1.5",
		overlay: "lg:hidden",
		right: "flex items-center justify-end lg:flex-1 gap-1.5",
		root: "border-b border-transparent h-(--ui-header-height) bg-transparent navbar sticky top-2 z-50 rounded-xl drop-shadow-lg",
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
