import type { ReadonlyGuildData } from "#server/database/settings/types";
import type {
	JoinGuardTrust,
	JoinGuardTrustGap,
	JoinGuardVerifyBody,
	JoinGuardVerifyGuestPage,
	JoinGuardVerifyPage,
	JoinGuardVerifyState,
} from "#shared/utils/join-guard";
import type { APIConnection, APIUser, Snowflake } from "discord-api-types/v10";
import type { H3Event } from "h3";
import { db } from "#server/database/prisma";
import { readSettings } from "#server/database/settings/functions";
import {
	fetchLatestJoinGuardCheckpoint,
	type JoinGuardCheckpointRecord,
} from "#server/database/settings/joinguard/checkpoints";
import { submitJoinGuardRequest } from "#server/database/settings/joinguard/requests";
import { fetchJoinGuardRuleRow } from "#server/database/settings/joinguard/rules";
import { isOnJoinGuardSharedBanList } from "#server/database/settings/joinguard/shared-bans";
import { getCurrentToken, getCurrentUser, getGuild } from "#server/utils/discord";
import { isDiscordUnauthorized } from "#server/utils/discord/oauth";
import { readTokenScopes } from "#server/utils/discord/token-scopes";
import { errors } from "#server/utils/errors";
import { measureJoinGuardTrust, type JoinGuardTrustResult } from "#server/utils/join-guard/trust";
import { verifyTurnstileToken } from "#server/utils/join-guard/turnstile";
import { refreshSessionTokens } from "#server/utils/oauth-tokens";
import { runtimeConfig } from "#server/utils/runtimeConfig";
import { useApi } from "#server/utils/shared";
import { guildIconURL } from "#shared/utils/discord";
import { JoinGuardConnectionsScope, JoinGuardMinimumTrustLevels } from "#shared/utils/join-guard";
import { REST } from "@discordjs/rest";
import { createError as createH3Error } from "h3";

/** Why the verification page refuses to let a member pass, to answer with. */
export type JoinGuardVerifyErrorCode =
	/** The bot is not in the guild, and the member is not in it either. */
	| "unknownGuild"
	/** The guard or its checkpoint is off, or the bot is not in the guild. */
	| "unavailable"
	/** The member does not wait at the checkpoint. */
	| "notWaiting"
	/** The guild asks for a captcha and the token is missing or refused. */
	| "captcha"
	/** The guild asks for a captcha the site cannot check now: no Turnstile secret, or Cloudflare unreachable. */
	| "captchaUnavailable"
	/** The account is on the shared ban list, which the guild checks. */
	| "sharedBan"
	/** The trust is below the guild's minimum; the body names the gaps. */
	| "trust";

const VERIFY_ERROR_RESPONSES = {
	unknownGuild: [404, "Server not found"],
	unavailable: [409, "The checkpoint of this server is off"],
	notWaiting: [409, "You do not wait at the checkpoint"],
	captcha: [403, "The captcha was not passed"],
	captchaUnavailable: [503, "The captcha cannot be checked now"],
	sharedBan: [403, "The account is on the shared ban list"],
	trust: [403, "The account is not trusted enough"],
} as const satisfies Record<JoinGuardVerifyErrorCode, readonly [number, string]>;

export class JoinGuardVerifyError extends Error {
	public constructor(
		public readonly code: JoinGuardVerifyErrorCode,
		public readonly details: { level?: JoinGuardTrust; missing?: JoinGuardTrustGap[] } = {},
	) {
		super(`Join guard verification error: ${code}`);
	}
}

/**
 * Answers a request with why the page refused: the status of the code, and
 * `{ code }` (with `level` and `missing` for `trust`) in the body. Anything
 * that is not a {@linkcode JoinGuardVerifyError} is thrown again as it is.
 */
export function throwJoinGuardVerifyError(error: unknown): never {
	if (!(error instanceof JoinGuardVerifyError)) throw error;

	const [statusCode, statusMessage] = VERIFY_ERROR_RESPONSES[error.code];
	throw createH3Error({
		statusCode,
		statusMessage,
		message: statusMessage,
		data: { code: error.code, ...error.details },
	});
}

