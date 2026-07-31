import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";

function refreshRequestCalls(calls: unknown[][]): unknown[][] {
	return calls.filter((call) => {
		const target = call[0];
		return typeof target === "string" && target.includes("/api/auth/refresh");
	});
}

describe("useSessionRefresh", () => {
	async function setup() {
		const TestComponent = defineComponent({
			setup() {
				useSessionRefresh();
				return () => null;
			},
		});

		return mountSuspended(TestComponent);
	}

	it("should mount without errors", async () => {
		await expect(setup()).resolves.toBeDefined();
	});

	it("should not call $fetch during test environment (import.meta.test guard)", async () => {
		expect(import.meta.test).toBe(true);

		const fetchSpy = vi.spyOn(globalThis, "fetch");
		const dollarFetchSpy = vi.spyOn(globalThis, "$fetch");

		await setup();
		// Allow any queued onMounted microtasks to settle.
		await Promise.resolve();
		await Promise.resolve();

		expect(refreshRequestCalls(fetchSpy.mock.calls)).toHaveLength(0);
		expect(refreshRequestCalls(dollarFetchSpy.mock.calls)).toHaveLength(0);

		fetchSpy.mockRestore();
		dollarFetchSpy.mockRestore();
	});
});
