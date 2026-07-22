import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { defineComponent, h, provide, ref } from "vue";

describe("useHeader", () => {
	async function setup(appName: "wolfstar" | "staryl" = "wolfstar") {
		let composable: ReturnType<typeof useHeader> | undefined;

		const Child = defineComponent({
			setup() {
				composable = useHeader();
				return () => null;
			},
		});

		const Wrapper = defineComponent({
			setup() {
				provide(ProviderAppNameKey, ref(appName));
				return () => h(Child);
			},
		});

		await mountSuspended(Wrapper);
		return composable!;
	}

	it("should return currentApp, desktopLinks, and mobileLinks", async () => {
		const result = await setup();
		expect(result.currentApp).toBeDefined();
		expect(result.desktopLinks).toBeDefined();
		expect(result.mobileLinks).toBeDefined();
	});

	it("should default to WolfStar app", async () => {
		const { currentApp } = await setup("wolfstar");
		expect(currentApp.value.name).toBe("WolfStar");
	});

	it("should return Staryl app when injected as staryl", async () => {
		const { currentApp } = await setup("staryl");
		expect(currentApp.value.name).toBe("Staryl");
	});

	it("should include Features in desktop links", async () => {
		const { desktopLinks } = await setup();
		const labels = desktopLinks.value.map((l: any) => l.label);
		expect(labels).toContain("Features");
	});

	it("should include Applications in desktop links", async () => {
		const { desktopLinks } = await setup();
		const labels = desktopLinks.value.map((l: any) => l.label);
		expect(labels).toContain("Applications");
	});

	it("should include Commands in desktop links", async () => {
		const { desktopLinks } = await setup();
		const labels = desktopLinks.value.map((l: any) => l.label);
		expect(labels).toContain("Commands");
	});

	it("should include GitHub link in mobile links", async () => {
		const { mobileLinks } = await setup();
		const labels = mobileLinks.value.map((l: any) => l.label);
		expect(labels).toContain("GitHub");
	});

	it("should give Features children destinations on mobile", async () => {
		const { mobileLinks } = await setup();
		const features = mobileLinks.value.find((l: any) => l.label === "Features");
		expect(features?.children?.every((child: any) => typeof child.to === "string")).toBe(
			true,
		);
	});
});
