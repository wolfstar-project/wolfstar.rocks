/**
 * Shared DaisyUI-aligned variant definitions for Nuxt UI form components.
 * These replace the default Nuxt UI utility-class based variants
 * (bg-default, bg-elevated, ring-accented) with explicit DaisyUI classes
 * (bg-base-100, bg-base-200, ring-base-300) to ensure color consistency.
 */

export const inputVariants = {
	outline: "text-highlighted bg-default ring ring-inset ring-accented",
	soft: "text-highlighted bg-elevated/50 hover:bg-elevated focus:bg-elevated disabled:bg-elevated/50",
	subtle: "text-highlighted bg-elevated ring ring-inset ring-accented",
	ghost: "text-highlighted bg-transparent hover:bg-elevated focus:bg-elevated disabled:bg-transparent dark:disabled:bg-transparent",
	none: "text-highlighted bg-transparent",
} as const;

export const selectVariants = {
	ghost: inputVariants.ghost,
	none: inputVariants.none,
	outline: `${inputVariants.outline} hover:bg-base-200 disabled:bg-base-100`,
	soft: inputVariants.soft,
	subtle: `${inputVariants.subtle} hover:bg-base-300/75 disabled:bg-base-200`,
} as const;
