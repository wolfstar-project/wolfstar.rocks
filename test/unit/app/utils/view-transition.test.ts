import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { startViewTransition } from "~/utils/view-transition";

interface TestDocument {
	startViewTransition?: (callback: () => unknown) => { skipTransition: () => void };
	activeViewTransition?: { skipTransition: () => void } | null;
}

const originalDocument = globalThis.document;

function stubDocument(value: TestDocument | undefined): void {
	Object.defineProperty(globalThis, "document", {
		configurable: true,
		value,
		writable: true,
	});
}

// The module under test calls Nuxt's auto-imported `nextTick`, which this
// plain-node project doesn't provide, so stand it up as a global the way the
// Nuxt build does.
beforeAll(() => {
	Object.assign(globalThis, { nextTick });
});

afterEach(() => {
	stubDocument(originalDocument as unknown as TestDocument);
});

describe("startViewTransition", () => {
	it("starts a transition and applies the update inside it", async () => {
		const update = vi.fn();
		const callbacks: Array<() => unknown> = [];
		stubDocument({
			startViewTransition: (callback) => {
				callbacks.push(callback);
				return { skipTransition: vi.fn() };
			},
			activeViewTransition: null,
		});

		startViewTransition(update);

		expect(callbacks).toHaveLength(1);
		expect(update).not.toHaveBeenCalled();

		await callbacks[0]!();
		expect(update).toHaveBeenCalledTimes(1);
	});

	it("applies the update directly under reduced motion", () => {
		const update = vi.fn();
		const start = vi.fn(() => ({ skipTransition: vi.fn() }));
		stubDocument({ startViewTransition: start, activeViewTransition: null });

		startViewTransition(update, { reduceMotion: true });

		expect(update).toHaveBeenCalledTimes(1);
		expect(start).not.toHaveBeenCalled();
	});

	it("applies the update directly when the browser has no support", () => {
		const update = vi.fn();
		stubDocument({ activeViewTransition: null });

		startViewTransition(update);

		expect(update).toHaveBeenCalledTimes(1);
	});

	it("skips a running transition before starting its own", () => {
		const update = vi.fn();
		const skipTransition = vi.fn();
		const start = vi.fn(() => ({ skipTransition: vi.fn() }));
		stubDocument({ startViewTransition: start, activeViewTransition: { skipTransition } });

		startViewTransition(update);

		expect(skipTransition).toHaveBeenCalledTimes(1);
		expect(start).toHaveBeenCalledTimes(1);
	});

	it("rides along with a running transition when asked to bypass", () => {
		const update = vi.fn();
		const skipTransition = vi.fn();
		const start = vi.fn(() => ({ skipTransition: vi.fn() }));
		stubDocument({ startViewTransition: start, activeViewTransition: { skipTransition } });

		startViewTransition(update, { whenActive: "bypass" });

		expect(update).toHaveBeenCalledTimes(1);
		expect(skipTransition).not.toHaveBeenCalled();
		expect(start).not.toHaveBeenCalled();
	});
});
