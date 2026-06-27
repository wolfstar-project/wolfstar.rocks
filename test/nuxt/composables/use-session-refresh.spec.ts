import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";

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
		const fetchSpy = vi.spyOn(globalThis, "fetch");
		await setup();
		// The import.meta.test guard in onMounted prevents any $fetch calls
		expect(fetchSpy).not.toHaveBeenCalledWith("/api/auth/refresh", expect.anything());
		fetchSpy.mockRestore();
	});
});
