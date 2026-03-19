import { describe, expect, it } from "vitest";

describe("screen composable exports", () => {
	it("should export breakpoints", () => {
		expect(breakpoints).toBeDefined();
	});

	it("should export isSmallScreen as a ref-like value", () => {
		expect(isSmallScreen).toBeDefined();
		expect(typeof isSmallScreen.value).toBe("boolean");
	});

	it("should export isMediumOrLargeScreen as a ref-like value", () => {
		expect(isMediumOrLargeScreen).toBeDefined();
		expect(typeof isMediumOrLargeScreen.value).toBe("boolean");
	});

	it("should export isExtraLargeScreen as a ref-like value", () => {
		expect(isExtraLargeScreen).toBeDefined();
		expect(typeof isExtraLargeScreen.value).toBe("boolean");
	});

	it("should have breakpoints with standard tailwind breakpoint methods", () => {
		expect(typeof breakpoints.smallerOrEqual).toBe("function");
		expect(typeof breakpoints.between).toBe("function");
		expect(typeof breakpoints.greaterOrEqual).toBe("function");
	});
});
