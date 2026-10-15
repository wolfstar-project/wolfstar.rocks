import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { createError } from "h3";
import { describe, expect, it } from "vitest";
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
	// Switching twice quickly sends two requests; the first one failing last
	// must not bring back what was shown before either of them.
	it("keeps the newest change when an older save settles later", async () => {
		const firstHeld = deferred();
		const secondDone = deferred();
		let patches = 0;
		registerEndpoint("/api/users/settings", {
			method: "PATCH",
			handler: async () => {
				patches += 1;
				if (patches === 1) {
					await firstHeld.promise;
					throw createError({ statusCode: 503 });
				}
				secondDone.resolve();
				return { report: true };
			},
		});
		const { settings } = await setup();

		const off = settings.setReport(false);
		const on = settings.setReport(true);
		await secondDone.promise;
		expect(await on).toBe(true);
		firstHeld.resolve();
		expect(await off).toBe(false);

		expect(settings.data.value).toEqual({ report: true });
	});
});
