/* oxlint-disable no-console --- assertions spy on the parser's console.warn fallback */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Sentry trace-sample-rate configuration (plan 007).
 *
 * One environment variable — NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE — overrides
 * `public.sentry.tracesSampleRate` at run time, as whatever Nuxt parses it to,
 * so the reader accepts numbers and strings alike; the value must be a finite
 * number in [0, 1]. Zero is a valid explicit "no tracing" choice, so
 * truthiness-based parsing must never come back.
 */

describe("parseTracesSampleRate", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.spyOn(console, "warn").mockImplementation(() => undefined);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
	});

	async function loadParser() {
		const { parseTracesSampleRate } =
			await import("../../../../shared/utils/sentry-sample-rate");
		return parseTracesSampleRate;
	}

	it("defaults to 0.2 when the variable is absent", async () => {
		const parse = await loadParser();
		expect(parse(undefined)).toBe(0.2);
		expect(parse("")).toBe(0.2);
		expect(console.warn).not.toHaveBeenCalled();
	});

	it("accepts 0 as an explicit no-tracing value", async () => {
		const parse = await loadParser();
		expect(parse("0")).toBe(0);
		expect(console.warn).not.toHaveBeenCalled();
	});

	it("accepts 1 and fractional rates", async () => {
		const parse = await loadParser();
		expect(parse("1")).toBe(1);
		expect(parse("0.35")).toBe(0.35);
	});

	it("accepts the numbers Nuxt parses an env override into", async () => {
		const parse = await loadParser();
		expect(parse(0)).toBe(0);
		expect(parse(0.5)).toBe(0.5);
		expect(parse(null)).toBe(0.2);
		expect(console.warn).not.toHaveBeenCalled();
	});

	it("falls back with a warning for values of another type", async () => {
		const parse = await loadParser();
		expect(parse(true)).toBe(0.2);
		expect(console.warn).toHaveBeenCalled();
	});

	it("falls back with a warning for non-numeric input", async () => {
		const parse = await loadParser();
		expect(parse("not-a-number")).toBe(0.2);
		expect(console.warn).toHaveBeenCalledWith(
			expect.stringContaining("NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE"),
		);
	});

	it("falls back with a warning for negative values", async () => {
		const parse = await loadParser();
		expect(parse("-0.1")).toBe(0.2);
		expect(console.warn).toHaveBeenCalled();
	});

	it("falls back with a warning for values above 1", async () => {
		const parse = await loadParser();
		expect(parse("1.5")).toBe(0.2);
		expect(console.warn).toHaveBeenCalled();
	});

	it("falls back with a warning for non-finite values", async () => {
		const parse = await loadParser();
		expect(parse("Infinity")).toBe(0.2);
		expect(console.warn).toHaveBeenCalled();
	});
});
