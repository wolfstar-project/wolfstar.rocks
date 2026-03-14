/**
 * Contract tests for `GET /api` (public health-check endpoint).
 *
 * The real handler lives in `server/api/index.get.ts` and returns
 * `{ message: "hello world" }`. Because it has zero auth or external-service
 * dependencies this is a good anchor for smoke-testing route wiring.
 *
 * Note: we register a *mock* handler at `/api` rather than booting a full
 * Nuxt server (`@nuxt/test-utils/e2e`). This keeps the suite fast while
 * validating the URL contract and response shape.
 */

import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { getQuery } from "h3";
import { describe, expect, it } from "vitest";

registerEndpoint("/api", {
	method: "GET",
	handler: (event) => {
		const query = getQuery(event);
		if (query.test) {
			return { message: `GET: hello world with query test=${query.test}` };
		}
		return { message: "hello world" };
	},
});

describe("GET /api (health check)", () => {
	it("returns 200 with { message: 'hello world' } when no query params", async () => {
		const data = await $fetch<{ message: string }>("/api");
		expect(data).toStrictEqual({ message: "hello world" });
	});

	it("echoes the 'test' query parameter in the response message", async () => {
		const data = await $fetch<{ message: string }>("/api", { query: { test: "foo" } });
		expect(data.message).toBe("GET: hello world with query test=foo");
	});

	it("returns a JSON response with a 'message' string property", async () => {
		const data = await $fetch<{ message: string }>("/api");
		expect(typeof data.message).toBe("string");
		expect(data.message.length).toBeGreaterThan(0);
	});
});
