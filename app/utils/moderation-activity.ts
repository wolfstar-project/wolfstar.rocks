import { barY, defineChart, ruleY, text } from "@tanstack/charts";
import { scaleBand } from "@tanstack/charts/scales/band";
import { scaleLinear } from "@tanstack/charts/scales/linear";

export interface ModerationActivityDay {
	/** Local calendar day, `YYYY-MM-DD`. */
	key: string;
	/** Short weekday name in the requested locale. */
	label: string;
	count: number;
}

function dayKey(date: Date) {
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${date.getFullYear()}-${month}-${day}`;
}

/** Start of the local day `days - 1` days before `now`: the `from` of a `days`-day chart. */
export function moderationActivityStart(now: Date, days: number): Date {
	const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	start.setDate(start.getDate() - (days - 1));
	return start;
}

/**
 * Counts moderation entries per local calendar day for the last `days` days,
 * oldest first, ending with the day of `now`. Entries outside that window are
 * ignored, so a page of the log can be passed in as is.
 */
export function bucketModerationActivity(
	entries: readonly { createdAt: string | null }[],
	options: { days: number; locale?: string; now: Date },
): ModerationActivityDay[] {
	const { days, locale, now } = options;
	const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
	const start = moderationActivityStart(now, days);

	const buckets = Array.from({ length: days }, (_, index) => {
		const date = new Date(start);
		date.setDate(start.getDate() + index);
		return { count: 0, key: dayKey(date), label: formatter.format(date) };
	});
	const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));

	for (const entry of entries) {
		if (!entry.createdAt) {
			continue;
		}
		const created = new Date(entry.createdAt);
		if (Number.isNaN(created.getTime())) {
			continue;
		}
		const bucket = byKey.get(dayKey(created));
		if (bucket) {
			bucket.count += 1;
		}
	}

	return buckets;
}

/** The widest a bar of the chart gets, whatever the width of the card. */
const BAR_MAX_WIDTH = 44;

/** The bar of the busiest day is in the full colour, the others in a tint of it. */
export const ACTIVITY_BUSIEST_FILL = "var(--color-primary)";
export const ACTIVITY_QUIET_FILL =
	"color-mix(in srgb, var(--color-primary) 45%, var(--field-surface))";

/** The most moderation actions of one day in the window, `0` for a quiet week. */
function busiestModerationActivity(days: readonly ModerationActivityDay[]): number {
	return Math.max(0, ...days.map((day) => day.count));
}

/** The colour of the bar of a day: a quiet week highlights no day. */
export function moderationActivityFill(days: readonly ModerationActivityDay[]) {
	const busiest = busiestModerationActivity(days);
	return (day: ModerationActivityDay) =>
		busiest > 0 && day.count === busiest ? ACTIVITY_BUSIEST_FILL : ACTIVITY_QUIET_FILL;
}

/** The top of the y axis: room over the busiest bar for its count, and never `[0, 0]`. */
export function moderationActivityMax(days: readonly ModerationActivityDay[]): number {
	return Math.max(1, busiestModerationActivity(days) * 1.2);
}

/**
 * The chart of the overview, as the console mockup draws it, for `UChart`'s
 * `definition`: narrow bars with their count over them, the busiest day in the
 * full colour and the others in a tint of it, no y axis and no grid. `UChart`'s
 * own bar chart stretches each bar across its day and has no labels on bars.
 */
export function moderationActivityChart(
	days: readonly ModerationActivityDay[],
	formatCount: (value: number) => string,
) {
	return defineChart({
		marks: [
			barY(days, {
				x: "label",
				y: "count",
				fill: moderationActivityFill(days),
				maxThickness: BAR_MAX_WIDTH,
				radius: { end: 4 },
			}),
			text(days, {
				x: "label",
				y: "count",
				text: (day) => formatCount(day.count),
				dy: -8,
				fill: "var(--ui-text-toned)",
			}),
			ruleY([0]),
		],
		scales: {
			x: { scale: () => scaleBand().padding(0.2) },
			y: { scale: scaleLinear().domain([0, moderationActivityMax(days)]), axis: false },
		},
	});
}
