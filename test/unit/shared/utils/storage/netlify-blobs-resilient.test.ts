import { beforeEach, describe, expect, it, vi } from "vitest";

const { getItemMock, getKeysMock, netlifyBlobsDriverMock, removeItemMock, setItemMock } =
	vi.hoisted(() => {
		const getKeysMock = vi.fn();
		const getItemMock = vi.fn();
		const setItemMock = vi.fn();
		const removeItemMock = vi.fn();
		const netlifyBlobsDriverMock = vi.fn((_options?: { name?: string; fetch?: unknown }) => ({
			name: "netlify-blobs",
			getKeys: getKeysMock,
			getItem: getItemMock,
			setItem: setItemMock,
			removeItem: removeItemMock,
		}));
		return { getItemMock, getKeysMock, netlifyBlobsDriverMock, removeItemMock, setItemMock };
	});

vi.mock("unstorage/drivers/netlify-blobs", () => ({
	default: netlifyBlobsDriverMock,
}));

vi.mock("#shared/utils/storage/resilient-fetch", () => ({
	createResilientNetlifyBlobsFetch: () => vi.fn(),
}));

/** Constructs a fake BlobsInternalError with a token-expired message. */
function makeBlobsTokenExpiredError() {
	return Object.assign(new Error("Netlify Blobs has generated an internal error (Token expired)"), {
		name: "BlobsInternalError",
	});
}

describe("netlify-blobs-resilient driver", () => {
	beforeEach(() => {
		getKeysMock.mockReset();
		getItemMock.mockReset();
		setItemMock.mockReset();
		removeItemMock.mockReset();
		netlifyBlobsDriverMock.mockClear();
	});

	it("passes a resilient fetch into the base netlify-blobs driver", async () => {
		const { default: createDriver } =
			await import("#shared/utils/storage/netlify-blobs-resilient");
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

		const { default: createDriver } =
			await import("#shared/utils/storage/netlify-blobs-resilient");
		const driver = createDriver({ name: "cache" });

		await expect(driver.getKeys?.("nitro:handlers:i18n", {})).resolves.toEqual([]);
	});

	it("rethrows non-transient getKeys errors", async () => {
		getKeysMock.mockRejectedValueOnce(new Error("unauthorized"));

		const { default: createDriver } =
			await import("#shared/utils/storage/netlify-blobs-resilient");
		const driver = createDriver({ name: "cache" });

		await expect(driver.getKeys?.("nitro:handlers:i18n", {})).rejects.toThrow("unauthorized");
	});

	describe("getItem", () => {
		it("returns null (cache miss) when the Blobs token has expired", async () => {
			getItemMock.mockRejectedValueOnce(makeBlobsTokenExpiredError());

			const { default: createDriver } =
				await import("#shared/utils/storage/netlify-blobs-resilient");
			const driver = createDriver({ name: "cache" });

			await expect(driver.getItem?.("some:key", {})).resolves.toBeNull();
		});

		it("rethrows non-token-expiry BlobsInternalErrors from getItem", async () => {
			const otherBlobsError = Object.assign(new Error("Some other Blobs failure"), {
				name: "BlobsInternalError",
			});
			getItemMock.mockRejectedValueOnce(otherBlobsError);

			const { default: createDriver } =
				await import("#shared/utils/storage/netlify-blobs-resilient");
			const driver = createDriver({ name: "cache" });

			await expect(driver.getItem?.("some:key", {})).rejects.toThrow(
				"Some other Blobs failure",
			);
		});

		it("rethrows unrelated errors from getItem", async () => {
			getItemMock.mockRejectedValueOnce(new Error("network failure"));

			const { default: createDriver } =
				await import("#shared/utils/storage/netlify-blobs-resilient");
			const driver = createDriver({ name: "cache" });

			await expect(driver.getItem?.("some:key", {})).rejects.toThrow("network failure");
		});
	});

	describe("setItem", () => {
		it("silently swallows token-expired errors on setItem", async () => {
			setItemMock.mockRejectedValueOnce(makeBlobsTokenExpiredError());

			const { default: createDriver } =
				await import("#shared/utils/storage/netlify-blobs-resilient");
			const driver = createDriver({ name: "cache" });

			await expect(driver.setItem?.("some:key", "value", {})).resolves.toBeUndefined();
		});

		it("rethrows non-token-expiry errors from setItem", async () => {
			setItemMock.mockRejectedValueOnce(new Error("write failed"));

			const { default: createDriver } =
				await import("#shared/utils/storage/netlify-blobs-resilient");
			const driver = createDriver({ name: "cache" });

			await expect(driver.setItem?.("some:key", "value", {})).rejects.toThrow("write failed");
		});
	});

	describe("removeItem", () => {
		it("silently swallows token-expired errors on removeItem", async () => {
			removeItemMock.mockRejectedValueOnce(makeBlobsTokenExpiredError());

			const { default: createDriver } =
				await import("#shared/utils/storage/netlify-blobs-resilient");
			const driver = createDriver({ name: "cache" });

			await expect(driver.removeItem?.("some:key", {})).resolves.toBeUndefined();
		});

		it("rethrows non-token-expiry errors from removeItem", async () => {
			removeItemMock.mockRejectedValueOnce(new Error("delete failed"));

			const { default: createDriver } =
				await import("#shared/utils/storage/netlify-blobs-resilient");
			const driver = createDriver({ name: "cache" });

			await expect(driver.removeItem?.("some:key", {})).rejects.toThrow("delete failed");
		});
	});
});
