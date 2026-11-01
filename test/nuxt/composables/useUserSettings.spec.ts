import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { createError } from "h3";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";

function deferred() {
	let resolve!: () => void;
	const promise = new Promise<void>((res) => {
		resolve = res;
	});
	return { promise, resolve };
}

async function setup() {
	let settings!: ReturnType<typeof useUserSettings>;
	await mountSuspended(
		defineComponent({
			setup() {
				settings = useUserSettings();
				return () => h("div");
			},
		}),
	);
	// Wrapped, since the composable is also a promise and `await` would unwrap it.
	return { settings };
}

describe("useUserSettings", () => {
	// Switching quickly must leave the newest choice saved: the saves go out
	// in order, and one overtaken while it waited is never sent.
	it("saves quick changes in order, the newest last", async () => {
		const firstHeld = deferred();
		let patches = 0;
		let firstDone = false;
		let secondAfterFirst = false;
		registerEndpoint("/api/users/settings", {
			method: "PATCH",
			handler: async () => {
				patches += 1;
				if (patches === 1) {
					await firstHeld.promise;
					firstDone = true;
				} else {
					secondAfterFirst = firstDone;
				}
				return { report: false };
			},
		});
		const { settings } = await setup();

		const first = settings.setReport(false);
		await vi.waitFor(() => expect(patches).toBe(1));
		const overtaken = settings.setReport(true);
		const newest = settings.setReport(false);
		expect(settings.data.value).toEqual({ report: false });

		firstHeld.resolve();
		expect(await Promise.all([first, overtaken, newest])).toEqual([true, true, true]);

		// The overtaken change is never sent, and the newest goes out last.
		expect(patches).toBe(2);
		expect(secondAfterFirst).toBe(true);
		expect(settings.data.value).toEqual({ report: false });
	});

	// The first save failing after a newer change must not bring back what was
	// shown before either of them.
	it("keeps the newest change when an older save fails", async () => {
		const firstHeld = deferred();
		let patches = 0;
		registerEndpoint("/api/users/settings", {
			method: "PATCH",
			handler: async () => {
				patches += 1;
				if (patches === 1) {
					await firstHeld.promise;
					throw createError({ statusCode: 503 });
				}
				return { report: true };
			},
		});
		const { settings } = await setup();

		const off = settings.setReport(false);
		await vi.waitFor(() => expect(patches).toBe(1));
		const on = settings.setReport(true);
		firstHeld.resolve();
		expect(await off).toBe(false);
		expect(await on).toBe(true);

		expect(settings.data.value).toEqual({ report: true });
	});
});
