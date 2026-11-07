import type { JoinGuardTrust, JoinGuardTrustGap } from "#shared/utils/join-guard";

/**
 * The public flags that are no badge a member shows: `TeamPseudoUser`
 * (1 << 10), `BotHTTPInteractions` (1 << 19) and `Spammer` (1 << 20), which
 * Discord sets on an account it suspects. Inlined, not read from
 * `discord-api-types`' `UserFlags`, as module-scope code here does.
 */
const NON_BADGE_FLAGS = (1 << 10) | (1 << 19) | (1 << 20);

/** What the trust of a member is measured from. */
export interface JoinGuardTrustInput {
	/** When the account was made, in milliseconds. */
	accountCreatedAt: number;
	/** The moment of the measure, in milliseconds. */
	now: number;
	/**
	 * The `accountAgeMax` of the rule that stopped the member, in seconds;
	 * `null` when the rule is gone or had no age condition, which counts as
	 * an age that is enough.
	 */
	ruleAccountAgeMax: number | null;
	/** What the guild's page checks (`joinGuardConnections`, `joinGuardSharedBans`). */
	checks: { connections: boolean; sharedBans: boolean };
	/** Whether the account is on the shared ban list; only read when the guild checks it. */
	sharedBan: boolean;
	/** The verified linked accounts, `0` when they could not be read. */
	linkedAccounts: number;
	/** The account's `public_flags`. */
	publicFlags: number;
	/** Whether the account has an avatar of its own. */
	hasAvatar: boolean;
	/** The lowest trust the guild lets in (`joinGuardMinimumTrust`). */
	minimumTrust: JoinGuardTrust;
}

export interface JoinGuardTrustResult {
	level: JoinGuardTrust;
	linkedAccounts: number;
	/** What keeps the level below the guild's minimum, in the order of `JoinGuardTrustGap`; empty when it is enough. */
	missing: JoinGuardTrustGap[];
}

/**
 * The gaps of each level, the ones that keep a member from it:
 *
 * - `1` Low: an account older than the age of the rule that stopped them,
 *   and not on the shared ban list (when the guild checks it);
 * - `2` Trusted: also a verified linked account. Only when the guild reads
 *   linked accounts: when it does not, level 2 asks nothing more than level 1;
 * - `3` Very trusted: also a public badge and an avatar of their own.
 *
 * Discord's OAuth does not tell whether an account has a phone, so the
 * levels do not ask for one.
 */
function gapsByLevel(
	input: JoinGuardTrustInput,
): [JoinGuardTrustGap[], JoinGuardTrustGap[], JoinGuardTrustGap[]] {
	const low: JoinGuardTrustGap[] = [];
	const ageMax = input.ruleAccountAgeMax;
	if (ageMax !== null && input.now - input.accountCreatedAt < ageMax * 1000)
		low.push("accountAge");
	if (input.checks.sharedBans && input.sharedBan) low.push("sharedBan");

	const trusted: JoinGuardTrustGap[] = [];
	if (input.checks.connections && input.linkedAccounts < 1) trusted.push("linkedAccount");

	const veryTrusted: JoinGuardTrustGap[] = [];
	if ((input.publicFlags & ~NON_BADGE_FLAGS) === 0) veryTrusted.push("badges");
	if (!input.hasAvatar) veryTrusted.push("avatar");

	return [low, trusted, veryTrusted];
}

/**
 * Measures the trust of a member at the checkpoint: the highest level whose
 * requirements, and those of every level below it, the account meets.
 */
export function measureJoinGuardTrust(input: JoinGuardTrustInput): JoinGuardTrustResult {
	const levels = gapsByLevel(input);

	let level = 0;
	while (levels[level]?.length === 0) level++;

	return {
		level: level as JoinGuardTrust,
		linkedAccounts: input.linkedAccounts,
		missing: levels.slice(0, input.minimumTrust).flat(),
	};
}
