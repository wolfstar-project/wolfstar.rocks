export default {
	compoundVariants: [
		{
			class: {
				childList: "grid-cols-2 gap-2",
			},
			contentOrientation: "horizontal",
			orientation: "horizontal",
		},
		{
			class: {
				childList: "gap-1",
				content: "w-60 animate-fade-in",
			},
			contentOrientation: "vertical",
			orientation: "horizontal",
		},
		{
			class: {
				childItem: "ps-1.5 -ms-px animate-fade-in-delay-1",
				childList: "ms-5 border-s border-default",
				content:
					"data-[state=open]:animate-[collapsible-down_200ms_ease-out] data-[state=closed]:animate-[collapsible-up_200ms_ease-out] overflow-hidden bg-base-200/60 backdrop-blur-sm",
			},
			collapsed: false,
			orientation: "vertical",
		},
		{
			class: {
				content: "shadow-sm rounded-sm min-h-6 p-1 bg-base-200/60 backdrop-blur-sm",
				link: "px-1.5",
			},
			collapsed: true,
			orientation: "vertical",
		},
		{
			class: {
				link: [
					"after:absolute after:-bottom-2 after:inset-x-2.5 after:block after:h-px after:rounded-full",
					"after:transition-all after:duration-300",
				],
			},
			highlight: true,
			orientation: "horizontal",
		},
		{
			class: {
				link: [
					"after:absolute after:-start-1.5 after:inset-y-0.5 after:block after:w-px after:rounded-full",
					"after:transition-all after:duration-300",
				],
			},
			highlight: true,
			level: true,
			orientation: "vertical",
		},
		{
			active: false,
			class: {
				link: ["hover:text-highlighted hover:before:bg-elevated/50", "transition-all duration-300 before:transition-all hover-scale"],
				linkLeadingIcon: ["group-hover:text-default group-hover:scale-110", "transition-all duration-200"],
			},
			disabled: false,
			variant: "pill",
		},
		{
			active: false,
			class: {
				link: "data-[state=open]:text-highlighted data-[state=open]:before:bg-elevated/50",
				linkLeadingIcon: "group-data-[state=open]:text-default group-data-[state=open]:scale-110",
			},
			disabled: false,
			orientation: "horizontal",
			variant: "pill",
		},
		{
			class: {
				link: "data-[state=open]:before:bg-elevated/50 data-[state=open]:shadow-lg",
			},
			disabled: false,
			highlight: true,
			orientation: "horizontal",
			variant: "pill",
		},
		{
			active: false,
			class: {
				link: "data-[state=open]:before:bg-elevated/50",
			},
			disabled: false,
			highlight: false,
			orientation: "horizontal",
			variant: "pill",
		},
		{
			active: true,
			class: {
				link: "text-primary relative",
				linkLeadingIcon: "text-primary group-data-[state=open]:text-primary scale-110",
			},
			color: "primary",
			variant: "pill",
		},
		{
			active: true,
			class: {
				link: "text-highlighted relative",
				linkLeadingIcon: "text-highlighted group-data-[state=open]:text-highlighted scale-110",
			},
			color: "neutral",
			variant: "pill",
		},
		{
			active: true,
			class: {
				link: "before:bg-elevated shadow-md",
			},
			highlight: false,
			variant: "pill",
		},
		{
			active: true,
			class: {
				link: ["hover:before:bg-elevated/50 hover:shadow-lg", "before:transition-all duration-300"],
			},
			disabled: false,
			highlight: true,
			variant: "pill",
		},
		{
			active: false,
			class: {
				link: ["hover:text-highlighted", "transition-all duration-300"],
				linkLeadingIcon: ["group-hover:text-default group-hover:scale-110", "transition-all duration-200"],
			},
			disabled: false,
			variant: "link",
		},
		{
			active: false,
			class: {
				link: "data-[state=open]:text-highlighted",
				linkLeadingIcon: "group-data-[state=open]:text-default group-data-[state=open]:scale-110",
			},
			disabled: false,
			orientation: "horizontal",
			variant: "link",
		},
		{
			active: true,
			class: {
				link: "text-primary relative",
				linkLeadingIcon: "text-primary group-data-[state=open]:text-primary scale-110",
			},
			color: "primary",
			variant: "link",
		},
		{
			active: true,
			class: {
				link: "text-highlighted relative",
				linkLeadingIcon: "text-highlighted group-data-[state=open]:text-highlighted scale-110",
			},
			color: "neutral",
			variant: "link",
		},
		{
			active: true,
			class: {
				link: "after:bg-primary after:shadow-[0_0_8px_rgba(var(--color-primary),0.5)]",
			},
			highlight: true,
			highlightColor: "primary",
			level: true,
		},
		{
			active: true,
			class: {
				link: "after:bg-inverted after:shadow-[0_0_8px_rgba(0,0,0,0.3)]",
			},
			highlight: true,
			highlightColor: "neutral",
			level: true,
		},
	],
	defaultVariants: {
		color: "primary",
		highlightColor: "primary",
		variant: "pill",
	},
	slots: {
		arrow: "relative top-[50%] size-2.5 rotate-45 border border-default bg-default z-[1] rounded-xs",
		childItem: "animate-fade-in-up",
		childLabel: "text-xs text-highlighted animate-fade-in",
		childLink:
			"group relative size-full flex items-start text-start text-sm before:absolute before:z-[-1] before:rounded-md focus:outline-none focus-visible:outline-none dark:focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-2 transition-all duration-300",
		childLinkDescription: "text-muted transition-colors duration-200",
		childLinkIcon: "size-5 shrink-0 transition-colors duration-200",
		childLinkLabel: "truncate",
		childLinkLabelExternalIcon: "inline-block size-3 align-top text-dimmed",
		childLinkWrapper: "min-w-0",
		childList: "isolate",
		content: "animate-fade-in bg-base-200/60 backdrop-blur-sm",
		indicator:
			"absolute data-[state=visible]:animate-[fade-in_100ms_ease-out] data-[state=hidden]:animate-[fade-out_100ms_ease-in] data-[state=hidden]:opacity-0 bottom-0 z-[2] w-(--reka-navigation-menu-indicator-size) translate-x-(--reka-navigation-menu-indicator-position) flex h-2.5 items-end justify-center overflow-hidden transition-[translate,width] duration-200",
		item: "min-w-0 animate-fade-in-up",
		label: "w-full flex items-center gap-1.5 font-semibold text-xs/5 text-highlighted px-2.5 py-1.5 animate-fade-in",
		link: "group relative w-full flex items-center gap-1.5 font-medium text-sm before:absolute before:z-[-1] before:rounded-md focus:outline-none focus-visible:outline-none dark:focus-visible:outline-none focus-visible:before:ring-inset focus-visible:before:ring-2 transition-all duration-300",
		linkLabel: "truncate",
		linkLabelExternalIcon: "inline-block size-3 align-top text-dimmed",
		linkLeadingAvatar: "shrink-0",
		linkLeadingAvatarSize: "2xs",
		linkLeadingIcon: "shrink-0 size-5 transition-transform duration-200",
		linkTrailing: "group ms-auto inline-flex gap-1.5 items-center",
		linkTrailingBadge: "shrink-0",
		linkTrailingBadgeSize: "sm",
		linkTrailingIcon: "size-5 transform shrink-0 group-data-[state=open]:rotate-180 transition-transform duration-200",
		list: "isolate min-w-0",
		root: "relative flex gap-1.5 [&>div]:min-w-0",
		separator: "px-2 h-px bg-border",
		viewport:
			"relative overflow-hidden bg-base-200/60 backdrop-blur-sm shadow-lg rounded-md ring ring-default h-(--reka-navigation-menu-viewport-height) w-full transition-[width,height,left] duration-200 origin-[top_center] data-[state=open]:animate-[scale-in_100ms_ease-out] data-[state=closed]:animate-[scale-out_100ms_ease-in] z-[1]",
		viewportWrapper: "absolute top-full left-0 flex w-full",
	},
	variants: {
		active: {
			false: {
				childLink: [
					"hover:before:bg-elevated/50 text-default hover:text-highlighted hover-scale",
					"transition-all duration-300 before:transition-all",
				],
				childLinkIcon: ["text-dimmed group-hover:text-default group-hover:scale-110", "transition-all duration-200"],
				link: "text-muted",
				linkLeadingIcon: "text-dimmed",
			},
			true: {
				childLink: "before:bg-elevated text-highlighted hover-lift",
				childLinkIcon: "text-default",
			},
		},
		collapsed: {
			true: "",
		},
		color: {
			error: {
				childLink: "focus-visible:before:ring-error",
				link: "focus-visible:before:ring-error",
			},
			info: {
				childLink: "focus-visible:before:ring-info",
				link: "focus-visible:before:ring-info",
			},
			neutral: {
				childLink: "focus-visible:before:ring-inverted",
				link: "focus-visible:before:ring-inverted",
			},
			primary: {
				childLink: "focus-visible:before:ring-primary",
				link: "focus-visible:before:ring-primary",
			},
			secondary: {
				childLink: "focus-visible:before:ring-secondary",
				link: "focus-visible:before:ring-secondary",
			},
			success: {
				childLink: "focus-visible:before:ring-success",
				link: "focus-visible:before:ring-success",
			},
			warning: {
				childLink: "focus-visible:before:ring-warning",
				link: "focus-visible:before:ring-warning",
			},
		},
		contentOrientation: {
			horizontal: {
				content:
					"data-[motion=from-start]:animate-[enter-from-left_200ms_ease] data-[motion=from-end]:animate-[enter-from-right_200ms_ease] data-[motion=to-start]:animate-[exit-to-left_200ms_ease] data-[motion=to-end]:animate-[exit-to-right_200ms_ease]",
				viewportWrapper: "justify-center",
			},
			vertical: {
				viewport: "sm:w-(--reka-navigation-menu-viewport-width) left-(--reka-navigation-menu-viewport-left)",
			},
		},
		disabled: {
			true: {
				link: "cursor-not-allowed opacity-75",
			},
		},
		highlight: {
			true: "",
		},
		highlightColor: {
			error: "",
			info: "",
			neutral: "",
			primary: "",
			secondary: "",
			success: "",
			warning: "",
		},
		level: {
			true: "",
		},
		orientation: {
			horizontal: {
				childLink: "px-3 py-2 gap-2 before:inset-x-px before:inset-y-0",
				childLinkLabel: "font-medium",
				childList: "grid p-2",
				content: "absolute top-0 left-0 w-full max-h-[70vh] overflow-y-auto",
				item: "py-2 animate-fade-in-up",
				link: "px-2.5 py-1.5 before:inset-x-px before:inset-y-0",
				list: "flex items-center",
				root: "items-center justify-between",
			},
			vertical: {
				childLabel: "px-1.5 py-0.5",
				childLink: "p-1.5 gap-1.5 before:inset-y-px before:inset-x-0",
				link: "flex-row px-2.5 py-1.5 before:inset-y-px before:inset-x-0",
				root: "flex-col",
			},
		},
		variant: {
			link: "",
			pill: "",
		},
	},
};
