import { beforeEach, describe, expect, it, vi } from "vitest";

const { getKeysMock, getItemMock, setItemMock, removeItemMock, netlifyBlobsDriverMock } =
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
		return { getKeysMock, getItemMock, setItemMock, removeItemMock, netlifyBlobsDriverMock };
	});

vi.mock("unstorage/drivers/netlify-blobs", () => ({
	default: netlifyBlobsDriverMock,
}));

vi.mock("#shared/utils/storage/resilient-fetch", () => ({
	createResilientNetlifyBlobsFetch: () => vi.fn(),
}));

describe("netlify-blobs-resilient driver", () => {
	beforeEach(() => {
		getKeysMock.mockReset();
		getItemMock.mockReset();
		setItemMock.mockReset();
		removeItemMock.mockReset();
		netlifyBlobsDriverMock.mockClear();
	});

	function tokenExpiredError() {
		return Object.assign(
			new Error(
				"Netlify Blobs has generated an internal error (Failed to decode token: Token expired)",
			),
			{ name: "BlobsInternalError" },
		);
	}

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

	it("fail-opens getItem/setItem/removeItem on an expired Blobs token", async () => {
		getItemMock.mockRejectedValueOnce(tokenExpiredError());
		setItemMock.mockRejectedValueOnce(tokenExpiredError());
		removeItemMock.mockRejectedValueOnce(tokenExpiredError());

		const { default: createDriver } =
			await import("#shared/utils/storage/netlify-blobs-resilient");
		const driver = createDriver({ name: "cache" });

		await expect(driver.getItem?.("key", {})).resolves.toBeNull();
		await expect(driver.setItem?.("key", "value", {})).resolves.toBeUndefined();
		await expect(driver.removeItem?.("key", {})).resolves.toBeUndefined();
	});

	it("rethrows non-transient getItem/setItem/removeItem errors", async () => {
		getItemMock.mockRejectedValueOnce(new Error("unauthorized"));
		setItemMock.mockRejectedValueOnce(new Error("unauthorized"));
		removeItemMock.mockRejectedValueOnce(new Error("unauthorized"));

		const { default: createDriver } =
			await import("#shared/utils/storage/netlify-blobs-resilient");
		const driver = createDriver({ name: "cache" });

		await expect(driver.getItem?.("key", {})).rejects.toThrow("unauthorized");
		await expect(driver.setItem?.("key", "value", {})).rejects.toThrow("unauthorized");
		await expect(driver.removeItem?.("key", {})).rejects.toThrow("unauthorized");
	});

	it("retries setItem/removeItem through a transient error instead of dropping the mutation", async () => {
		setItemMock.mockRejectedValueOnce(tokenExpiredError()).mockResolvedValueOnce(undefined);
		removeItemMock.mockRejectedValueOnce(tokenExpiredError()).mockResolvedValueOnce(undefined);

		const { default: createDriver } =
			await import("#shared/utils/storage/netlify-blobs-resilient");
		const driver = createDriver({ name: "cache" });

		await expect(driver.setItem?.("key", "value", {})).resolves.toBeUndefined();
		await expect(driver.removeItem?.("key", {})).resolves.toBeUndefined();
		expect(setItemMock).toHaveBeenCalledTimes(2);
		expect(removeItemMock).toHaveBeenCalledTimes(2);
	});

	it("fail-opens setItem/removeItem after exhausting retries on a persistent transient error", async () => {
		setItemMock.mockRejectedValue(tokenExpiredError());
		removeItemMock.mockRejectedValue(tokenExpiredError());

		const { default: createDriver } =
			await import("#shared/utils/storage/netlify-blobs-resilient");
		const driver = createDriver({ name: "cache" });

		await expect(driver.setItem?.("key", "value", {})).resolves.toBeUndefined();
		await expect(driver.removeItem?.("key", {})).resolves.toBeUndefined();
		expect(setItemMock).toHaveBeenCalledTimes(3);
		expect(removeItemMock).toHaveBeenCalledTimes(3);
	});
});
