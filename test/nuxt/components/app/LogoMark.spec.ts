import { AppLogoMark } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { renderToString } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createSSRApp, nextTick } from "vue";
import { runAxe } from "../../utils/axe";

/**
 * Substrings Vue logs (dev build) when the client render does not match the
 * server-rendered DOM. Mirrors the e2e fixture in test/e2e/test-utils.ts.
 */
const HYDRATION_MISMATCH_PATTERNS = [
	"Hydration completed but contains mismatches",
	"Hydration text content mismatch",
	"Hydration node mismatch",
	"Hydration children mismatch",
	"Hydration attribute mismatch",
	"Hydration class mismatch",
	"Hydration style mismatch",
];

const mountedContainers: HTMLElement[] = [];

function createContainer(): HTMLElement {
	const container = document.createElement("div");
	document.body.appendChild(container);
	mountedContainers.push(container);
	return container;
}

afterEach(() => {
	for (const container of mountedContainers) container.remove();
	mountedContainers.length = 0;
	vi.restoreAllMocks();
});

describe("AppLogoMark", () => {
	describe("hydration", () => {
		it("hydrates server-rendered markup without mismatch warnings", async () => {
			const consoleMessages: string[] = [];
			const collect = (...args: unknown[]) => {
				consoleMessages.push(args.map(String).join(" "));
			};
			vi.spyOn(console, "warn").mockImplementation(collect);
			vi.spyOn(console, "error").mockImplementation(collect);

			const html = await renderToString(AppLogoMark);

			const container = createContainer();
			container.innerHTML = html;

			// createSSRApp().mount() hydrates the existing DOM instead of mounting fresh,
			// so any server/client divergence surfaces as a Vue hydration warning.
			const app = createSSRApp(AppLogoMark);
			app.mount(container);
			await nextTick();

			const hydrationWarnings = consoleMessages.filter((message) =>
				HYDRATION_MISMATCH_PATTERNS.some((pattern) => message.includes(pattern)),
			);
			expect(hydrationWarnings).toEqual([]);

			app.unmount();
		});

		it("hydrates cleanly when a custom class is provided", async () => {
			const consoleMessages: string[] = [];
			const collect = (...args: unknown[]) => {
				consoleMessages.push(args.map(String).join(" "));
			};
			vi.spyOn(console, "warn").mockImplementation(collect);
			vi.spyOn(console, "error").mockImplementation(collect);

			const props = { class: "h-20 w-45" };
			const html = await renderToString(AppLogoMark, { props });

			const container = createContainer();
			container.innerHTML = html;

			const app = createSSRApp(AppLogoMark, props);
			app.mount(container);
			await nextTick();

			const hydrationWarnings = consoleMessages.filter((message) =>
				HYDRATION_MISMATCH_PATTERNS.some((pattern) => message.includes(pattern)),
			);
			expect(hydrationWarnings).toEqual([]);
			expect(container.querySelector("svg")?.getAttribute("class")).toBe("h-20 w-45");

			app.unmount();
		});
	});

	describe("accessibility", () => {
		it("has no axe-core violations", async () => {
			const wrapper = await mountSuspended(AppLogoMark);
			const results = await runAxe(wrapper);
			expect(results.violations).toEqual([]);
		});

		it("marks the decorative logo as aria-hidden so it is ignored by assistive tech", async () => {
			const wrapper = await mountSuspended(AppLogoMark);
			const svg = wrapper.find("svg");
			expect(svg.exists()).toBe(true);
			expect(svg.attributes("aria-hidden")).toBe("true");
			expect(svg.attributes("role")).toBeUndefined();
		});
	});
});
