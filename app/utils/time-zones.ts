import type { SelectOption } from "~/components/select/Base.vue";

/** The zone a server has until one is set, as the bot stores it. */
export const DEFAULT_TIME_ZONE = "UTC";

/**
 * The time zones this browser knows, by their IANA names. The server accepts
 * the zones of its own runtime, which the browsers this dashboard supports
 * list the same way; a stored zone the browser does not know is still shown.
 */
function knownTimeZones(): string[] {
	const zones = Intl.supportedValuesOf("timeZone").filter((zone) => zone !== DEFAULT_TIME_ZONE);
	return [DEFAULT_TIME_ZONE, ...zones];
}

/** The offset of `timeZone` from UTC at `now`, such as `GMT+2`, or `GMT` for none. */
export function timeZoneOffset(timeZone: string, now: Date): string {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone,
		timeZoneName: "shortOffset",
	}).formatToParts(now);
	const offset = parts.find((part) => part.type === "timeZoneName")?.value ?? "";
	// Some runtimes write no offset as `GMT+0`, others as `GMT`.
	return offset === "GMT+0" || offset === "GMT-0" ? "GMT" : offset;
}

/**
 * The time zone options of the server settings: UTC first, then every zone
 * under the region its name starts with, each with its current offset.
 */
export function timeZoneOptions(now: Date): SelectOption[] {
	return knownTimeZones().map((zone) => {
		const slash = zone.indexOf("/");
		return {
			group: slash === -1 ? undefined : zone.slice(0, slash),
			label: zone.replaceAll("_", " "),
			note: timeZoneOffset(zone, now),
			value: zone,
		};
	});
}

/**
 * The day and time it is in `timeZone` at `now`, such as "Wed 16:56", in the
 * dashboard's locale and hour cycle. `null` for a zone the browser cannot read.
 */
export function timeInZone(timeZone: string, now: Date, locale: string): string | null {
	try {
		return new Intl.DateTimeFormat(locale, {
			hour: "numeric",
			minute: "2-digit",
			timeZone,
			weekday: "short",
		}).format(now);
	} catch {
		return null;
	}
}
