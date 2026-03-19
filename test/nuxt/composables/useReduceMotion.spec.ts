import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it } from "vitest";
import { defineComponent } from "vue";

describe("useReduceMotion", () => {
	beforeEach(() => {
		localStorage.removeItem("user-prefers-reduced-motion");
	});

	async function setup() {
		let composable: ReturnType<typeof useReduceMotion> | undefined;

		const TestComponent = defineComponent({
			setup() {
				composable = useReduceMotion();
				return () => null;
			},
		});

		await mountSuspended(TestComponent);
		return composable!;
	}

	it("should return all expected properties", async () => {
		const result = await setup();
		expect(result).toHaveProperty("effectiveReduceMotion");
		expect(result).toHaveProperty("reduceMotionEnabled");
		expect(result).toHaveProperty("setReduceMotion");
		expect(result).toHaveProperty("systemPreferenceActive");
		expect(result).toHaveProperty("systemPrefersReducedMotion");
	});

	it("should default reduceMotionEnabled to false", async () => {
		const { reduceMotionEnabled } = await setup();
		expect(reduceMotionEnabled.value).toBe(false);
	});

	it("should update reduceMotionEnabled via setter", async () => {
		const { reduceMotionEnabled } = await setup();
		reduceMotionEnabled.value = true;
		expect(reduceMotionEnabled.value).toBe(true);
	});

	it("should update reduceMotionEnabled via setReduceMotion", async () => {
		const { reduceMotionEnabled, setReduceMotion } = await setup();
		setReduceMotion(true);
		expect(reduceMotionEnabled.value).toBe(true);
	});

	it("should enable effectiveReduceMotion when user preference is set", async () => {
		const { effectiveReduceMotion, setReduceMotion } = await setup();
		setReduceMotion(true);
		expect(effectiveReduceMotion.value).toBe(true);
	});

	it("should have setReduceMotion as a function", async () => {
		const { setReduceMotion } = await setup();
		expect(typeof setReduceMotion).toBe("function");
	});

	it("should have systemPrefersReducedMotion as a ref", async () => {
		const { systemPrefersReducedMotion } = await setup();
		expect(systemPrefersReducedMotion).toBeDefined();
		expect(systemPrefersReducedMotion.value).toBeDefined();
	});
});
