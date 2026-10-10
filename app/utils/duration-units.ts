export const DURATION_UNITS = ["seconds", "minutes", "hours", "days"] as const;
export type DurationUnit = (typeof DURATION_UNITS)[number];

const UNIT_MILLISECONDS: Record<DurationUnit, number> = {
	seconds: 1000,
	minutes: 60_000,
	hours: 3_600_000,
	days: 86_400_000,
};

export interface DurationParts {
	value: number;
	unit: DurationUnit;
}

/**
 * Splits milliseconds into the largest unit that holds them as a whole number,
 * so `3_600_000` reads as `1 hour` rather than `3600 seconds`.
 */
export function splitDuration(
	milliseconds: number,
	fallbackUnit: DurationUnit = "minutes",
): DurationParts {
	if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
		return { value: 0, unit: fallbackUnit };
	}

	for (const unit of DURATION_UNITS.toReversed()) {
		const size = UNIT_MILLISECONDS[unit];
		if (milliseconds % size === 0) {
			return { value: milliseconds / size, unit };
		}
	}

	// Not a whole number of seconds: keep the precision the smallest unit allows.
	return { value: Math.round(milliseconds / 1000), unit: "seconds" };
}

/** Joins a value and its unit back into milliseconds. */
export function joinDuration({ value, unit }: DurationParts): number {
	if (!Number.isFinite(value) || value <= 0) return 0;
	return Math.round(value * UNIT_MILLISECONDS[unit]);
}
