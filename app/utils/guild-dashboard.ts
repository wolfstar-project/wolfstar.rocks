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
 * `fallback` when the string is malformed.  The optional `onError` callback
 * is invoked with the caught error so callers can log it without coupling this
 * pure helper to any logging infrastructure.
 */
export function parseGuildSettings(
	raw: string,
	fallback: Record<string, unknown>,
	onError?: (err: unknown) => void,
): Record<string, unknown> {
	try {
		return JSON.parse(raw) as Record<string, unknown>;
	} catch (err) {
		onError?.(err);
		return fallback;
	}
}
