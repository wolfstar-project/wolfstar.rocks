import { describe, expect, it } from "vitest";
import { isSafeRedirectPath } from "../../../../../shared/utils/redirect";

describe("discord.get.ts - redirect URL validation", () => {
	it("accepts a valid relative next URL", () => {
		expect(isSafeRedirectPath("/guilds/123")).toBe(true);
	});

	it("rejects an absolute URL as next", () => {
		expect(isSafeRedirectPath("https://evil.com")).toBe(false);
	});

	it("falls back to '/' for unsafe next URL", () => {
		// Test the logic: unsafeUrl → "/"
		const unsafeUrl = "https://evil.com";
		const safeRedirectUrl = isSafeRedirectPath(unsafeUrl) ? unsafeUrl : "/";
		expect(safeRedirectUrl).toBe("/");
	});

	it("falls back to '/' for undefined next URL", () => {
		const nextUrl = undefined;
		const safeRedirectUrl = nextUrl && isSafeRedirectPath(nextUrl) ? nextUrl : "/";
		expect(safeRedirectUrl).toBe("/");
	});

	it("keeps a safe URL unchanged", () => {
		const safeUrl = "/guilds/456?action=settings";
		const safeRedirectUrl = safeUrl && isSafeRedirectPath(safeUrl) ? safeUrl : "/";
		expect(safeRedirectUrl).toBe(safeUrl);
	});
});
