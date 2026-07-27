/** Matches `.discord-string-select-menu-scroll` max-height — used for flip decisions. */
export const STRING_SELECT_MENU_PANEL_MAX_HEIGHT = 190;

export type StringSelectMenuPlacement = "above" | "below";

/**
 * Prefer opening above the trigger (Discord action-row / near-composer behavior).
 * Flip below only when there is not enough room above and below has more space.
 * Zero-sized rects (unlaid-out / jsdom) stay above so tests and SSR stay stable.
 */
export function resolveStringSelectMenuPlacement(
	rect: Pick<DOMRectReadOnly, "top" | "bottom" | "height">,
	viewportHeight: number,
	panelMaxHeight = STRING_SELECT_MENU_PANEL_MAX_HEIGHT,
): StringSelectMenuPlacement {
	if (rect.height <= 0) return "above";
	const spaceAbove = rect.top;
	const spaceBelow = viewportHeight - rect.bottom;
	if (spaceAbove >= panelMaxHeight) return "above";
	if (spaceBelow >= panelMaxHeight && spaceBelow > spaceAbove) return "below";
	return "above";
}
