/** The share of transactions Sentry traces when nothing else is configured. */
export const DEFAULT_TRACES_SAMPLE_RATE = 0.2;

/**
 * Reads `public.sentry.tracesSampleRate` (`NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`)
 * as a finite number in [0, 1]. An env override reaches the runtime config as
 * whatever it parses to, so the value is checked where it is used. `0` is a
 * valid, intentional "no tracing" value — only an absent or invalid value falls
 * back to the default, with a warning so misconfiguration is visible instead of
 * silently changing telemetry spend.
 */
export function parseTracesSampleRate(raw: unknown): number {
	if (raw === undefined || raw === null || raw === "") {
		return DEFAULT_TRACES_SAMPLE_RATE;
	}
	const value =
		typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : Number.NaN;
	if (!Number.isFinite(value) || value < 0 || value > 1) {
		// oxlint-disable-next-line no-console --- runs while Sentry, the logger's sink, starts
		console.warn(
			`[runtimeConfig] Invalid NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE "${String(raw)}" — expected a number from 0 to 1; falling back to ${DEFAULT_TRACES_SAMPLE_RATE}`,
		);
		return DEFAULT_TRACES_SAMPLE_RATE;
	}
	return value;
}
