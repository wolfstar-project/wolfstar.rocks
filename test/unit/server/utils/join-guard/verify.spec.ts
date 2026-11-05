import type { H3Event } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("#server/database/prisma", () => ({ db: { orm: { root: true } } }));

const mocks = vi.hoisted(() => ({
	settings: {} as Record<string, unknown>,
	runtimeConfig: { public: { turnstileSiteKey: "site-key" }, turnstileSecretKey: "secret" },
	readFreshSettings: vi.fn(),
	fetchLatestJoinGuardCheckpoint: vi.fn(),
	submitJoinGuardRequest: vi.fn(),
	fetchJoinGuardRuleRow: vi.fn(),
	isOnJoinGuardSharedBanList: vi.fn(),
	getCurrentToken: vi.fn(),
	getCurrentUser: vi.fn(),
	getGuild: vi.fn(),
	readTokenScopes: vi.fn(),
	verifyTurnstileToken: vi.fn(),
	refreshSessionTokens: vi.fn(),
	userApi: { getCurrent: vi.fn(), getConnections: vi.fn() },
	botApi: { getMember: vi.fn() },
}));

vi.mock("#server/database/settings/functions", () => ({
	// Fresh, not cached: another instance or the bot may have changed the checks
	readFreshSettings: mocks.readFreshSettings,
}));
vi.mock("#server/database/settings/joinguard/checkpoints", () => ({
	fetchLatestJoinGuardCheckpoint: mocks.fetchLatestJoinGuardCheckpoint,
}));
vi.mock("#server/database/settings/joinguard/requests", () => ({
	submitJoinGuardRequest: mocks.submitJoinGuardRequest,
}));
vi.mock("#server/database/settings/joinguard/rules", () => ({
	fetchJoinGuardRuleRow: mocks.fetchJoinGuardRuleRow,
}));
vi.mock("#server/database/settings/joinguard/shared-bans", () => ({
	isOnJoinGuardSharedBanList: mocks.isOnJoinGuardSharedBanList,
}));
vi.mock("#server/utils/discord", () => ({
	getCurrentToken: mocks.getCurrentToken,
	getCurrentUser: mocks.getCurrentUser,
	getGuild: mocks.getGuild,
}));
vi.mock("#server/utils/discord/oauth", () => ({
	isDiscordUnauthorized: (error: { status?: number }) => error?.status === 401,
}));
vi.mock("#server/utils/discord/token-scopes", () => ({ readTokenScopes: mocks.readTokenScopes }));
vi.mock("#server/utils/join-guard/turnstile", () => ({
	verifyTurnstileToken: mocks.verifyTurnstileToken,
}));
vi.mock("#server/utils/oauth-tokens", () => ({ refreshSessionTokens: mocks.refreshSessionTokens }));
vi.mock("#server/utils/runtimeConfig", () => ({ runtimeConfig: mocks.runtimeConfig }));
vi.mock("#server/utils/shared", () => ({
	// With a REST client the API is the member's own; without one, the bot's.
	useApi: (rest?: unknown) =>
		rest === undefined ? { guilds: mocks.botApi } : { users: mocks.userApi },
}));

import {
	countLinkedAccounts,
	JoinGuardVerifyError,
	readJoinGuardVerifyGuestPage,
	readJoinGuardVerifyPage,
	submitJoinGuardVerification,
	throwJoinGuardVerifyError,
} from "#server/utils/join-guard/verify";

const GUILD = "100000000000000000";
const MEMBER = "300000000000000001";
const DAY = 86_400_000;
const NOW = Date.UTC(2026, 10, 5);
const event = {} as H3Event;

function waitingRow(overrides: Record<string, unknown> = {}) {
	return {
		id: "9",
		userId: MEMBER,
		ruleId: "2",
		status: "Waiting",
		accountCreatedAt: NOW - 30 * DAY,
		createdAt: NOW - DAY,
		...overrides,
	};
}

async function failure(promise: Promise<unknown>) {
	try {
		await promise;
	} catch (error) {
		return error as JoinGuardVerifyError;
	}
	throw new Error("expected the call to fail");
}

