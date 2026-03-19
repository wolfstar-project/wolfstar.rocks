import { describe, expect, it } from "vitest";

describe("getClientId", () => {
	it("should return a string from runtime config", () => {
		const clientId = getClientId();
		expect(typeof clientId).toBe("string");
		expect(clientId.length).toBeGreaterThan(0);
	});
});

describe("getOrigin", () => {
	it("should return a string starting with http", () => {
		const origin = getOrigin();
		expect(typeof origin).toBe("string");
		expect(origin).toMatch(/^https?:\/\//);
	});
});

describe("getConfiguredOrigin", () => {
	it("should be a function", () => {
		expect(typeof getConfiguredOrigin).toBe("function");
	});
});
