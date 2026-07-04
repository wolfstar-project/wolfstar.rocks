export function formatDateByLocale(locale: string, date: string | number | Date) {
	return new Date(date).toLocaleDateString(locale, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}
