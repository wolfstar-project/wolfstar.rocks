import { describe, expect, it, vi } from "vitest";
import { createLocaleSelector } from "../../../../app/composables/useAppLocale";

function deferred<T = void>() {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

describe("createLocaleSelector", () => {
	it("ignores an unknown locale code", async () => {
		const switchLocale = vi.fn();
		const setPreferredLocale = vi.fn();
		const selectLocale = createLocaleSelector({
			getLocale: () => "en-US",
			switchLocale,
			setPreferredLocale,
		});

		await selectLocale("not-a-real-locale");

		expect(switchLocale).not.toHaveBeenCalled();
		expect(setPreferredLocale).not.toHaveBeenCalled();
	});

	it("ignores a selection matching the active locale", async () => {
		const switchLocale = vi.fn();
		const setPreferredLocale = vi.fn();
		const selectLocale = createLocaleSelector({
			getLocale: () => "en-US",
			switchLocale,
			setPreferredLocale,
		});

		await selectLocale("en-US");

		expect(switchLocale).not.toHaveBeenCalled();
		expect(setPreferredLocale).not.toHaveBeenCalled();
	});

	it("persists the preference only once the switch resolves", async () => {
		let currentLocale = "en-US";
		const { resolve, promise } = deferred();
		const switchLocale = vi.fn().mockImplementation((code: string) =>
			promise.then(() => {
				currentLocale = code;
			}),
		);
		const setPreferredLocale = vi.fn();
		const selectLocale = createLocaleSelector({
			getLocale: () => currentLocale,
			switchLocale,
			setPreferredLocale,
		});

		const selection = selectLocale("de-DE");
		expect(setPreferredLocale).not.toHaveBeenCalled();

		resolve();
		await selection;

		expect(setPreferredLocale).toHaveBeenCalledExactlyOnceWith("de-DE");
	});

	it("does not persist a locale whose switch rejected", async () => {
		const { reject, promise } = deferred();
		const switchLocale = vi.fn().mockReturnValue(promise);
		const setPreferredLocale = vi.fn();
		const selectLocale = createLocaleSelector({
			getLocale: () => "en-US",
			switchLocale,
			setPreferredLocale,
		});

		const selection = selectLocale("de-DE");
		reject(new Error("network error"));

		await expect(selection).rejects.toThrow("network error");
		expect(setPreferredLocale).not.toHaveBeenCalled();
	});

	it("keeps the most recently requested locale even if an older switch resolves later", async () => {
		let currentLocale = "en-US";
		const older = deferred();
		const newer = deferred();
		const switchLocale = vi.fn((code: string) => {
			const settle = code === "de-DE" ? older.promise : newer.promise;
			return settle.then(() => {
				currentLocale = code;
			});
		});
		const setPreferredLocale = vi.fn();
		const selectLocale = createLocaleSelector({
			getLocale: () => currentLocale,
			switchLocale,
			setPreferredLocale,
		});

		const olderSelection = selectLocale("de-DE");
		const newerSelection = selectLocale("fr-FR");

		// The newer request completes first...
		newer.resolve();
		await newerSelection;
		expect(setPreferredLocale).toHaveBeenCalledExactlyOnceWith("fr-FR");

		// ...and the stale older request must not overwrite it once it finally
		// resolves too.
		older.resolve();
		await olderSelection;
		expect(setPreferredLocale).toHaveBeenCalledExactlyOnceWith("fr-FR");
	});

	it("persists the locale an older request already applied when the newest request fails", async () => {
		let currentLocale = "en-US";
		const older = deferred(); // de-DE
		const newer = deferred(); // fr-FR, rejects
		const switchLocale = vi.fn((code: string) =>
			(code === "de-DE" ? older.promise : newer.promise).then(() => {
				currentLocale = code;
			}),
		);
		const setPreferredLocale = vi.fn();
		const selectLocale = createLocaleSelector({
			getLocale: () => currentLocale,
			switchLocale,
			setPreferredLocale,
		});

		const olderSelection = selectLocale("de-DE");
		const newerSelection = selectLocale("fr-FR");

		// The older request succeeds first and actually becomes the active
		// locale, but its own requestId is already stale, so it must not persist.
		older.resolve();
		await olderSelection;
		expect(setPreferredLocale).not.toHaveBeenCalled();

		// The newest request then fails without ever taking effect. Its failure
		// must reconcile by persisting the locale that is actually active now
		// (de-DE), not silently leave `wolfstar-settings` on the pre-selection
		// value.
		newer.reject(new Error("network error"));
		await expect(newerSelection).rejects.toThrow("network error");
		expect(setPreferredLocale).toHaveBeenCalledExactlyOnceWith("de-DE");
	});

	it("persists an older request's success once a newer request that failed first is out of the running", async () => {
		let currentLocale = "en-US";
		const older = deferred(); // de-DE, resolves last
		const newer = deferred(); // fr-FR, rejects first, never applied
		const switchLocale = vi.fn((code: string) =>
			code === "de-DE"
				? older.promise.then(() => {
						currentLocale = code;
					})
				: newer.promise,
		);
		const setPreferredLocale = vi.fn();
		const selectLocale = createLocaleSelector({
			getLocale: () => currentLocale,
			switchLocale,
			setPreferredLocale,
		});

		const olderSelection = selectLocale("de-DE");
		const newerSelection = selectLocale("fr-FR");

		// The newest request fails while the older one is still pending: there
		// is no way yet to know whether de-DE will end up as the final word, so
		// nothing should persist.
		newer.reject(new Error("network error"));
		await expect(newerSelection).rejects.toThrow("network error");
		expect(setPreferredLocale).not.toHaveBeenCalled();

		// The older request then succeeds. Its requestId is stale relative to
		// the newer one, but the newer one is no longer a contender — it already
		// failed — so de-DE's success is the final, and only, word.
		older.resolve();
		await olderSelection;
		expect(setPreferredLocale).toHaveBeenCalledExactlyOnceWith("de-DE");
	});

	it("persists the locale a switch actually applied even when it rejects afterward", async () => {
		let currentLocale = "en-US";
		const switchLocale = vi.fn(async (code: string) => {
			// The locale is applied first; a later step in the same call (e.g.
			// persisting the choice remotely) fails afterward.
			currentLocale = code;
			throw new Error("failed to sync locale preference");
		});
		const setPreferredLocale = vi.fn();
		const selectLocale = createLocaleSelector({
			getLocale: () => currentLocale,
			switchLocale,
			setPreferredLocale,
		});

		await expect(selectLocale("fr-FR")).rejects.toThrow("failed to sync locale preference");

		expect(setPreferredLocale).toHaveBeenCalledExactlyOnceWith("fr-FR");
	});
});
