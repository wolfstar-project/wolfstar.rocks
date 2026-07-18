export function formatDateByLocale(locale: string, date: string | number | Date) {
	// Pin the calendar day to UTC so the server (UTC host) and the client
	// (any local time zone) render the same date. Without this, a timestamp
	// near UTC midnight formats as a different day during hydration in
	// western time zones, causing a hydration mismatch.
	return new Date(date).toLocaleDateString(locale, {
		year: "numeric",
		month: "long",
		day: "numeric",
		timeZone: "UTC",
	});
}
