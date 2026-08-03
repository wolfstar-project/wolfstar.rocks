import type { DOMWrapper, VueWrapper } from "@vue/test-utils";
import type { NuxtError } from "nuxt/app";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { createError } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ErrorPage from "~/components/ErrorPage.vue";

const goHomeSpy = vi.fn();
const retrySpy = vi.fn();

mockNuxtImport("useErrorActions", () => () => ({ goHome: goHomeSpy, retry: retrySpy }));

function makeError(input: { status: number; statusText?: string; message?: string }): NuxtError {
	return createError(input);
}

function buttonByText(wrapper: VueWrapper, text: string): DOMWrapper<Element> {
	const button = wrapper.findAll("button").find((node) => node.text().includes(text));
	if (!button) {
		throw new Error(`expected a button containing "${text}"`);
	}
	return button;
}

describe("ErrorPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("404 errors", () => {
		const error = makeError({
			status: 404,
			statusText: "Page not found",
			message: "Page not found: /missing-page",
		});

		it("renders the status code, localized title, and error detail", async () => {
			const wrapper = await mountSuspended(ErrorPage, { props: { error } });

			expect(wrapper.text()).toContain("404");
			expect(wrapper.text()).toContain("Page not found");
			expect(wrapper.text()).toContain("Page not found: /missing-page");
		});

		it("shows only the home action and clears the error towards home on click", async () => {
			const wrapper = await mountSuspended(ErrorPage, { props: { error } });

			expect(wrapper.findAll("button")).toHaveLength(1);

			await buttonByText(wrapper, "Back to home").trigger("click");
			expect(goHomeSpy).toHaveBeenCalledTimes(1);
			expect(retrySpy).not.toHaveBeenCalled();
		});
	});

	describe("5xx errors", () => {
		const error = makeError({
			status: 500,
			statusText: "Internal Server Error",
			message: "fetch failed",
		});

		it("renders the localized server error title with the technical detail", async () => {
			const wrapper = await mountSuspended(ErrorPage, { props: { error } });

			expect(wrapper.text()).toContain("500");
			expect(wrapper.text()).toContain("Server Error");
			expect(wrapper.text()).toContain("Something went wrong on our end");
			expect(wrapper.text()).toContain("fetch failed");
		});

		it("offers a retry action that reloads the app", async () => {
			const wrapper = await mountSuspended(ErrorPage, { props: { error } });

			await buttonByText(wrapper, "Try Again").trigger("click");
			expect(retrySpy).toHaveBeenCalledTimes(1);
		});

		it("still offers a home action that clears the error", async () => {
			const wrapper = await mountSuspended(ErrorPage, { props: { error } });

			await buttonByText(wrapper, "Back to home").trigger("click");
			expect(goHomeSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe("other errors", () => {
		it("falls back to the status text as title", async () => {
			const wrapper = await mountSuspended(ErrorPage, {
				props: { error: makeError({ status: 403, statusText: "Forbidden" }) },
			});

			expect(wrapper.text()).toContain("403");
			expect(wrapper.text()).toContain("Forbidden");
		});

		it("hides the detail when the message repeats the title", async () => {
			const wrapper = await mountSuspended(ErrorPage, {
				props: {
					error: makeError({
						status: 403,
						statusText: "Forbidden",
						message: "Forbidden",
					}),
				},
			});

			expect(wrapper.findAll("p").filter((node) => node.text() === "Forbidden")).toHaveLength(
				0,
			);
		});
	});
});