/** The account of the member who opens the page, as Discord has it now, and the token that read it. */
interface VerifyAccount {
	user: APIUser;
	accessToken: string;
}

function userApi(accessToken: string) {
	return useApi(new REST({ authPrefix: "Bearer" }).setToken(accessToken));
}

/**
 * Reads the member's account fresh, not from the hour-long cache of
 * `getCurrentUser()`: an avatar set a minute ago must count. A refused token
 * is refreshed once, as the other reads with the member's token do.
 */
async function readVerifyAccount(event: H3Event): Promise<VerifyAccount> {
	const tokens = await getCurrentToken(event);
	try {
		return {
			user: await userApi(tokens.access_token).users.getCurrent(),
			accessToken: tokens.access_token,
		};
	} catch (error) {
		if (!isDiscordUnauthorized(error)) throw error;
	}

	const refreshed = await refreshSessionTokens(event, { force: true });
	if (!refreshed?.access_token || refreshed.access_token === tokens.access_token) {
		throw errors.unauthorized();
	}
	try {
		return {
			user: await userApi(refreshed.access_token).users.getCurrent(),
			accessToken: refreshed.access_token,
		};
	} catch (error) {
		if (isDiscordUnauthorized(error)) throw errors.unauthorized();
		throw error;
	}
}

/** The verified linked accounts that still are, the count the bot is handed. */
export function countLinkedAccounts(connections: readonly APIConnection[]): number {
	return connections.filter((connection) => connection.verified && !connection.revoked).length;
}

/**
 * Whether the member's sign-in granted `connections`, and how many verified
 * accounts they linked to Discord. Nothing of the connections is kept but the
 * count; a list Discord does not give reads as none.
 */
async function readLinkedAccounts(
	accessToken: string,
): Promise<{ granted: boolean; count: number }> {
	const scopes = await readTokenScopes(accessToken);
	if (!scopes.includes(JoinGuardConnectionsScope)) return { granted: false, count: 0 };

	try {
		return {
			granted: true,
			count: countLinkedAccounts(await userApi(accessToken).users.getConnections()),
		};
	} catch {
		return { granted: true, count: 0 };
	}
}

/**
 * The guild the page is about, as the bot sees it, or as the member's own
 * guild list has it when the bot is not there.
 */
async function readVerifyGuild(
	event: H3Event,
	guildId: Snowflake,
): Promise<{ guild: JoinGuardVerifyPage["guild"]; botPresent: boolean }> {
	const bot = await getGuild(guildId).catch(() => null);
	const found =
		bot ??
		(await getCurrentUser(event)
			.then(({ guilds }) => guilds.find((entry) => entry.id === guildId))
			.catch(() => undefined));
	if (!found) throw new JoinGuardVerifyError("unknownGuild");

	return { guild: toVerifyGuild(found), botPresent: Boolean(bot) };
}

function toVerifyGuild(guild: {
	id: Snowflake;
	name: string;
	icon: string | null;
}): JoinGuardVerifyPage["guild"] {
	return {
		id: guild.id,
		name: guild.name,
		iconUrl: guildIconURL({ id: guild.id, icon: guild.icon, acronym: "" }),
	};
}

function checksOf(settings: ReadonlyGuildData): JoinGuardVerifyPage["checks"] {
	return {
		captcha: settings.joinGuardCaptcha,
		connections: settings.joinGuardConnections,
		sharedBans: settings.joinGuardSharedBans,
	};
}

/**
 * What the verification page of a guild shows a visitor who is not signed in:
 * the guild as the bot sees it, and what its page checks, so the sign-in can
 * ask for `connections` at once. Nothing of any member is read.
 *
 * @throws {@linkcode JoinGuardVerifyError} `unknownGuild` when the bot is not in the guild.
 */
