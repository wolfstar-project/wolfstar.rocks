import type { VueWrapper } from "@vue/test-utils";
import type { NuxtError } from "nuxt/app";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { createError } from "h3";
import { describe, expect, it } from "vitest";
import ErrorPage from "~/components/ErrorPage.vue";

function makeError(input: { status: number; statusText?: string; message?: string }): NuxtError {
	return createError(input);
}

function buttonLabels(wrapper: VueWrapper): string[] {
	return wrapper.findAll("button").map((node) => node.text());
}

describe("ErrorPage", () => {
	describe("404 errors", () => {
		const error = makeError({
			status: 404,
			statusText: "Page not found",
			message: "Page not found: /missing-page",
		});

		it("renders the status code and localized title", async () => {
			const wrapper = await mountSuspended(ErrorPage, { props: { error } });

			expect(wrapper.text()).toContain("404");
			expect(wrapper.text()).toContain("Page not found");
		});

		it("shows only the home action", async () => {
			const wrapper = await mountSuspended(ErrorPage, { props: { error } });
			const labels = buttonLabels(wrapper);

			expect(labels).toHaveLength(1);
			expect(labels[0]).toContain("Back to home");
		});
	});

	describe("5xx errors", () => {
		const error = makeError({
			status: 500,
			statusText: "Internal Server Error",
			message: "fetch failed",
		});

		it("renders the localized server error title without leaking the technical detail", async () => {
			const wrapper = await mountSuspended(ErrorPage, { props: { error } });

			expect(wrapper.text()).toContain("500");
			expect(wrapper.text()).toContain("Server Error");
			expect(wrapper.text()).toContain("Something went wrong on our end");
			// Vitest browser / CI runs with import.meta.dev === false; raw 5xx
			// messages stay hidden outside development.
			expect(wrapper.text()).not.toContain("fetch failed");
		});

		it("offers retry and home actions", async () => {
			const wrapper = await mountSuspended(ErrorPage, { props: { error } });
			const labels = buttonLabels(wrapper);

			expect(labels).toHaveLength(2);
			expect(labels[0]).toContain("Try Again");
			expect(labels[1]).toContain("Back to home");
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
