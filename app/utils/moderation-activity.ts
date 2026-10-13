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