export async function readJoinGuardVerifyGuestPage(
	guildId: Snowflake,
): Promise<JoinGuardVerifyGuestPage> {
	const guild = await getGuild(guildId).catch(() => null);
	if (!guild) throw new JoinGuardVerifyError("unknownGuild");

	return {
		signedIn: false,
		guild: toVerifyGuild(guild),
		checks: checksOf(await readSettings(guildId)),
	};
}

function isCheckpointOn(settings: ReadonlyGuildData): boolean {
	return settings.joinGuardEnabled && settings.joinGuardCheckpoint;
}

function minimumTrustOf(settings: ReadonlyGuildData): JoinGuardTrust {
	const value = settings.joinGuardMinimumTrust;
	return (JoinGuardMinimumTrustLevels as readonly number[]).includes(value)
		? (value as JoinGuardTrust)
		: 1;
}

const RESOLVED_STATES = {
	Verified: "verified",
	Kicked: "kicked",
	Banned: "banned",
	Left: "left",
} as const satisfies Record<
	Exclude<JoinGuardCheckpointRecord["status"], "Waiting">,
	JoinGuardVerifyState
>;

/**
 * Whether a resolved row is of an earlier stay of the member: they are in the
 * guild now and joined after the guard stopped them, without being stopped
 * again. Discord is asked fresh; when it cannot tell, the row stands.
 */
async function isOfEarlierStay(
	guildId: Snowflake,
	userId: Snowflake,
	row: JoinGuardCheckpointRecord,
): Promise<boolean> {
	try {
		const member = await useApi().guilds.getMember(guildId, userId);
		const joinedAt = Date.parse(member.joined_at ?? "");
		return Number.isFinite(joinedAt) && joinedAt > row.createdAt;
	} catch {
		// Not a member anymore (Unknown Member), or Discord could not say:
		return false;
	}
}

async function resolveVerifyState(
	guildId: Snowflake,
	userId: Snowflake,
	row: JoinGuardCheckpointRecord | null,
): Promise<JoinGuardVerifyState> {
	if (row === null) return "notStopped";
	if (row.status === "Waiting") return "waiting";
	return (await isOfEarlierStay(guildId, userId, row))
		? "notStopped"
		: RESOLVED_STATES[row.status];
}

/**
 * Measures the trust of a member who waits, with what the guild checks: the
 * age of the rule that stopped them, the shared ban list, the linked accounts.
 */
async function measureWaitingMember(input: {
	guildId: Snowflake;
	settings: ReadonlyGuildData;
	account: VerifyAccount;
	row: JoinGuardCheckpointRecord;
	now: number;
}): Promise<{ trust: JoinGuardTrustResult; connectionsGranted: boolean; sharedBan: boolean }> {
	const { guildId, settings, account, row, now } = input;
	const checks = {
		connections: settings.joinGuardConnections,
		sharedBans: settings.joinGuardSharedBans,
	};
	const [rule, sharedBan, linked] = await Promise.all([
		row.ruleId === null ? null : fetchJoinGuardRuleRow(db.orm, guildId, row.ruleId),
		checks.sharedBans ? isOnJoinGuardSharedBanList(db.orm, account.user.id) : false,
		checks.connections ? readLinkedAccounts(account.accessToken) : { granted: false, count: 0 },
	]);

	const trust = measureJoinGuardTrust({
		accountCreatedAt: row.accountCreatedAt,
		now,
		ruleAccountAgeMax: rule?.accountAgeMax ?? null,
		checks,
		sharedBan,
		linkedAccounts: linked.count,
		publicFlags: account.user.public_flags ?? 0,
		hasAvatar: account.user.avatar !== null,
		minimumTrust: minimumTrustOf(settings),
	});
	return { trust, connectionsGranted: linked.granted, sharedBan };
}

/**
 * What the verification page of a guild shows the signed-in member: the
 * guild, where the member stands, what the page checks, and when they wait,
 * the trust their account has now with what keeps it below the minimum.
 *
 * `needsConnections` is only `true` for a member who waits, of a guild that
 * reads linked accounts, whose sign-in did not grant `connections`: it is the
 * page's cue to sign in again with that scope.
 */
