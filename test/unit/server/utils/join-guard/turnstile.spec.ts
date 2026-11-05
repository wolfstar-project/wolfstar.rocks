import { verifyTurnstileToken } from "#server/utils/join-guard/turnstile";
import { describe, expect, it, vi } from "vitest";

describe("verifyTurnstileToken", () => {
	it("asks siteverify with the secret and the token, and no IP", async () => {
		const fetcher = vi.fn().mockResolvedValue({ success: true });

		expect(await verifyTurnstileToken("secret", "token", fetcher)).toStrictEqual({ ok: true });
		expect(fetcher).toHaveBeenCalledExactlyOnceWith(
			"https://challenges.cloudflare.com/turnstile/v0/siteverify",
			{ method: "POST", body: { secret: "secret", response: "token" } },
		);
	});

	it("refuses a token Cloudflare refuses, with its codes", async () => {
		const fetcher = vi
			.fn()
			.mockResolvedValue({ "success": false, "error-codes": ["timeout-or-duplicate"] });

		expect(await verifyTurnstileToken("secret", "token", fetcher)).toStrictEqual({
			ok: false,
			reason: "refused",
			errorCodes: ["timeout-or-duplicate"],
		});
	});

	it("refuses a missing token without asking Cloudflare", async () => {
		const fetcher = vi.fn();

		expect(await verifyTurnstileToken("secret", undefined, fetcher)).toMatchObject({
			ok: false,
			reason: "missing",
		});
		expect(await verifyTurnstileToken("secret", "", fetcher)).toMatchObject({
			reason: "missing",
		});
		expect(fetcher).not.toHaveBeenCalled();
	});

	it("tells Cloudflare could not be asked", async () => {
		const fetcher = vi.fn().mockRejectedValue(new Error("network"));

		expect(await verifyTurnstileToken("secret", "token", fetcher)).toMatchObject({
			ok: false,
			reason: "unreachable",
		});
	});
});
