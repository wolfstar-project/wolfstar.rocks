import { isTransientNetworkError } from "#shared/utils/storage/transient-network-error";
import { describe, expect, it } from "vitest";

describe("isTransientNetworkError", () => {
	it("detects ECONNRESET by code", () => {
		const error = Object.assign(new Error("read ECONNRESET"), { code: "ECONNRESET" });
		expect(isTransientNetworkError(error)).toBe(true);
	});

	it("detects socket hang up by message", () => {
		expect(isTransientNetworkError(new Error("socket hang up"))).toBe(true);
	});

	it("detects undici socket errors via cause", () => {
		const cause = Object.assign(new Error("other side closed"), {
			code: "UND_ERR_SOCKET",
		});
		expect(isTransientNetworkError(new Error("fetch failed", { cause }))).toBe(true);
	});

	it("rejects unrelated errors", () => {
		expect(isTransientNetworkError(new Error("validation failed"))).toBe(false);
		expect(isTransientNetworkError(null)).toBe(false);
		expect(isTransientNetworkError({ code: "ENOENT" })).toBe(false);
	});
});
