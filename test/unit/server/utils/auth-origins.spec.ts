import {
	isTrustedOrigin,
	matchesHostPattern,
	resolveTrustedOrigins,
	STATIC_TRUSTED_ORIGINS,
} from "#server/utils/auth-origins";
import { describe, expect, it } from "vitest";

function requestFrom(url: string): Request {
	return new Request(url);
}

describe("matchesHostPattern", () => {
	it("matches an exact hostname", () => {
		expect(matchesHostPattern("wolfstar.rocks", "wolfstar.rocks")).toBe(true);
		expect(matchesHostPattern("evil.com", "wolfstar.rocks")).toBe(false);
	});

	it("matches a single label behind a wildcard", () => {
		expect(matchesHostPattern("beta.wolfstar.rocks", "*.wolfstar.rocks")).toBe(true);
		expect(matchesHostPattern("deploy-preview-1--site.netlify.app", "*.netlify.app")).toBe(
			true,
		);
	});

	it("does not let a wildcard span extra labels", () => {
		// Otherwise `attacker.evil.wolfstar.rocks.evil.com` style hosts could slip in.
		expect(matchesHostPattern("a.b.wolfstar.rocks", "*.wolfstar.rocks")).toBe(false);
		expect(matchesHostPattern("wolfstar.rocks", "*.wolfstar.rocks")).toBe(false);
	});

	it("rejects empty input", () => {
		expect(matchesHostPattern("", "*.wolfstar.rocks")).toBe(false);
		expect(matchesHostPattern("wolfstar.rocks", "")).toBe(false);
	});
});

describe("isTrustedOrigin", () => {
	it("accepts the production and preview hosts", () => {
		expect(isTrustedOrigin("https://wolfstar.rocks")).toBe(true);
		expect(isTrustedOrigin("https://beta.wolfstar.rocks")).toBe(true);
		expect(isTrustedOrigin("https://deploy-preview-42--wolfstar.netlify.app")).toBe(true);
		expect(isTrustedOrigin("http://localhost:3000")).toBe(true);
	});

	it("rejects unknown hosts, look-alikes, and unparseable input", () => {
		expect(isTrustedOrigin("https://wolfstar.rocks.evil.com")).toBe(false);
		expect(isTrustedOrigin("https://notwolfstar.rocks")).toBe(false);
		expect(isTrustedOrigin("not a url")).toBe(false);
		expect(isTrustedOrigin(undefined)).toBe(false);
		expect(isTrustedOrigin(null)).toBe(false);
	});
});

describe("resolveTrustedOrigins", () => {
	it("always includes the static deployment origins", () => {
		expect(resolveTrustedOrigins()).toStrictEqual([...STATIC_TRUSTED_ORIGINS]);
	});

	it("adds the request origin for an allowed preview host", () => {
		const origins = resolveTrustedOrigins(
			requestFrom("https://deploy-preview-42--wolfstar.netlify.app/api/auth/sign-in/social"),
		);

		expect(origins).toContain("https://deploy-preview-42--wolfstar.netlify.app");
	});

	it("ignores the request origin when the host is not allowed", () => {
		const origins = resolveTrustedOrigins(
			requestFrom("https://evil.com/api/auth/sign-in/social"),
		);

		expect(origins).toStrictEqual([...STATIC_TRUSTED_ORIGINS]);
	});

	it("does not duplicate an origin already in the static list", () => {
		const origins = resolveTrustedOrigins(
			requestFrom("https://wolfstar.rocks/api/auth/get-session"),
		);

		expect(origins.filter((origin) => origin === "https://wolfstar.rocks")).toHaveLength(1);
	});
});