beforeEach(() => {
	vi.clearAllMocks();
	mocks.runtimeConfig.public.turnstileSiteKey = "site-key";
	mocks.runtimeConfig.turnstileSecretKey = "secret";
	mocks.settings = {
		joinGuardEnabled: true,
		joinGuardCheckpoint: true,
		joinGuardCaptcha: true,
		joinGuardConnections: true,
		joinGuardSharedBans: true,
		joinGuardMinimumTrust: 2,
	};
	mocks.readFreshSettings.mockImplementation(() => mocks.settings);
	mocks.getGuild.mockResolvedValue({ id: GUILD, name: "Wolves", icon: null });
	mocks.getCurrentToken.mockResolvedValue({ access_token: "member-token" });
	mocks.userApi.getCurrent.mockResolvedValue({
		id: MEMBER,
		username: "member",
		avatar: "abc",
		public_flags: 0,
	});
	mocks.readTokenScopes.mockResolvedValue(["identify", "connections"]);
	mocks.userApi.getConnections.mockResolvedValue([{ verified: true }, { verified: false }]);
	mocks.fetchLatestJoinGuardCheckpoint.mockResolvedValue(waitingRow());
	mocks.fetchJoinGuardRuleRow.mockResolvedValue({ accountAgeMax: 7 * 86_400 });
	mocks.isOnJoinGuardSharedBanList.mockResolvedValue(false);
	mocks.verifyTurnstileToken.mockResolvedValue({ ok: true });
	mocks.submitJoinGuardRequest.mockResolvedValue("77");
});

