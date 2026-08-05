// @vitest-environment jsdom
import type { RouteLocationNormalized } from "vue-router";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

describe("view-transition.client plugin", () => {
	type SetupFn = (nuxtApp: MockNuxtApp) => void;
	interface MockNuxtApp {
		"hook": ReturnType<typeof vi.fn>;
		"~transitionPromise"?: Promise<void>;
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
	let mockNuxtApp: MockNuxtApp;
	let mockVT: {
		types: Set<string>;
		ready: Promise<void>;
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
			ready: Promise.resolve(),
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

		mockNuxtApp = {
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

	it("skips the in-flight transition and starts a new one when activeViewTransition exists", async () => {
		const skipTransition = vi.fn();
		(
			document as { activeViewTransition?: { skipTransition: () => void } }
		).activeViewTransition = { skipTransition };
		await capturedBeforeResolve!(makeRoute("/wolfstar"), makeRoute("/"));
		expect(skipTransition).toHaveBeenCalled();
		expect(mockStartVT).toHaveBeenCalled();
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

	it("exposes ~transitionPromise so Nuxt scrollBehavior can wait for the VT update", async () => {
		await capturedBeforeResolve!(makeRoute("/wolfstar"), makeRoute("/"));
		expect(mockNuxtApp["~transitionPromise"]).toBeInstanceOf(Promise);

		let released = false;
		void mockNuxtApp["~transitionPromise"]!.then(() => {
			released = true;
		});
		capturedHooks["page:finish"]!();
		await Promise.resolve();
		expect(released).toBe(true);
	});

	it("does not let a superseded transition's cleanup clear the new ~transitionPromise", async () => {
		const makeVT = () => {
			let resolveFinished!: () => void;
			const finished = new Promise<void>((resolve) => {
				resolveFinished = resolve;
			});
			return {
				vt: {
					types: new Set<string>(),
					ready: Promise.resolve(),
					finished,
					skipTransition: vi.fn(),
				},
				resolveFinished,
			};
		};
		const first = makeVT();
		const second = makeVT();
		mockStartVT
			.mockImplementationOnce((callback: () => Promise<void> | void) => {
				void callback();
				return first.vt;
			})
			.mockImplementationOnce((callback: () => Promise<void> | void) => {
				void callback();
				return second.vt;
			});

		await capturedBeforeResolve!(makeRoute("/wolfstar"), makeRoute("/"));
		// A second navigation starts while the first transition is still in flight.
		(
			document as { activeViewTransition?: { skipTransition: () => void } }
		).activeViewTransition = { skipTransition: vi.fn() };
		await capturedBeforeResolve!(makeRoute("/commands"), makeRoute("/wolfstar"));
		const secondPromise = mockNuxtApp["~transitionPromise"];
		expect(secondPromise).toBeInstanceOf(Promise);

		// The first (skipped) transition settles; it must not clear the second's state.
		first.resolveFinished();
		await Promise.allSettled([first.vt.ready, first.vt.finished]);
		await Promise.resolve();
		expect(mockNuxtApp["~transitionPromise"]).toBe(secondPromise);

		// page:finish still releases the second transition's timing gate.
		let released = false;
		void secondPromise!.then(() => {
			released = true;
		});
		capturedHooks["page:finish"]!();
		await Promise.resolve();
		expect(released).toBe(true);
	});

	it("ignores a stale page:finish from the superseded page until the new route change commits", async () => {
		// First navigation: transition starts and its route change commits.
		await capturedBeforeResolve!(makeRoute("/wolfstar"), makeRoute("/"));

		// Second navigation supersedes the first before the first page emitted page:finish.
		(
			document as { activeViewTransition?: { skipTransition: () => void } }
		).activeViewTransition = { skipTransition: vi.fn() };
		let commitSecond: (() => Promise<void> | void) | undefined;
		mockStartVT.mockImplementationOnce((callback: () => Promise<void> | void) => {
			// Defer the update callback so the second route change has not committed yet.
			commitSecond = callback;
			return mockVT;
		});
		const secondNavigation = capturedBeforeResolve!(
			makeRoute("/commands"),
			makeRoute("/wolfstar"),
		);

		const secondPromise = mockNuxtApp["~transitionPromise"];
		expect(secondPromise).toBeInstanceOf(Promise);
		let released = false;
		void secondPromise!.then(() => {
			released = true;
		});

		// The stale first page finally emits page:finish before the second route commits.
		// It must not release the second navigation's gate.
		capturedHooks["page:finish"]!();
		await Promise.resolve();
		expect(released).toBe(false);

		// The second route change commits, then its own page finishes: gate releases.
		void commitSecond!();
		await secondNavigation;
		capturedHooks["page:finish"]!();
		await Promise.resolve();
		expect(released).toBe(true);
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
