import type { BotSessionData } from "#server/utils/bot-api/session";
import { createDecipheriv } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { config, fetchMock } = vi.hoisted(() => {
	const config = {
		botApiOauthSecret: "0123456789abcdef0123456789abcdef",
		botApiOauthCookie: "WOLFSTAR_AUTH",
		public: { apiBaseUrl: "https://api.wolfstar.test" },
	};
	const fetchMock = vi.fn();
	const globals = globalThis as Record<string, unknown>;
	globals["useRuntimeConfig"] = () => config;
	return { config, fetchMock };
});

vi.mock("ofetch", () => ({ $fetch: fetchMock }));

vi.mock("#server/utils/sentry-metrics", () => ({
	instrumentBotApiCall: (_route: string, run: () => unknown) => run(),
}));

import {
	BotBridgeSessionToken,
	botApiFetch,
	encryptBotSession,
} from "#server/utils/bot-api/session";

const secret = config.botApiOauthSecret;

/** The bot's `Auth#decrypt`, as `projects/bot/src/lib/api/Auth.ts` reads a cookie. */
function botDecrypt(token: string, key: string): BotSessionData | null {
	const [data = "", iv = ""] = token.split(".");
	try {
		const decipher = createDecipheriv("aes-256-cbc", key, Buffer.from(iv, "base64"));
		const parsed = JSON.parse(
			decipher.update(data, "base64", "utf8") + decipher.final("utf8"),
		) as BotSessionData;
		return parsed.expires >= Date.now() ? parsed : null;
	} catch {
		return null;
	}
}

const session: BotSessionData = {
	id: "266624760782258186",
	token: "",
	refresh: "",
	expires: Date.now() + 60_000,
};

describe("encryptBotSession", () => {
	it("is read back by the bot with the same secret", () => {
		expect(botDecrypt(encryptBotSession(session, secret), secret)).toStrictEqual(session);
	});

	it("draws a new IV each time, so two sessions never look alike", () => {
		const first = encryptBotSession(session, secret);
		const second = encryptBotSession(session, secret);

		expect(first.split(".")[1]).not.toBe(second.split(".")[1]);
		expect(first).not.toBe(second);
	});

	it("is refused by the bot once it expired, or with another secret", () => {
		const expired = encryptBotSession({ ...session, expires: Date.now() - 1 }, secret);

		expect(botDecrypt(expired, secret)).toBeNull();
		expect(
			botDecrypt(encryptBotSession(session, secret), "fedcba9876543210fedcba9876543210"),
		).toBeNull();
	});
});

describe("botApiFetch", () => {
	beforeEach(() => {
		vi.useFakeTimers({ now: Date.UTC(2026, 10, 4) });
		fetchMock.mockReset().mockResolvedValue({ ok: true });
	});

	afterEach(() => {
		vi.useRealTimers();
		config.botApiOauthSecret = secret;
	});

	it("calls the API as the user, with a session that lives a minute", async () => {
		await expect(
			botApiFetch("266624760782258186", "/appeals/254360814063058944"),
		).resolves.toStrictEqual({ ok: true });

		const [url, init] = fetchMock.mock.calls[0] as [
			string,
			{ method: string; headers: Record<string, string> },
		];
		expect(url).toBe("https://api.wolfstar.test/appeals/254360814063058944");
		expect(init.method).toBe("GET");

		const cookie = init.headers["Cookie"] ?? "";
		expect(cookie.startsWith("WOLFSTAR_AUTH=")).toBe(true);
		const value = decodeURIComponent(cookie.slice("WOLFSTAR_AUTH=".length));
		expect(botDecrypt(value, secret)).toStrictEqual({
			id: "266624760782258186",
			token: BotBridgeSessionToken,
			refresh: "",
			expires: Date.UTC(2026, 10, 4) + 60_000,
		});
	});

	it("carries a token, as the bot's `authenticated()` answers 401 to a session without one", async () => {
		await botApiFetch("266624760782258186", "/appeals/254360814063058944");

		const [, init] = fetchMock.mock.calls[0] as [string, { headers: Record<string, string> }];
		const value = decodeURIComponent(
			(init.headers["Cookie"] ?? "").slice("WOLFSTAR_AUTH=".length),
		);
		expect(Boolean(botDecrypt(value, secret)?.token)).toBe(true);
	});

	it("sends the body of a POST", async () => {
		await botApiFetch("1", "/appeals/2/builtin", {
			method: "POST",
			body: { caseId: 3, answers: {} },
		});

		expect(fetchMock).toHaveBeenCalledWith(
			"https://api.wolfstar.test/appeals/2/builtin",
			expect.objectContaining({ method: "POST", body: { caseId: 3, answers: {} } }),
		);
	});

	it("answers 503 without calling the bot when the bridge has no secret", () => {
		config.botApiOauthSecret = "";

		expect(() => botApiFetch("1", "/appeals/2")).toThrow(
			expect.objectContaining({
				status: 503,
				message: "Appeals cannot be sent from the website right now",
			}),
		);
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
