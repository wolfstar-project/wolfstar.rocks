import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { defineComponent } from "vue";

type Localize = ReturnType<typeof useAuthErrorMessage>["localizeAuthError"];

/**
 * `useAuthErrorMessage` needs a live `useI18n()`, so it is exercised through a
 * mounted component rather than called directly.
 */
async function withLocalize<T>(run: (localize: Localize) => T): Promise<T> {
	let result!: T;

	const TestComponent = defineComponent({
		setup() {
			const { localizeAuthError } = useAuthErrorMessage();
			result = run(localizeAuthError);
			return () => null;
		},
	});

	await mountSuspended(TestComponent);
	return result;
}

describe("useAuthErrorMessage", () => {
	it("falls back to the generic message when there is no error", async () => {
		const [fromNull, fromUndefined] = await withLocalize((localize) => [
			localize(null),
			localize(undefined),
		]);

		expect(fromNull).toBeTruthy();
		expect(fromUndefined).toBe(fromNull);
	});

	it("prefers a Better Auth error code over its message", async () => {
		// Better Auth reports both; only the code is a stable translation key.
		const [structured, codeOnly] = await withLocalize((localize) => [
			localize({ code: "SESSION_EXPIRED", message: "Session expired" }),
			localize("SESSION_EXPIRED"),
		]);

		expect(structured).toBe(codeOnly);
	});

	it("falls back to the message when the code has no translation", async () => {
		const message = await withLocalize((localize) =>
			localize({ code: "TOTALLY_UNKNOWN_CODE_XYZ", message: "Discord is unreachable" }),
		);

		expect(message).toBe("Discord is unreachable");
	});

	it("reads the first entry of a repeated query param", async () => {
		// `route.query.error` is `string | string[]` when the provider repeats it.
		const [fromArray, fromString] = await withLocalize((localize) => [
			localize(["SESSION_EXPIRED", "ignored"]),
			localize("SESSION_EXPIRED"),
		]);

		expect(fromArray).toBe(fromString);
	});

	it("returns the generic fallback for a blank error value", async () => {
		const [blank, empty] = await withLocalize((localize) => [localize("   "), localize(null)]);

		expect(blank).toBe(empty);
	});
});
