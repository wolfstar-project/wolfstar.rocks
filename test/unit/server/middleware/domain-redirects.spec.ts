import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Recreates the domain redirects that used to live in netlify.toml
 * (see server/middleware/domain-redirects.ts). Follows the same
 * globalThis-stubbing pattern as wrapped-event-handler-cache.spec.ts since
 * defineEventHandler/getRequestHost/getRequestURL/sendRedirect are Nitro
 * auto-imports, not real module exports, outside the Nuxt runtime.
 */
const { mockGetRequestHost, mockGetRequestURL, mockSendRedirect } = vi.hoisted(() => {
	const mockGetRequestHost = vi.fn();
	const mockGetRequestURL = vi.fn();
	const mockSendRedirect = vi.fn();

	const g = globalThis as Record<string, unknown>;
	g.defineEventHandler = (fn: unknown) => fn;
	g.getRequestHost = mockGetRequestHost;
	g.getRequestURL = mockGetRequestURL;
	g.sendRedirect = mockSendRedirect;

	return { mockGetRequestHost, mockGetRequestURL, mockSendRedirect };
});

import domainRedirects from "#server/middleware/domain-redirects";

type Handler = (event: unknown) => unknown;
const fakeEvent = {};

function setRequest(host: string, url: string) {
	mockGetRequestHost.mockReturnValue(host);
	mockGetRequestURL.mockReturnValue(new URL(url));
}

describe("domain-redirects middleware", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("redirects repo.wolfstar.rocks preserving the path and query", () => {
		setRequest("repo.wolfstar.rocks", "https://repo.wolfstar.rocks/issues/42?tab=open");
		(domainRedirects as Handler)(fakeEvent);
		expect(mockSendRedirect).toHaveBeenCalledWith(
			fakeEvent,
			"https://github.com/wolfstar-project/wolfstar.rocks/issues/42?tab=open",
			301,
		);
	});

	it("redirects chat.wolfstar.rocks to the Discord invite regardless of path", () => {
		setRequest("chat.wolfstar.rocks", "https://chat.wolfstar.rocks/");
		(domainRedirects as Handler)(fakeEvent);
		expect(mockSendRedirect).toHaveBeenCalledWith(
			fakeEvent,
			"https://discord.gg/gqAnRyUXG8",
			301,
		);
	});

	it("redirects social.wolfstar.rocks/twitter to Twitter", () => {
		setRequest("social.wolfstar.rocks", "https://social.wolfstar.rocks/twitter");
		(domainRedirects as Handler)(fakeEvent);
		expect(mockSendRedirect).toHaveBeenCalledWith(
			fakeEvent,
			"https://twitter.com/WolfstarApp",
			301,
		);
	});

	it("does not redirect other paths on social.wolfstar.rocks", () => {
		setRequest("social.wolfstar.rocks", "https://social.wolfstar.rocks/instagram");
		(domainRedirects as Handler)(fakeEvent);
		expect(mockSendRedirect).not.toHaveBeenCalled();
	});

	it("redirects blog.wolfstar.rocks root to /blog", () => {
		setRequest("blog.wolfstar.rocks", "https://blog.wolfstar.rocks/");
		(domainRedirects as Handler)(fakeEvent);
		expect(mockSendRedirect).toHaveBeenCalledWith(
			fakeEvent,
			"https://wolfstar.rocks/blog",
			301,
		);
	});

	it("redirects blog.wolfstar.rocks sub-paths preserving path and query", () => {
		setRequest("blog.wolfstar.rocks", "https://blog.wolfstar.rocks/wolfstar-v7?ref=x");
		(domainRedirects as Handler)(fakeEvent);
		expect(mockSendRedirect).toHaveBeenCalledWith(
			fakeEvent,
			"https://wolfstar.rocks/blog/wolfstar-v7?ref=x",
			301,
		);
	});

	it("does not redirect unrelated hosts", () => {
		setRequest("beta.wolfstar.rocks", "https://beta.wolfstar.rocks/");
		(domainRedirects as Handler)(fakeEvent);
		expect(mockSendRedirect).not.toHaveBeenCalled();
	});
});
