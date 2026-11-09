import type { H3Event } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface RuntimeConfigStub {
	public: { skewProtection?: { cookie: unknown } };
	app: { buildId?: string };
}

const { mockGetCookie, mockUseRuntimeConfig } = vi.hoisted(() => {
	const mockGetCookie = vi.fn<(event: unknown, name: string) => string | undefined>();
	const mockUseRuntimeConfig = vi.fn<(event: unknown) => RuntimeConfigStub>();

	const g = globalThis as Record<string, unknown>;
	g.getCookie = mockGetCookie;
	g.useRuntimeConfig = mockUseRuntimeConfig;

	return { mockGetCookie, mockUseRuntimeConfig };
});

const { isClientOutdated } = await import("#server/utils/client-version");

const event = {} as H3Event;

function configure(config: Partial<RuntimeConfigStub["public"]>, buildId: string | undefined) {
	mockUseRuntimeConfig.mockReturnValue({ public: config, app: { buildId } });
}

describe("isClientOutdated", () => {
	beforeEach(() => {
		mockGetCookie.mockReset();
		mockUseRuntimeConfig.mockReset();
	});

	it("is false when skew protection publishes no cookie", () => {
		configure({}, "build-2");
		mockGetCookie.mockReturnValue("build-1");

		expect(isClientOutdated(event)).toBe(false);
		expect(mockGetCookie).not.toHaveBeenCalled();
	});

	it("is false when the module is switched off", () => {
		configure({ skewProtection: { cookie: false } }, "build-2");
		mockGetCookie.mockReturnValue("build-1");

		expect(isClientOutdated(event)).toBe(false);
		expect(mockGetCookie).not.toHaveBeenCalled();
	});

	it("is false when the browser sent no version cookie", () => {
		configure({ skewProtection: { cookie: {} } }, "build-2");
		mockGetCookie.mockReturnValue(undefined);

		expect(isClientOutdated(event)).toBe(false);
	});

	it("is false when the cookie matches the serving build", () => {
		configure({ skewProtection: { cookie: {} } }, "build-2");
		mockGetCookie.mockReturnValue("build-2");

		expect(isClientOutdated(event)).toBe(false);
	});

	it("is true when the cookie names an older build", () => {
		configure({ skewProtection: { cookie: {} } }, "build-2");
		mockGetCookie.mockReturnValue("build-1");

		expect(isClientOutdated(event)).toBe(true);
	});

	it("is false when the server has no build id to compare against", () => {
		configure({ skewProtection: { cookie: {} } }, undefined);
		mockGetCookie.mockReturnValue("build-1");

		expect(isClientOutdated(event)).toBe(false);
	});

	it("reads the cookie under the name the module publishes", () => {
		configure({ skewProtection: { cookie: { name: "__custom" } } }, "build-2");
		mockGetCookie.mockReturnValue("build-1");

		expect(isClientOutdated(event)).toBe(true);
		expect(mockGetCookie).toHaveBeenCalledWith(event, "__custom");
	});

	it("falls back to the module's default cookie name", () => {
		configure({ skewProtection: { cookie: {} } }, "build-2");
		mockGetCookie.mockReturnValue("build-2");

		isClientOutdated(event);

		expect(mockGetCookie).toHaveBeenCalledWith(event, "__nkpv");
	});
});
