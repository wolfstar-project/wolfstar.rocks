// @vitest-environment jsdom
import type { RouteLocationNormalized } from "vue-router";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

describe("view-transition.client plugin", () => {
	type SetupFn = (nuxtApp: MockNuxtApp) => void;
	interface MockNuxtApp {
		hook: ReturnType<typeof vi.fn>;
	}

	let setupPlugin: SetupFn;
	let capturedBeforeResolve:
		| ((
				to: RouteLocationNormalized,
				from: RouteLocationNormalized,
		  ) => Promise<unknown> | undefined)
		| undefined;
	let capturedOnError: (() => void) | undefined;
	const capturedHooks: Record<string, () => void> = {};
	let capturedPopstateHandler: ((e: Event) => void) | undefined;
	let mockVT: {
		types: Set<string>;
		finished: Promise<void>;
		skipTransition: ReturnType<typeof vi.fn>;
	};
	let mockStartVT: ReturnType<typeof vi.fn>;
	let capturedTransitionDone: Promise<void> | undefined;
	const mockReduceMotion = { value: false };

	beforeAll(async () => {
		vi.stubGlobal("defineNuxtPlugin", (fn: SetupFn) => fn);
		const mod = await import("~/plugins/view-transition.client");
		setupPlugin = mod.default as unknown as SetupFn;
	});

	beforeEach(() => {
		capturedBeforeResolve = undefined;
		capturedOnError = undefined;
		capturedPopstateHandler = undefined;
		for (const key of Object.keys(capturedHooks)) delete capturedHooks[key];
		mockReduceMotion.value = false;

		mockVT = {
			types: new Set<string>(),
			finished: new Promise<void>(() => {}),
			skipTransition: vi.fn(),
		};
		capturedTransitionDone = undefined;
		mockStartVT = vi.fn((callback: () => Promise<void> | void) => {
			// Call the callback (resolves `ready` via changeRoute) and capture the returned
			// deferred promise so tests can verify page:finish releases the timing gate.
			capturedTransitionDone = Promise.resolve(callback());
			return mockVT;
		});

		vi.stubGlobal("document", { startViewTransition: mockStartVT });
		vi.stubGlobal("useReduceMotion", () => ({ effectiveReduceMotion: mockReduceMotion }));
		vi.stubGlobal(
			"addEventListener",
			(type: string, handler: EventListenerOrEventListenerObject) => {
				if (type === "popstate") capturedPopstateHandler = handler as (e: Event) => void;
			},
		);

		const mockRouter = {
			beforeResolve: vi.fn(
				(
					fn: (
						to: RouteLocationNormalized,
						from: RouteLocationNormalized,
					) => Promise<unknown> | undefined,
				) => {
					capturedBeforeResolve = fn;
				},
			),
			onError: vi.fn((fn: () => void) => {
				capturedOnError = fn;
			}),
		};
		vi.stubGlobal("useRouter", () => mockRouter);

		const mockNuxtApp: MockNuxtApp = {
			hook: vi.fn((name: string, fn: () => void) => {
				capturedHooks[name] = fn;
			}),
		};
		setupPlugin(mockNuxtApp);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	const makeRoute = (
		path: string,
		matched = true,
		viewTransition?: boolean,
	): RouteLocationNormalized =>
		({
			path,
			matched: matched ? [{}] : [],
			meta: viewTransition !== undefined ? { viewTransition } : {},
		}) as unknown as RouteLocationNormalized;

	it("starts a transition with nav-forward and route-marketing for a forward marketing navigation", async () => {
		await capturedBeforeResolve!(makeRoute("/wolfstar"), makeRoute("/"));
		expect(mockStartVT).toHaveBeenCalledOnce();
		expect(mockVT.types.has("nav-forward")).toBe(true);
		expect(mockVT.types.has("route-marketing")).toBe(true);
	});

	it("adds nav-back when a popstate event preceded the beforeResolve call", async () => {
		capturedPopstateHandler!(new PopStateEvent("popstate"));
		await capturedBeforeResolve!(makeRoute("/wolfstar"), makeRoute("/commands"));
		expect(mockStartVT).toHaveBeenCalledOnce();
		expect(mockVT.types.has("nav-back")).toBe(true);
		expect(mockVT.types.has("nav-forward")).toBe(false);
	});

	it("skips the transition when effectiveReduceMotion is true", async () => {
		mockReduceMotion.value = true;
		await capturedBeforeResolve!(makeRoute("/wolfstar"), makeRoute("/"));
		expect(mockStartVT).not.toHaveBeenCalled();
	});

	it("skips the transition when to.meta.viewTransition is false", async () => {
		await capturedBeforeResolve!(makeRoute("/wolfstar", true, false), makeRoute("/"));
		expect(mockStartVT).not.toHaveBeenCalled();
	});

	it("skips the transition when a document active transition already exists", async () => {
		(document as { activeViewTransition?: object }).activeViewTransition = {};
		await capturedBeforeResolve!(makeRoute("/wolfstar"), makeRoute("/"));
		expect(mockStartVT).not.toHaveBeenCalled();
	});

	it("skips the transition when a document active transition already exists", async () => {
		(document as { activeViewTransition?: object }).activeViewTransition = {};
		await capturedBeforeResolve!(makeRoute("/wolfstar"), makeRoute("/"));
		expect(mockStartVT).not.toHaveBeenCalled();
	});

	it("skips the transition for UA-initiated visual transitions (e.g. Safari swipe-back)", async () => {
		const event = new PopStateEvent("popstate");
		Object.defineProperty(event, "hasUAVisualTransition", { value: true, configurable: true });
		capturedPopstateHandler!(event);
		await capturedBeforeResolve!(makeRoute("/wolfstar"), makeRoute("/"));
		expect(mockStartVT).not.toHaveBeenCalled();
	});

	it("calls skipTransition on an in-flight transition when a popstate with hasUAVisualTransition fires", async () => {
		await capturedBeforeResolve!(makeRoute("/wolfstar"), makeRoute("/"));
		const event = new PopStateEvent("popstate");
		Object.defineProperty(event, "hasUAVisualTransition", { value: true, configurable: true });
		capturedPopstateHandler!(event);
		expect(mockVT.skipTransition).toHaveBeenCalledOnce();
	});

	it("calls skipTransition and resets state on router error", async () => {
		await capturedBeforeResolve!(makeRoute("/wolfstar"), makeRoute("/"));
		capturedOnError!();
		expect(mockVT.skipTransition).toHaveBeenCalledOnce();
	});

	it("releases the deferred transition timing gate when page:finish fires", async () => {
		await capturedBeforeResolve!(makeRoute("/wolfstar"), makeRoute("/"));
		let released = false;
		capturedTransitionDone!.then(() => {
			released = true;
		});
		capturedHooks["page:finish"]!();
		await Promise.resolve(); // flush microtasks so the .then() callback can run
		expect(released).toBe(true);
	});

	it("resets transition state after page:finish so a subsequent error finds no active transition", async () => {
		await capturedBeforeResolve!(makeRoute("/wolfstar"), makeRoute("/"));
		capturedHooks["page:finish"]!();
		capturedOnError!();
		expect(mockVT.skipTransition).not.toHaveBeenCalled();
	});

	it("clears pendingPopstate flags before checking matched so they never leak to the next navigation", async () => {
		capturedPopstateHandler!(new PopStateEvent("popstate"));
		// Unmatched route: beforeResolve returns early, but flags must be cleared first.
		await capturedBeforeResolve!(makeRoute("/nowhere", false), makeRoute("/"));
		// The subsequent matched navigation must not inherit the stale popstate flag.
		await capturedBeforeResolve!(makeRoute("/wolfstar"), makeRoute("/"));
		expect(mockVT.types.has("nav-back")).toBe(false);
		expect(mockVT.types.has("nav-forward")).toBe(true);
	});
});
