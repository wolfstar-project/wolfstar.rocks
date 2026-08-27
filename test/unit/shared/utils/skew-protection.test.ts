import {
	CLIENT_OUTDATED_HEADER,
	DEFAULT_SKEW_COOKIE_MAX_AGE,
	DEFAULT_SKEW_COOKIE_NAME,
	isClientOutdatedResponse,
	resolveSkewCookie,
} from "#shared/utils/skew-protection";
import { describe, expect, it } from "vitest";

describe("resolveSkewCookie", () => {
	it("falls back to the module's own defaults when nothing is configured", () => {
		expect(resolveSkewCookie()).toEqual({
			name: DEFAULT_SKEW_COOKIE_NAME,
			options: {
				domain: undefined,
				maxAge: DEFAULT_SKEW_COOKIE_MAX_AGE,
				path: "/",
				sameSite: "lax",
				secure: undefined,
			},
		});
	});

	it("keeps the attributes the Nitro middleware writes so the cookie is overwritten", () => {
		const { name, options } = resolveSkewCookie({
			name: "__nkpv_pro",
			path: "/pro",
			maxAge: 60,
			sameSite: "strict",
			domain: "wolfstar.rocks",
			secure: true,
		});

		expect(name).toBe("__nkpv_pro");
		expect(options).toEqual({
			domain: "wolfstar.rocks",
			maxAge: 60,
			path: "/pro",
			sameSite: "strict",
			secure: true,
		});
	});

	it("narrows an unrecognized sameSite string to lax", () => {
		// Nuxt generates `sameSite` as a plain `string` in the runtime config types.
		expect(resolveSkewCookie({ sameSite: "not-a-policy" }).options.sameSite).toBe("lax");
	});

	it("keeps a falsy maxAge of 0 instead of substituting the default", () => {
		expect(resolveSkewCookie({ maxAge: 0 }).options.maxAge).toBe(0);
	});
});

describe("isClientOutdatedResponse", () => {
	function response(status: number, headers: Record<string, string>) {
		return { status, headers: new Headers(headers) };
	}

	it("detects the 409 the wrapped handler sends to a stale client", () => {
		expect(isClientOutdatedResponse(response(409, { [CLIENT_OUTDATED_HEADER]: "true" }))).toBe(
			true,
		);
	});

	it("ignores an unrelated 409", () => {
		expect(isClientOutdatedResponse(response(409, {}))).toBe(false);
	});

	it("ignores the header on a non-409 response", () => {
		expect(isClientOutdatedResponse(response(200, { [CLIENT_OUTDATED_HEADER]: "true" }))).toBe(
			false,
		);
	});
});
