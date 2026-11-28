import type {
	OnboardingCaptchaPrompt,
	OnboardingRequestState,
	OnboardingCaptchaWait,
} from "#shared/utils/onboarding";
import type { Snowflake } from "discord-api-types/v10";
import { db } from "#server/database/prisma";
import {
	fetchOnboardingRequestRow,
	fetchWaitingOnboardingRows,
	submitOnboardingRequest,
} from "#server/database/settings/onboarding/requests";
import { onboardingStore } from "#server/database/settings/onboarding/store";
import { verifyTurnstileToken } from "#server/utils/join-guard/turnstile";
import { isOnboardingCaptchaAvailable } from "#server/utils/onboarding/captcha";
import { useApi } from "#server/utils/shared";
import { findOnboardingCaptchaWait, parseOnboardingRequestError } from "#shared/utils/onboarding";
import { createError as createH3Error, useRuntimeConfig } from "nuxt/server";

/** Why the page refuses to ask the bot to pass a member at a `Captcha` stage. */
export type OnboardingCaptchaErrorCode =
	/** The member waits at no `Captcha` stage, or not at the one the page showed. */
	| "notWaiting"
	/** The token is missing, or Cloudflare refused it. */
	| "captcha"
	/** The site has no Turnstile keys, or Cloudflare cannot be reached. */
	| "captchaUnavailable";

const ERROR_RESPONSES = {
	captcha: [403, "The captcha was not passed"],
	captchaUnavailable: [503, "The captcha cannot be checked now"],
	notWaiting: [409, "You do not wait at this stage"],
} as const satisfies Record<OnboardingCaptchaErrorCode, readonly [number, string]>;

export class OnboardingCaptchaError extends Error {
	public constructor(public readonly code: OnboardingCaptchaErrorCode) {
		super(`Onboarding captcha error: ${code}`);
	}
}

/**
 * Answers a request with why the page refused, `{ code }` in the body.
 * Anything that is not an {@linkcode OnboardingCaptchaError} is thrown again.
 */
export function throwOnboardingCaptchaError(error: unknown): never {
	if (!(error instanceof OnboardingCaptchaError)) throw error;

	const [statusCode, statusMessage] = ERROR_RESPONSES[error.code];
	throw createH3Error({
		data: { code: error.code },
		message: statusMessage,
		statusCode,
		statusMessage,
	});
}

/**
 * When the member last joined the guild, which Discord is asked for fresh:
 * a row written before it is of a stay that ended. `null` when Discord cannot
 * say, or the member is not in the guild (the bot refuses them then).
 */
async function readJoinedAt(guildId: Snowflake, userId: Snowflake): Promise<number | null> {
	try {
		const member = await useApi().guilds.getMember(guildId, userId);
		const joinedAt = Date.parse(member.joined_at ?? "");
		return Number.isFinite(joinedAt) ? joinedAt : null;
	} catch {
		// Not a member (Unknown Member), or Discord could not say: every row is read, as the bot does.
		return null;
	}
}

/**
 * The `Captcha` stage a member waits at in a guild, read fresh from the
 * database. Discord is asked when the member joined only when a row could be
 * served: the page of a member who waits at no `Captcha` stage asks it nothing.
 */
async function readCaptchaWait(
	guildId: Snowflake,
	userId: Snowflake,
	now: number,
): Promise<OnboardingCaptchaWait | null> {
	const [record, rows] = await Promise.all([
		onboardingStore.read(guildId),
		fetchWaitingOnboardingRows(db.orm, guildId, userId),
	]);
	const input = { enabled: record.enabled, now, rows, stages: record.stages };
	// The join time only takes rows away, so with every row there is none to serve, there is none with it either.
	if (findOnboardingCaptchaWait({ ...input, joinedAt: null }) === null) return null;
	return findOnboardingCaptchaWait({ ...input, joinedAt: await readJoinedAt(guildId, userId) });
}

/**
 * What the verification page shows a member about the onboarding: the
 * `Captcha` stage they wait at, with the site key of the captcha. `null` when
 * they wait at none, or the site cannot check a captcha.
 */
export async function readOnboardingCaptchaPrompt(
	guildId: Snowflake,
	userId: Snowflake,
	now = Date.now(),
): Promise<OnboardingCaptchaPrompt | null> {
	if (!isOnboardingCaptchaAvailable()) return null;

	const wait = await readCaptchaWait(guildId, userId, now);
	return wait === null ? null : { ...wait, siteKey: useRuntimeConfig().public.turnstileSiteKey };
}

/**
 * Asks the bot to pass a member who solved the captcha of the `Captcha` stage
 * they wait at. The member must still wait at the stage the page showed, so a
 * captcha solved for an old stage passes no other one. The captcha is checked
 * after, so a token is not spent on a member who cannot pass. A refused
 * captcha is no attempt: only the stage's time limit fails the member.
 *
 * @returns The ID of the request, which the bot does.
 * @throws {@linkcode OnboardingCaptchaError} With why the page refused.
 */
export async function submitOnboardingCaptcha(input: {
	guildId: Snowflake;
	userId: Snowflake;
	verificationId: string;
	turnstileToken: string;
	now?: number;
}): Promise<string> {
	const { guildId, userId, verificationId } = input;
	const secret = useRuntimeConfig().turnstileSecretKey;
	if (!isOnboardingCaptchaAvailable() || !secret) {
		throw new OnboardingCaptchaError("captchaUnavailable");
	}

	const wait = await readCaptchaWait(guildId, userId, input.now ?? Date.now());
	if (wait?.verificationId !== verificationId) throw new OnboardingCaptchaError("notWaiting");

	const result = await verifyTurnstileToken(secret, input.turnstileToken);
	if (!result.ok) {
		throw new OnboardingCaptchaError(
			result.reason === "unreachable" ? "captchaUnavailable" : "captcha",
		);
	}

	return submitOnboardingRequest({ guildId, userId, verificationId });
}

/**
 * Where a request of a member is: done or not, and why the bot could not do it.
 *
 * @returns The state, `null` when the member has no request with that ID in the guild.
 */
export async function readOnboardingRequestState(
	guildId: Snowflake,
	userId: Snowflake,
	requestId: string,
): Promise<OnboardingRequestState | null> {
	const request = await fetchOnboardingRequestRow(db.orm, guildId, userId, requestId);
	if (request === null) return null;

	return {
		error: request.error === null ? null : parseOnboardingRequestError(request.error),
		id: request.id,
		processed: request.processed,
	};
}
