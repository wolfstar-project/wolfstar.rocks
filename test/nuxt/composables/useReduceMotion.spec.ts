import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";

describe("useReduceMotion", () => {
	beforeEach(() => {
		vi.resetModules();
		localStorage.clear();
	});

	async function setup() {
		const settingsModule = await import("~/composables/useSettings");
		settingsModule.resetSettingsStateForTests();
		let composable: ReturnType<typeof settingsModule.useReduceMotion> | undefined;

		const TestComponent = defineComponent({
			setup() {
				composable = settingsModule.useReduceMotion();
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

	it("migrates the legacy reduced-motion key into wolfstar-settings", async () => {
		localStorage.setItem("user-prefers-reduced-motion", "true");

		const { reduceMotionEnabled } = await setup();
		await nextTick();

		expect(reduceMotionEnabled.value).toBe(true);
		expect(localStorage.getItem("user-prefers-reduced-motion")).toBeNull();
		expect(JSON.parse(localStorage.getItem("wolfstar-settings") ?? "{}").reduceMotion).toBe(
			true,
		);
	});
});
