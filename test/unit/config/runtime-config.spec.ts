/* oxlint-disable no-console --- assertions spy on the parser's console.warn fallback */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Sentry trace-sample-rate configuration (plan 007).
 *
 * One environment variable — NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE — is
 * checked AND read; the value must be a finite number in [0, 1]. Zero is a
 * valid explicit "no tracing" choice, so truthiness-based parsing must never
 * come back.
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
		const { parseTracesSampleRate } = await import("#server/utils/runtimeConfig");
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

describe("generateRuntimeConfig sentry sampling", () => {
	beforeEach(() => {
		vi.resetModules();
		vi.spyOn(console, "warn").mockImplementation(() => undefined);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.restoreAllMocks();
	});

	it("reads the documented variable into public.sentry.tracesSampleRate", async () => {
		vi.stubEnv("NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE", "0.5");
		const { generateRuntimeConfig } = await import("#server/utils/runtimeConfig");
		expect(generateRuntimeConfig().public.sentry.tracesSampleRate).toBe(0.5);
	});

	it("honors an explicit zero rate", async () => {
		vi.stubEnv("NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE", "0");
		const { generateRuntimeConfig } = await import("#server/utils/runtimeConfig");
		expect(generateRuntimeConfig().public.sentry.tracesSampleRate).toBe(0);
	});

	it("uses the default when the variable is unset", async () => {
		vi.stubEnv("NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE", undefined);
		const { generateRuntimeConfig } = await import("#server/utils/runtimeConfig");
		expect(generateRuntimeConfig().public.sentry.tracesSampleRate).toBe(0.2);
	});
});

describe("generateRuntimeConfig apiBaseUrl", () => {
	beforeEach(() => {
		vi.resetModules();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("pins Storybook to the local bot mock origin", async () => {
		vi.stubEnv("STORYBOOK", "true");
		vi.stubEnv("NUXT_PUBLIC_API_BASE_URL", "https://api.wolfstar.rocks");
		const { generateRuntimeConfig } = await import("#server/utils/runtimeConfig");
		expect(generateRuntimeConfig().public.apiBaseUrl).toBe("http://localhost:8282");
	});

	it("defaults test builds to the local bot mock origin when unset", async () => {
		vi.stubEnv("STORYBOOK", undefined);
		vi.stubEnv("VITEST_STORYBOOK", undefined);
		vi.stubEnv("NUXT_PUBLIC_API_BASE_URL", undefined);
		vi.stubEnv("NODE_ENV", "test");
		const { generateRuntimeConfig } = await import("#server/utils/runtimeConfig");
		expect(generateRuntimeConfig().public.apiBaseUrl).toBe("http://localhost:8282");
	});

	it("honors an explicit NUXT_PUBLIC_API_BASE_URL outside Storybook", async () => {
		vi.stubEnv("STORYBOOK", undefined);
		vi.stubEnv("VITEST_STORYBOOK", undefined);
		vi.stubEnv("NUXT_PUBLIC_API_BASE_URL", "https://api.wolfstar.rocks");
		const { generateRuntimeConfig } = await import("#server/utils/runtimeConfig");
		expect(generateRuntimeConfig().public.apiBaseUrl).toBe("https://api.wolfstar.rocks");
	});
});
