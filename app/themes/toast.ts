// A toast on the raised popover surface, without a progress bar. A message
// that is only a title is a pill; one with a description is a rounded card.
export default {
	slots: {
		// The alignment is set per case, with the variant that decides it: Nuxt UI's
		// vertical toast ends its class list with `items-start`, which a plain
		// `items-center` here would lose to, leaving a lone title at the top of a
		// pill that its close button, centred, makes taller.
		root: "gap-3 rounded-[14px] bg-(--popover-surface) px-4 py-3 shadow-(--popover-shadow) ring-(--field-border) not-has-[[data-slot=description]]:items-center not-has-[[data-slot=description]]:rounded-full has-[[data-slot=description]]:items-start",
		// A lone line reads as a message; a title over a description is a heading.
		title: "text-sm font-medium group-has-[[data-slot=description]]:font-semibold",
		description: "mt-0.5 text-[0.8125rem] leading-normal",
		icon: "size-5",
		progress: "hidden",
		// Smaller than a button, so a one-line pill is not taller than its text.
		close: "size-8 p-0 text-muted",
	},
};