describe("readJoinGuardVerifyPage", () => {
	it("measures the trust of a member who waits, with what the guild checks", async () => {
		const page = await readJoinGuardVerifyPage(event, GUILD, NOW);

		expect(page).toStrictEqual({
			signedIn: true,
			guild: { id: GUILD, name: "Wolves", iconUrl: null },
			state: "waiting",
			checks: { captcha: true, connections: true, sharedBans: true },
			minimumTrust: 2,
			trust: { level: 2, linkedAccounts: 1, missing: [] },
			needsConnections: false,
			captchaSiteKey: "site-key",
		});
		expect(mocks.fetchJoinGuardRuleRow).toHaveBeenCalledWith({ root: true }, GUILD, "2");
		expect(mocks.fetchLatestJoinGuardCheckpoint).toHaveBeenCalledWith(
			{ root: true },
			GUILD,
			MEMBER,
		);
	});

	it("asks for connections when the sign-in did not grant them, and counts none", async () => {
		mocks.readTokenScopes.mockResolvedValue(["identify"]);

		const page = await readJoinGuardVerifyPage(event, GUILD, NOW);

		expect(page.needsConnections).toBe(true);
		expect(page.trust).toStrictEqual({
			level: 1,
			linkedAccounts: 0,
			missing: ["linkedAccount"],
		});
		expect(mocks.userApi.getConnections).not.toHaveBeenCalled();
	});

	it("asks to sign in again when Discord does not give the connections", async () => {
		mocks.userApi.getConnections.mockRejectedValue(new Error("Discord is down"));

		const page = await readJoinGuardVerifyPage(event, GUILD, NOW);

		// Not a member with no linked account: there is a way to try again.
		expect(page.needsConnections).toBe(true);
	});

	it("reads no connections, and asks for none, when the guild does not read them", async () => {
		mocks.settings.joinGuardConnections = false;

		const page = await readJoinGuardVerifyPage(event, GUILD, NOW);

		expect(page.needsConnections).toBe(false);
		expect(page.trust?.level).toBe(2);
		expect(mocks.readTokenScopes).not.toHaveBeenCalled();
	});

	it("gives no site key when the guild asks for no captcha, or the site has none", async () => {
		mocks.settings.joinGuardCaptcha = false;
		expect((await readJoinGuardVerifyPage(event, GUILD, NOW)).captchaSiteKey).toBeNull();

		mocks.settings.joinGuardCaptcha = true;
		mocks.runtimeConfig.public.turnstileSiteKey = "";
		expect((await readJoinGuardVerifyPage(event, GUILD, NOW)).captchaSiteKey).toBeNull();
	});

	it("is unavailable when the guard or its checkpoint is off, or the bot is not there", async () => {
		mocks.settings.joinGuardCheckpoint = false;
		expect(await readJoinGuardVerifyPage(event, GUILD, NOW)).toMatchObject({
			state: "unavailable",
			trust: null,
		});

		mocks.settings.joinGuardCheckpoint = true;
		mocks.getGuild.mockResolvedValue(null);
		mocks.getCurrentUser.mockResolvedValue({
			guilds: [{ id: GUILD, name: "Wolves (member's list)", icon: null }],
		});
		expect(await readJoinGuardVerifyPage(event, GUILD, NOW)).toMatchObject({
			guild: { name: "Wolves (member's list)" },
			state: "unavailable",
		});
		expect(mocks.fetchLatestJoinGuardCheckpoint).not.toHaveBeenCalled();
	});

	it("refuses a guild neither the bot nor the member is in", async () => {
		mocks.getGuild.mockResolvedValue(null);
		mocks.getCurrentUser.mockResolvedValue({ guilds: [] });

		expect(await failure(readJoinGuardVerifyPage(event, GUILD, NOW))).toMatchObject({
			code: "unknownGuild",
		});
	});

	it("tells a member the guard never stopped, and one it resolved", async () => {
		mocks.fetchLatestJoinGuardCheckpoint.mockResolvedValueOnce(null);
		expect((await readJoinGuardVerifyPage(event, GUILD, NOW)).state).toBe("notStopped");

		// A kicked member is no member anymore:
		mocks.fetchLatestJoinGuardCheckpoint.mockResolvedValueOnce(
			waitingRow({ status: "Kicked" }),
		);
		mocks.botApi.getMember.mockRejectedValueOnce(
			Object.assign(new Error("Unknown Member"), { code: 10_007 }),
		);
		expect(await readJoinGuardVerifyPage(event, GUILD, NOW)).toMatchObject({
			state: "kicked",
			trust: null,
		});

		mocks.fetchLatestJoinGuardCheckpoint.mockResolvedValueOnce(
			waitingRow({ status: "Verified" }),
		);
		mocks.botApi.getMember.mockResolvedValueOnce({
			joined_at: new Date(NOW - 2 * DAY).toISOString(),
		});
		expect((await readJoinGuardVerifyPage(event, GUILD, NOW)).state).toBe("verified");
	});

	it("reads a row of an earlier stay as not stopped", async () => {
		mocks.fetchLatestJoinGuardCheckpoint.mockResolvedValue(waitingRow({ status: "Left" }));
		mocks.botApi.getMember.mockResolvedValue({ joined_at: new Date(NOW).toISOString() });

		expect((await readJoinGuardVerifyPage(event, GUILD, NOW)).state).toBe("notStopped");
	});

	it("reads the account again with a refreshed token when Discord refuses the first", async () => {
		mocks.userApi.getCurrent.mockRejectedValueOnce({ status: 401 });
		mocks.refreshSessionTokens.mockResolvedValue({ access_token: "fresh-token" });

		expect((await readJoinGuardVerifyPage(event, GUILD, NOW)).state).toBe("waiting");
		expect(mocks.refreshSessionTokens).toHaveBeenCalledWith(event, { force: true });
		expect(mocks.readTokenScopes).toHaveBeenCalledWith("fresh-token");
	});
});

describe("readJoinGuardVerifyGuestPage", () => {
	it("answers only the guild and what its page checks, reading no member", async () => {
		expect(await readJoinGuardVerifyGuestPage(GUILD)).toStrictEqual({
			signedIn: false,
			guild: { id: GUILD, name: "Wolves", iconUrl: null },
			checks: { captcha: true, connections: true, sharedBans: true },
		});
		expect(mocks.getCurrentToken).not.toHaveBeenCalled();
		expect(mocks.fetchLatestJoinGuardCheckpoint).not.toHaveBeenCalled();
	});

	it("refuses a guild the bot is not in", async () => {
		mocks.getGuild.mockResolvedValue(null);

		expect(await failure(readJoinGuardVerifyGuestPage(GUILD))).toMatchObject({
			code: "unknownGuild",
		});
		expect(mocks.getCurrentUser).not.toHaveBeenCalled();
	});
});

