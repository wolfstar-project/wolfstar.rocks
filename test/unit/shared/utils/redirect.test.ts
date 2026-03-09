import { isSafeRedirectPath } from "#shared/utils/redirect";
import { describe, expect, it } from "vitest";

describe("isSafeRedirectPath", () => {
	describe("valid cases", () => {
		it('should return true for "/"', () => {
			expect(isSafeRedirectPath("/")).toBe(true);
		});

		it('should return true for "/guilds/123"', () => {
			expect(isSafeRedirectPath("/guilds/123")).toBe(true);
		});

		it('should return true for "/guilds/123?tab=settings"', () => {
			expect(isSafeRedirectPath("/guilds/123?tab=settings")).toBe(true);
		});

		it('should return true for "/guilds/123#section"', () => {
			expect(isSafeRedirectPath("/guilds/123#section")).toBe(true);
		});

		it('should return true for "/path/with spaces"', () => {
			expect(isSafeRedirectPath("/path/with spaces")).toBe(true);
		});
	});

	describe("invalid cases - absolute URLs", () => {
		it('should return false for "https://evil.com"', () => {
			expect(isSafeRedirectPath("https://evil.com")).toBe(false);
		});

		it('should return false for "http://evil.com"', () => {
			expect(isSafeRedirectPath("http://evil.com")).toBe(false);
		});

		it('should return false for "//evil.com" (protocol-relative)', () => {
			expect(isSafeRedirectPath("//evil.com")).toBe(false);
		});
	});

	describe("invalid cases - dangerous protocols", () => {
		it('should return false for "javascript:alert(1)"', () => {
			expect(isSafeRedirectPath("javascript:alert(1)")).toBe(false);
		});

		it('should return false for "JAVASCRIPT:alert(1)" (case insensitive)', () => {
			expect(isSafeRedirectPath("JAVASCRIPT:alert(1)")).toBe(false);
		});

		it('should return false for "data:text/html,<script>alert(1)</script>"', () => {
			expect(isSafeRedirectPath("data:text/html,<script>alert(1)</script>")).toBe(false);
		});

		it('should return false for "vbscript:msgbox"', () => {
			expect(isSafeRedirectPath("vbscript:msgbox")).toBe(false);
		});
	});

	describe("invalid cases - empty/null/undefined", () => {
		it('should return false for empty string ""', () => {
			expect(isSafeRedirectPath("")).toBe(false);
		});

		it("should return false for null", () => {
			expect(isSafeRedirectPath(null)).toBe(false);
		});

		it("should return false for undefined", () => {
			expect(isSafeRedirectPath(undefined)).toBe(false);
		});
	});

	describe("invalid cases - non-string types", () => {
		it("should return false for number", () => {
			expect(isSafeRedirectPath(123)).toBe(false);
		});

		it("should return false for object", () => {
			expect(isSafeRedirectPath({})).toBe(false);
		});

		it("should return false for array", () => {
			expect(isSafeRedirectPath(["/path"])).toBe(false);
		});
	});

	describe("invalid cases - whitespace bypass attempts", () => {
		it('should return false for " javascript:alert(1)" (leading whitespace bypass)', () => {
			expect(isSafeRedirectPath(" javascript:alert(1)")).toBe(false);
		});

		it('should return false for "\\tjavascript:alert(1)" (tab bypass)', () => {
			expect(isSafeRedirectPath("\tjavascript:alert(1)")).toBe(false);
		});

		it('should return false for "\\njavascript:alert(1)" (newline bypass)', () => {
			expect(isSafeRedirectPath("\njavascript:alert(1)")).toBe(false);
		});
	});

	describe("invalid cases - backslash tricks", () => {
		it('should return false for "\\/\\/evil.com" (backslash tricks)', () => {
			expect(isSafeRedirectPath("\\/\\/evil.com")).toBe(false);
		});

		it('should return false for "/\\\\evil.com" (mixed slashes)', () => {
			expect(isSafeRedirectPath("/\\evil.com")).toBe(false);
		});

		it('should return false for "/path\\\\evil" (backslash in middle)', () => {
			expect(isSafeRedirectPath("/path\\evil")).toBe(false);
		});
	});

	describe("invalid cases - whitespace only", () => {
		it('should return false for "   " (whitespace only)', () => {
			expect(isSafeRedirectPath("   ")).toBe(false);
		});

		it('should return false for "\\t\\t" (tabs only)', () => {
			expect(isSafeRedirectPath("\t\t")).toBe(false);
		});
	});

	describe("invalid cases - triple slash", () => {
		it('should return false for "///evil.com" (triple slash)', () => {
			expect(isSafeRedirectPath("///evil.com")).toBe(false);
		});
	});

	describe("invalid cases - percent-encoded attacks", () => {
		it('should return false for "/%5Cevil.com" (encoded backslash)', () => {
			expect(isSafeRedirectPath("/%5Cevil.com")).toBe(false);
		});

		it('should return false for "/%5cevil.com" (lowercase encoded backslash)', () => {
			expect(isSafeRedirectPath("/%5cevil.com")).toBe(false);
		});

		it('should return false for "/%2F%2Fevil.com" (encoded double slash)', () => {
			expect(isSafeRedirectPath("/%2F%2Fevil.com")).toBe(false);
		});

		it('should return false for "/%2f%2fevil.com" (lowercase encoded double slash)', () => {
			expect(isSafeRedirectPath("/%2f%2fevil.com")).toBe(false);
		});

		it('should return false for "/%2f/evil.com" (mixed encoded slash)', () => {
			expect(isSafeRedirectPath("/%2f/evil.com")).toBe(false);
		});
	});

	describe("invalid cases - control characters", () => {
		it('should return false for "/path\\x00evil" (null byte)', () => {
			expect(isSafeRedirectPath("/path\x00evil")).toBe(false);
		});

		it('should return false for "/path\\r\\nHeader: inject" (CRLF injection)', () => {
			expect(isSafeRedirectPath("/path\r\nHeader: inject")).toBe(false);
		});

		it('should return false for "/path\\tinjection" (tab character)', () => {
			expect(isSafeRedirectPath("/path\tinjection")).toBe(false);
		});

		it('should return false for "/path\\x1F" (unit separator)', () => {
			expect(isSafeRedirectPath("/path\x1F")).toBe(false);
		});

		it('should return false for "/path\\x7F" (DEL character)', () => {
			expect(isSafeRedirectPath("/path\x7F")).toBe(false);
		});

		it('should return false for "\\n/ok" (control char before valid path)', () => {
			expect(isSafeRedirectPath("\n/ok")).toBe(false);
		});

		it('should return false for "\\r/ok" (control char before valid path)', () => {
			expect(isSafeRedirectPath("\r/ok")).toBe(false);
		});

		it('should return false for "/ok\\n" (trailing control char)', () => {
			expect(isSafeRedirectPath("/ok\n")).toBe(false);
		});
	});

	describe("invalid cases - leading/trailing whitespace on valid paths", () => {
		it('should return false for " /ok" (leading space on valid path)', () => {
			expect(isSafeRedirectPath(" /ok")).toBe(false);
		});

		it('should return false for "/ok " (trailing space on valid path)', () => {
			expect(isSafeRedirectPath("/ok ")).toBe(false);
		});
	});
});
