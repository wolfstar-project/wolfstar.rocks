export default {
	slots: {
		center: "flex flex-col lg:grid grid-flow-col auto-cols-fr gap-8 xl:col-span-2",
		item: "relative",
		label: "text-sm font-semibold",
		left: "mb-10 xl:mb-0",
		link: "group text-sm flex items-center gap-1.5 focus-visible:outline-primary relative",
		linkLabel: "truncate pe-4",
		linkLabelExternalIcon: "size-3 absolute top-0.5 end-0 text-dimmed inline-block",
		linkLeadingIcon: "size-5 shrink-0",
		list: "mt-6 space-y-4",
		right: "mt-10 xl:mt-0",
		root: "xl:grid xl:grid-cols-3 xl:gap-8",
	},
	variants: {
		active: {
			false: {
				link: ["text-muted hover:text-default", "transition-colors"],
			},
			true: {
				link: "text-primary font-medium",
			},
		},
	},
};