describe("submitJoinGuardVerification", () => {
	it("checks the captcha and writes a pass with the trust measured again", async () => {
		const result = await submitJoinGuardVerification(
			event,
			GUILD,
			{ turnstileToken: "token" },
			NOW,
		);

		expect(result.requestId).toBe("77");
		expect(mocks.verifyTurnstileToken).toHaveBeenCalledWith("secret", "token");
		expect(mocks.submitJoinGuardRequest).toHaveBeenCalledWith({
			kind: "Pass",
			guildId: GUILD,
			userId: MEMBER,
			checkpointId: "9",
			trust: 2,
			linkedAccounts: 1,
		});
	});

	it("asks no captcha of a guild that does not ask for one", async () => {
		mocks.settings.joinGuardCaptcha = false;
		mocks.runtimeConfig.turnstileSecretKey = "";

		await submitJoinGuardVerification(event, GUILD, {}, NOW);

		expect(mocks.verifyTurnstileToken).not.toHaveBeenCalled();
		expect(mocks.submitJoinGuardRequest).toHaveBeenCalledOnce();
	});

	it.each([
		["the checkpoint is off", () => (mocks.settings.joinGuardEnabled = false), "unavailable"],
		[
			"the member does not wait",
			() =>
				mocks.fetchLatestJoinGuardCheckpoint.mockResolvedValue(
					waitingRow({ status: "Verified" }),
				),
			"notWaiting",
		],
		[
			"the guard never stopped the member",
			() => mocks.fetchLatestJoinGuardCheckpoint.mockResolvedValue(null),
			"notWaiting",
		],
		[
			"the account is on the shared ban list",
			() => mocks.isOnJoinGuardSharedBanList.mockResolvedValue(true),
			"sharedBan",
		],
		[
			"the site has no Turnstile secret",
			() => (mocks.runtimeConfig.turnstileSecretKey = ""),
			"captchaUnavailable",
		],
		[
			"Cloudflare cannot be asked",
			() =>
				mocks.verifyTurnstileToken.mockResolvedValue({
					ok: false,
					reason: "unreachable",
					errorCodes: [],
				}),
			"captchaUnavailable",
		],
		[
			"the token is refused",
			() =>
				mocks.verifyTurnstileToken.mockResolvedValue({
					ok: false,
					reason: "refused",
					errorCodes: ["invalid-input-response"],
				}),
			"captcha",
		],
	])("refuses when %s, and writes nothing", async (_name, arrange, code) => {
		arrange();

		expect(
			await failure(
				submitJoinGuardVerification(event, GUILD, { turnstileToken: "token" }, NOW),
			),
		).toMatchObject({ code });
		expect(mocks.submitJoinGuardRequest).not.toHaveBeenCalled();
	});

	it("refuses a trust below the minimum with the gaps, before spending the captcha", async () => {
		mocks.userApi.getConnections.mockResolvedValue([]);

		const error = await failure(
			submitJoinGuardVerification(event, GUILD, { turnstileToken: "token" }, NOW),
		);

		expect(error).toMatchObject({
			code: "trust",
			details: { level: 1, missing: ["linkedAccount"] },
		});
		expect(mocks.verifyTurnstileToken).not.toHaveBeenCalled();
	});
});

describe("throwJoinGuardVerifyError", () => {
	it.each([
		["unknownGuild", 404],
		["unavailable", 409],
		["notWaiting", 409],
		["captcha", 403],
		["captchaUnavailable", 503],
		["sharedBan", 403],
		["trust", 403],
	] as const)("answers %s with %i and its code", (code, status) => {
		const details = code === "trust" ? { level: 0 as const, missing: ["avatar" as const] } : {};

		expect(() => throwJoinGuardVerifyError(new JoinGuardVerifyError(code, details))).toThrow(
			expect.objectContaining({ statusCode: status, data: { code, ...details } }),
		);
	});

	it("lets another error through", () => {
		const error = new Error("boom");
		expect(() => throwJoinGuardVerifyError(error)).toThrow(error);
	});
});

describe("countLinkedAccounts", () => {
	it("counts the verified accounts that are not revoked", () => {
		expect(
			countLinkedAccounts([
				{ verified: true },
				{ verified: true, revoked: true },
				{ verified: false },
			] as never),
		).toBe(1);
	});
});