export async function readJoinGuardVerifyPage(
	event: H3Event,
	guildId: Snowflake,
	now = Date.now(),
): Promise<JoinGuardVerifyPage> {
	const [{ guild, botPresent }, settings, account] = await Promise.all([
		readVerifyGuild(event, guildId),
		readSettings(guildId),
		readVerifyAccount(event),
	]);

	const checks = checksOf(settings);
	const page: JoinGuardVerifyPage = {
		signedIn: true,
		guild,
		state: "unavailable",
		checks,
		minimumTrust: minimumTrustOf(settings),
		trust: null,
		needsConnections: false,
		captchaSiteKey: checks.captcha ? runtimeConfig.public.turnstileSiteKey || null : null,
	};
	if (!botPresent || !isCheckpointOn(settings)) return page;

	const row = await fetchLatestJoinGuardCheckpoint(db.orm, guildId, account.user.id);
	page.state = await resolveVerifyState(guildId, account.user.id, row);
	if (page.state !== "waiting" || row === null) return page;

	const { trust, connectionsGranted } = await measureWaitingMember({
		guildId,
		settings,
		account,
		row,
		now,
	});
	page.trust = trust;
	page.needsConnections = checks.connections && !connectionsGranted;
	return page;
}

/**
 * Checks the Turnstile token of a guild that asks for a captcha. A site with
 * no Turnstile secret refuses rather than skipping the check.
 */
async function assertCaptcha(token: string | undefined): Promise<void> {
	const secret = runtimeConfig.turnstileSecretKey;
	if (!secret) throw new JoinGuardVerifyError("captchaUnavailable");

	const result = await verifyTurnstileToken(secret, token);
	if (result.ok) return;
	throw new JoinGuardVerifyError(
		result.reason === "unreachable" ? "captchaUnavailable" : "captcha",
	);
}

/**
 * Lets the signed-in member pass the checkpoint of a guild: the member must
 * wait, the trust is measured again and must reach the guild's minimum (and
 * the account be off the shared ban list when the guild checks it), and the
 * captcha is checked last, so a token is not spent on a member who cannot
 * pass. Then a `Pass` request is written and announced for the bot.
 *
 * @returns The ID of the request.
 * @throws {@linkcode JoinGuardVerifyError} With why the member cannot pass.
 */
export async function submitJoinGuardVerification(
	event: H3Event,
	guildId: Snowflake,
	body: JoinGuardVerifyBody,
	now = Date.now(),
): Promise<{ requestId: string; trust: JoinGuardTrustResult }> {
	const [{ botPresent }, settings, account] = await Promise.all([
		readVerifyGuild(event, guildId),
		readSettings(guildId),
		readVerifyAccount(event),
	]);
	if (!botPresent || !isCheckpointOn(settings)) throw new JoinGuardVerifyError("unavailable");

	const row = await fetchLatestJoinGuardCheckpoint(db.orm, guildId, account.user.id);
	if (row?.status !== "Waiting") throw new JoinGuardVerifyError("notWaiting");

	const { trust, sharedBan } = await measureWaitingMember({
		guildId,
		settings,
		account,
		row,
		now,
	});
	if (sharedBan) throw new JoinGuardVerifyError("sharedBan");
	if (trust.level < minimumTrustOf(settings)) {
		throw new JoinGuardVerifyError("trust", { level: trust.level, missing: trust.missing });
	}

	if (settings.joinGuardCaptcha) await assertCaptcha(body.turnstileToken);

	const requestId = await submitJoinGuardRequest({
		kind: "Pass",
		guildId,
		userId: account.user.id,
		checkpointId: row.id,
		trust: trust.level,
		linkedAccounts: trust.linkedAccounts,
	});
	return { requestId, trust };
}

/** The signed-in member's Discord ID, for the routes that only need who they are. */
export async function readVerifyMemberId(event: H3Event): Promise<Snowflake> {
	const { user } = await getCurrentUser(event);
	return user.id;
}
