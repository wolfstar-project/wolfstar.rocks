/**
 * Shared DaisyUI-aligned variant definitions for Nuxt UI form components.
 * These replace the default Nuxt UI utility-class based variants
 * (bg-default, bg-elevated, ring-accented) with explicit DaisyUI classes
 * (bg-base-100, bg-base-200, ring-base-300) to ensure color consistency.
 */

export const inputVariants = {
	ghost: "text-base-content bg-transparent hover:bg-base-200 focus:bg-base-200 disabled:bg-transparent dark:disabled:bg-transparent",
	none: "text-base-content bg-transparent",
	outline: "text-base-content bg-base-100 ring ring-inset ring-base-300",
	soft: "text-base-content bg-base-200/50 hover:bg-base-200 focus:bg-base-200 disabled:bg-base-200/50",
	subtle: "text-base-content bg-base-200 ring ring-inset ring-base-300",
} as const;

export const selectVariants = {
	ghost: inputVariants.ghost,
	none: inputVariants.none,
	outline: `${inputVariants.outline} hover:bg-base-200 disabled:bg-base-100`,
	soft: inputVariants.soft,
	subtle: `${inputVariants.subtle} hover:bg-base-300/75 disabled:bg-base-200`,
} as const;
