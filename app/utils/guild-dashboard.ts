export type GuildErrorClass = "forbidden" | "unauthorized" | "default";

/**
 * Maps an HTTP status code from a guild dashboard fetch error to one of three
 * handled cases so the watcher in `dashboard.vue` can be tested without
 * mounting the full layout.
 */
export function classifyGuildError(status: number | undefined): GuildErrorClass {
	if (status === 403) return "forbidden";
	if (status === 401) return "unauthorized";
	return "default";
}

/**
 * Safely parses a raw JSON string of guild settings.  Falls back to
 * `fallback` when the string is malformed or when the parsed value is not a
 * plain object (e.g. an array or primitive).  The optional `onError` callback
 * is invoked with the caught error so callers can log it without coupling this
 * pure helper to any logging infrastructure.
 *
 * **Note:** the plain-object check uses `Object.getPrototypeOf(parsed) === Object.prototype`
 * intentionally — objects with null prototypes or non-plain class instances are rejected in
 * favour of the `fallback`, since guild settings are always plain JSON objects.
 */
export function parseGuildSettings(
	raw: string,
	fallback: Record<string, unknown>,
	onError?: (err: unknown) => void,
): Record<string, unknown> {
	try {
		const parsed: unknown = JSON.parse(raw);
		if (
			typeof parsed === "object" &&
			parsed !== null &&
			!Array.isArray(parsed) &&
			Object.getPrototypeOf(parsed) === Object.prototype
		) {
			return parsed as Record<string, unknown>;
		}
		return fallback;
	} catch (err) {
		onError?.(err);
		return fallback;
	}
}
