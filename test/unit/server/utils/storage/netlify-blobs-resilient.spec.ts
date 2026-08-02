import { beforeEach, describe, expect, it, vi } from "vitest";

const { getKeysMock, netlifyBlobsDriverMock } = vi.hoisted(() => {
	const getKeysMock = vi.fn();
	const netlifyBlobsDriverMock = vi.fn(() => ({
		name: "netlify-blobs",
		getKeys: getKeysMock,
		getItem: vi.fn(),
	}));
	return { getKeysMock, netlifyBlobsDriverMock };
});

vi.mock("unstorage/drivers/netlify-blobs", () => ({
	default: netlifyBlobsDriverMock,
}));

vi.mock("#server/utils/storage/resilient-fetch", () => ({
	createResilientNetlifyBlobsFetch: () => vi.fn(),
}));

describe("netlify-blobs-resilient driver", () => {
	beforeEach(() => {
		getKeysMock.mockReset();
		netlifyBlobsDriverMock.mockClear();
	});

	it("passes a resilient fetch into the base netlify-blobs driver", async () => {
		const { default: createDriver } = await import(
			"#server/utils/storage/netlify-blobs-resilient"
		);
		createDriver({ name: "cache", driver: "/virtual/driver" });

		expect(netlifyBlobsDriverMock).toHaveBeenCalledOnce();
		const options = netlifyBlobsDriverMock.mock.calls[0]?.[0] as {
			name?: string;
			fetch?: unknown;
			driver?: string;
		};
		expect(options.name).toBe("cache");
		expect(options.fetch).toBeTypeOf("function");
		expect(options.driver).toBeUndefined();
	});

	it("fail-opens getKeys on transient network errors", async () => {
		const hangUp = Object.assign(new Error("socket hang up"), { code: "ECONNRESET" });
		getKeysMock.mockRejectedValueOnce(hangUp);

		const { default: createDriver } = await import(
			"#server/utils/storage/netlify-blobs-resilient"
		);
		const driver = createDriver({ name: "cache" });

		await expect(driver.getKeys?.("nitro:handlers:i18n")).resolves.toEqual([]);
	});

	it("rethrows non-transient getKeys errors", async () => {
		getKeysMock.mockRejectedValueOnce(new Error("unauthorized"));

		const { default: createDriver } = await import(
			"#server/utils/storage/netlify-blobs-resilient"
		);
		const driver = createDriver({ name: "cache" });

		await expect(driver.getKeys?.("nitro:handlers:i18n")).rejects.toThrow("unauthorized");
	});
});
