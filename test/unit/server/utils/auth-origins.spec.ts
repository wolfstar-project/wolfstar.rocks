import {
	isTrustedOrigin,
	matchesHostPattern,
	hostOnlyAuthCookies,
	resolveAuthCookieDomain,
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
		expect(isTrustedOrigin("https://alpha.wolfstar.rocks")).toBe(true);
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
			requestFrom("https://alpha.wolfstar.rocks/api/auth/sign-in/social"),
		);

		expect(origins).toContain("https://alpha.wolfstar.rocks");
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

describe("resolveAuthCookieDomain", () => {
	it("shares production's cookies with its subdomains", () => {
		expect(resolveAuthCookieDomain("https://wolfstar.rocks")).toBe("wolfstar.rocks");
	});

	it.each(["https://alpha.wolfstar.rocks", "http://localhost:3000", "", undefined, "not a url"])(
		"keeps the cookies of %s on their own host",
		(siteUrl) => {
			expect(resolveAuthCookieDomain(siteUrl)).toBeUndefined();
		},
	);
});

describe("hostOnlyAuthCookies", () => {
	const names = [
		"__Secure-wolfstar-session.session_token",
		"__Secure-wolfstar-session.session_data",
	];

	// A browser signed in before the cookies covered the whole domain holds a
	// host-only copy of each: they are named like the shared ones.
	it("lists the auth cookies the request carries, with the chunks of a split one", () => {
		expect(
			hostOnlyAuthCookies(
				"theme=dark; __Secure-wolfstar-session.session_token=a; __Secure-wolfstar-session.session_data.0=b; __Secure-wolfstar-session.session_data.1=c",
				names,
			),
		).toEqual([
			"__Secure-wolfstar-session.session_token",
			"__Secure-wolfstar-session.session_data.0",
			"__Secure-wolfstar-session.session_data.1",
		]);
	});

	it("lists nothing for a request without auth cookies", () => {
		expect(hostOnlyAuthCookies("theme=dark", names)).toEqual([]);
		expect(hostOnlyAuthCookies(null, names)).toEqual([]);
	});

	it("does not take a cookie whose name only starts like an auth cookie", () => {
		expect(hostOnlyAuthCookies("__Secure-wolfstar-session.session_tokenx=a", names)).toEqual(
			[],
		);
	});
});
