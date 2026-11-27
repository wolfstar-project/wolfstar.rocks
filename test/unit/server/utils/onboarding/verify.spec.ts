import type { OnboardingStage } from "#shared/utils/onboarding";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("#server/database/prisma", () => ({ db: { orm: { root: true } } }));

const mocks = vi.hoisted(() => ({
	runtimeConfig: {
		public: { turnstileSiteKey: "site-key" },
		turnstileSecretKey: "secret",
	} as { public: { turnstileSiteKey: string }; turnstileSecretKey: string },
	read: vi.fn(),
	fetchWaitingOnboardingRows: vi.fn(),
	submitOnboardingRequest: vi.fn(),
	fetchOnboardingRequestRow: vi.fn(),
	verifyTurnstileToken: vi.fn(),
}));

vi.mock("#server/database/settings/onboarding/store", () => ({
	onboardingStore: { read: mocks.read },
}));
vi.mock("#server/database/settings/onboarding/requests", () => ({
	fetchOnboardingRequestRow: mocks.fetchOnboardingRequestRow,
	fetchWaitingOnboardingRows: mocks.fetchWaitingOnboardingRows,
	submitOnboardingRequest: mocks.submitOnboardingRequest,
}));
vi.mock("#server/utils/join-guard/turnstile", () => ({
	verifyTurnstileToken: mocks.verifyTurnstileToken,
}));
vi.mock("nuxt/server", async (importOriginal) => ({
	...(await importOriginal<typeof import("nuxt/server")>()),
	useRuntimeConfig: () => mocks.runtimeConfig,
}));

import {
	OnboardingCaptchaError,
	readOnboardingCaptchaPrompt,
	readOnboardingRequestState,
	submitOnboardingCaptcha,
} from "#server/utils/onboarding/verify";

const GUILD = "100000000000000000";
const MEMBER = "300000000000000001";
const NOW = Date.UTC(2026, 10, 27, 12);

const stage: OnboardingStage = {
	answers: [],
	challenge: "Captcha",
	createdAt: 0,
	enabled: true,
	failureAction: "None",
	failureTimeout: null,
	id: "7",
	maxAttempts: 3,
	name: "Captcha",
	position: 0,
	question: null,
	roleId: null,
	timeLimit: 600,
	trigger: "Join",
};
const row = { createdAt: NOW - 60_000, id: "40", stageId: "7", status: "Waiting" as const };

const submit = (overrides: Partial<Parameters<typeof submitOnboardingCaptcha>[0]> = {}) =>
	submitOnboardingCaptcha({
		guildId: GUILD,
		now: NOW,
		turnstileToken: "token",
		userId: MEMBER,
		verificationId: "40",
		...overrides,
	});

beforeEach(() => {
	vi.clearAllMocks();
	mocks.runtimeConfig.turnstileSecretKey = "secret";
	mocks.runtimeConfig.public.turnstileSiteKey = "site-key";
	mocks.read.mockResolvedValue({ enabled: true, stages: [stage] });
	mocks.fetchWaitingOnboardingRows.mockResolvedValue([row]);
	mocks.verifyTurnstileToken.mockResolvedValue({ ok: true });
	mocks.submitOnboardingRequest.mockResolvedValue("12");
});

describe("readOnboardingCaptchaPrompt", () => {
	it("shows the Captcha stage the member waits at, with the site key", async () => {
		expect(await readOnboardingCaptchaPrompt(GUILD, MEMBER, NOW)).toStrictEqual({
			expiresAt: new Date(row.createdAt + 600_000).toISOString(),
			siteKey: "site-key",
			stageName: "Captcha",
			verificationId: "40",
		});
	});

	it("shows nothing when the site cannot check a captcha", async () => {
		mocks.runtimeConfig.turnstileSecretKey = "";

		expect(await readOnboardingCaptchaPrompt(GUILD, MEMBER, NOW)).toBe(null);
		expect(mocks.read).not.toHaveBeenCalled();
	});
});

describe("submitOnboardingCaptcha", () => {
	it("asks the bot to pass the member once the captcha passed", async () => {
		expect(await submit()).toBe("12");
		expect(mocks.verifyTurnstileToken).toHaveBeenCalledWith("secret", "token");
		expect(mocks.submitOnboardingRequest).toHaveBeenCalledWith({
			guildId: GUILD,
			userId: MEMBER,
			verificationId: "40",
		});
	});

	it.each([
		["another stage than the one the page showed", { verificationId: "41" }],
		["a stage whose time ran out", { now: row.createdAt + 600_000 }],
	])("refuses %s before spending the token", async (_label, overrides) => {
		await expect(submit(overrides)).rejects.toStrictEqual(
			new OnboardingCaptchaError("notWaiting"),
		);
		expect(mocks.verifyTurnstileToken).not.toHaveBeenCalled();
		expect(mocks.submitOnboardingRequest).not.toHaveBeenCalled();
	});

	it("refuses a captcha Cloudflare refused, and writes no request", async () => {
		mocks.verifyTurnstileToken.mockResolvedValue({
			errorCodes: [],
			ok: false,
			reason: "refused",
		});

		await expect(submit()).rejects.toMatchObject({ code: "captcha" });
		expect(mocks.submitOnboardingRequest).not.toHaveBeenCalled();
	});

	it("says the captcha cannot be checked when Cloudflare is unreachable or the keys are gone", async () => {
		mocks.verifyTurnstileToken.mockResolvedValue({
			errorCodes: [],
			ok: false,
			reason: "unreachable",
		});
		await expect(submit()).rejects.toMatchObject({ code: "captchaUnavailable" });

		mocks.runtimeConfig.public.turnstileSiteKey = "";
		await expect(submit()).rejects.toMatchObject({ code: "captchaUnavailable" });
		expect(mocks.submitOnboardingRequest).not.toHaveBeenCalled();
	});
});

describe("readOnboardingRequestState", () => {
	it("reads why the bot could not pass the member", async () => {
		mocks.fetchOnboardingRequestRow.mockResolvedValue({
			error: "expired: The time of this stage ran out.",
			id: "12",
			processed: true,
		});

		expect(await readOnboardingRequestState(GUILD, MEMBER, "12")).toStrictEqual({
			error: { code: "expired", detail: "The time of this stage ran out." },
			id: "12",
			processed: true,
		});
		expect(mocks.fetchOnboardingRequestRow).toHaveBeenCalledWith(
			{ root: true },
			GUILD,
			MEMBER,
			"12",
		);
	});
});
