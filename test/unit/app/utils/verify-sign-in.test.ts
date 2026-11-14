import { isSafeRedirectPath } from "#shared/utils/redirect";
import { describe, expect, it } from "vitest";
import { verifySignInOptions } from "~/utils/verify-sign-in";

const GUILD = "100000000000000000";

describe("verifySignInOptions", () => {
	it("signs in through Discord and comes back to the verification page", () => {
		const options = verifySignInOptions(GUILD, { connections: false });

		expect(options).toStrictEqual({
			provider: "discord",
			callbackURL: `/oauth/callback?next=${encodeURIComponent(`/verify/${GUILD}`)}`,
			errorCallbackURL: "/oauth/callback",
		});
		const next = new URL(options.callbackURL, "https://wolfstar.rocks").searchParams.get(
			"next",
		);
		expect(next).toBe(`/verify/${GUILD}`);
		expect(isSafeRedirectPath(next)).toBe(true);
	});

	it("asks for connections on top of the usual scopes when the guild reads them", () => {
		expect(verifySignInOptions(GUILD, { connections: true }).scopes).toStrictEqual([
			"connections",
		]);
	});
});
