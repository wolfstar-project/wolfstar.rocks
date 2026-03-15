import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";

mockNuxtImport("defineShortcuts", () => vi.fn());

describe("useDashboardLayout", () => {
	async function setup() {
		let composable: ReturnType<typeof useDashboardLayout> | undefined;

		const TestComponent = defineComponent({
			setup() {
				composable = useDashboardLayout();
				return () => null;
			},
		});

		await mountSuspended(TestComponent);
		return composable!;
	}

	it("should return isNotificationsSlideoverOpen as false initially", async () => {
		const { isNotificationsSlideoverOpen } = await setup();
		expect(isNotificationsSlideoverOpen.value).toBe(false);
	});

	it("should allow toggling isNotificationsSlideoverOpen", async () => {
		const { isNotificationsSlideoverOpen } = await setup();
		isNotificationsSlideoverOpen.value = true;
		expect(isNotificationsSlideoverOpen.value).toBe(true);
	});

	it("should share state across multiple calls (createSharedComposable)", async () => {
		let first: ReturnType<typeof useDashboardLayout> | undefined;
		let second: ReturnType<typeof useDashboardLayout> | undefined;

		const TestComponent = defineComponent({
			setup() {
				first = useDashboardLayout();
				second = useDashboardLayout();
				return () => null;
			},
		});

		await mountSuspended(TestComponent);

		expect(first).toBeDefined();
		expect(second).toBeDefined();
		expect(first!.isNotificationsSlideoverOpen).toBe(second!.isNotificationsSlideoverOpen);
	});
});
