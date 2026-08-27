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
		const { resolve, promise } = deferred();
		const switchLocale = vi.fn().mockReturnValue(promise);
		const setPreferredLocale = vi.fn();
		const selectLocale = createLocaleSelector({
			getLocale: () => "en-US",
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
		const older = deferred();
		const newer = deferred();
		const switchLocale = vi.fn((code: string) =>
			code === "de-DE" ? older.promise : newer.promise,
		);
		const setPreferredLocale = vi.fn();
		const selectLocale = createLocaleSelector({
			getLocale: () => "en-US",
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
});
