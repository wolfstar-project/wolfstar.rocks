import type { RouteLocationNormalized } from "vue-router";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

describe("disable-vue-transitions middleware", () => {
	type MiddlewareFn = (to: RouteLocationNormalized, from: RouteLocationNormalized) => void;
	let middleware: MiddlewareFn;

	beforeAll(async () => {
		// defineNuxtRouteMiddleware is a Nuxt runtime auto-import unavailable in plain unit tests;
		// stub it as an identity wrapper so the module can be loaded and evaluated.
		vi.stubGlobal("defineNuxtRouteMiddleware", (fn: MiddlewareFn) => fn);
		const mod = await import("~/middleware/disable-vue-transitions.global");
		middleware = mod.default as MiddlewareFn;
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("sets pageTransition and layoutTransition to false when VT is supported", () => {
		vi.stubGlobal("document", { startViewTransition: vi.fn() });
		const to = { meta: {} } as unknown as RouteLocationNormalized;
		const from = { meta: {} } as unknown as RouteLocationNormalized;
		middleware(to, from);
		expect(to.meta.pageTransition).toBe(false);
		expect(to.meta.layoutTransition).toBe(false);
	});

	it("does not mutate meta when document.startViewTransition is absent", () => {
		vi.stubGlobal("document", { startViewTransition: undefined });
		const to = { meta: {} } as unknown as RouteLocationNormalized;
		const from = { meta: {} } as unknown as RouteLocationNormalized;
		middleware(to, from);
		expect(to.meta.pageTransition).toBeUndefined();
		expect(to.meta.layoutTransition).toBeUndefined();
	});

	it("overwrites existing transition meta values when VT is supported", () => {
		vi.stubGlobal("document", { startViewTransition: vi.fn() });
		const to = {
			meta: { pageTransition: { name: "fade" }, layoutTransition: { name: "slide" } },
		} as unknown as RouteLocationNormalized;
		const from = { meta: {} } as unknown as RouteLocationNormalized;
		middleware(to, from);
		expect(to.meta.pageTransition).toBe(false);
		expect(to.meta.layoutTransition).toBe(false);
	});
});
