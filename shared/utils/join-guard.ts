/**
 * The join guard of the V7 contract: the rules that stop the members whose
 * account looks like a raid or a spam bot when they join, the checkpoint where
 * a stopped member waits until they verify on `/verify/<guild>`, and the
 * requests the website writes for the bot (`JoinGuardRequest`, announced with
 * `NOTIFY join_guard_request, '<id>'`).
 *
 * Ported from `projects/database/src/settings/joinguard/types.ts` in the bot
 * (wolfstar-project/wolfstar, V7). The bot owns the tables and acts on the
 * requests; this file holds what the dashboard, its routes and the
 * verification page share, and nothing here touches the database.
 */
import type { Snowflake } from "discord-api-types/v10";

/** The most rules a guild has, the bot's `MaximumJoinGuardRules`. */
export const MaximumJoinGuardRules = 10;

/** The longest texts, in characters. */
export const JoinGuardLimits = {
	/** The name of a rule, 1 to 32. */
	ruleName: 32,
	/** The text the `nameContains` condition looks for, 1 to 32. */
	nameContains: 32,
	/** The direct message to a stopped member; empty means the bot's own text. */
	directMessage: 500,
	/** The reason of a kick asked from the queue. */
	reason: 500,
} as const;

/**
 * The account age of a rule, which the dashboard edits in days and the bot
 * stores in seconds (`accountAgeMax`).
 */
export const JoinGuardAccountAgeDays = { minimum: 1, maximum: 9999 } as const;

/** Seconds in a day and in an hour, for the conversions of the editor. */
export const SecondsPerDay = 86_400;
export const SecondsPerHour = 3600;

/**
 * How long a member waits at the checkpoint before the bot kicks them, which
 * the dashboard edits in hours and the bot stores in seconds
 * (`joinGuardCheckpointTimeout`): `0` never kicks, otherwise 1 to 168 hours
 * (the bot's `JoinGuardCheckpointTimeoutLimits`, 3600 to 604800 seconds).
 */
export const JoinGuardCheckpointTimeoutHours = { minimum: 1, maximum: 168 } as const;

/**
 * The trust the checkpoint page measures, from `0` (not trusted) to `3` (very
 * trusted), and the lowest a guild can ask for (`joinGuardMinimumTrust`).
 */
export const JoinGuardTrustLevels = [0, 1, 2, 3] as const;
export type JoinGuardTrust = (typeof JoinGuardTrustLevels)[number];
export const JoinGuardMinimumTrustLevels = [1, 2, 3] as const satisfies readonly JoinGuardTrust[];

/** What a rule does that ends the join, the `JoinGuardHardAction` enum. */
export const JoinGuardHardActions = ["Kick", "Ban"] as const;
export type JoinGuardHardAction = (typeof JoinGuardHardActions)[number];

/** Where a stopped member is now, the `JoinGuardCheckpointStatus` enum. */
const JoinGuardCheckpointStatuses = ["Waiting", "Verified", "Kicked", "Banned", "Left"] as const;
export type JoinGuardCheckpointStatus = (typeof JoinGuardCheckpointStatuses)[number];

/**
 * What decided where a stopped member is now, the `JoinGuardResolution` enum:
 * the rule (a kick or a ban at once), the checkpoint page, its timeout, or a
 * moderator. `null` while they wait, and when they left.
 */
export type JoinGuardResolution = "Rule" | "Checkpoint" | "Timeout" | "Moderator";

/** What the website asks the bot to do, the `JoinGuardRequestKind` enum. */
export type JoinGuardRequestKind = "Pass" | "Verify" | "Kick" | "PostButton";

/**
 * A rule as the dashboard edits it: every condition it sets must match a
 * member who joins, and then every action it sets is taken. A rule sets at
 * least one condition and one action; `Kick` and `Ban` end the join, so a rule
 * with a hard action neither sends to the checkpoint nor gives a role.
 */
export interface JoinGuardRuleInput {
	name: string;
	enabled: boolean;
	/** Matches an account created less than this many seconds ago. */
	accountAgeMax: number | null;
	/** Matches an account with no avatar of its own. */
	defaultAvatar: boolean;
	/** Matches an account whose name looks generated. */
	generatedName: boolean;
	/** Matches an account whose username or global name has this text. */
	nameContains: string | null;
	/** Matches an app account that is not a verified bot. */
	unverifiedBot: boolean;
	sendToCheckpoint: boolean;
	roleId: Snowflake | null;
	directMessage: boolean;
	alertChannelId: Snowflake | null;
	hardAction: JoinGuardHardAction | null;
}

/** A rule as it is stored. */
export interface JoinGuardRule extends JoinGuardRuleInput {
	id: string;
	/** In milliseconds. */
	createdAt: number;
}

/**
 * `GET /api/guilds/:guild/joinguard/rules` and the body of the rule routes'
 * answers. `POST` takes a {@link JoinGuardRuleInput} and answers the rule;
 * `PATCH …/rules/:rule` takes a partial input; `DELETE` answers `204`.
 */
export interface JoinGuardRulesResponse {
	rules: JoinGuardRule[];
}

/**
 * Why the editor or the routes refuse a rule, in the order the editor shows
 * them: no name, no condition, an account age that is not 1 to 9999 days, a
 * name text that is empty or too long, no action, and the checkpoint asked for
 * while the guild's checkpoint is off (the editor's own check: the switch may
 * be staged and not saved yet, so the routes do not refuse it).
 */
export type JoinGuardRuleProblem =
	| "name"
	| "conditions"
	| "accountAge"
	| "nameContains"
	| "actions"
	| "hardActionConflict"
	| "checkpointOff";

/** The member a queue row is about, as the bot's member lookups resolve them. */
export interface JoinGuardMember {
	id: Snowflake;
	username: string;
	displayName: string;
	/** A CDN URL, or `null` for the default avatar. */
	avatarUrl: string | null;
}

/** A row of the checkpoint queue. */
export interface JoinGuardQueueEntry {
	id: string;
	member: JoinGuardMember;
	ruleId: string | null;
	ruleName: string;
	status: JoinGuardCheckpointStatus;
	resolution: JoinGuardResolution | null;
	/** The moderator who decided, when one did. */
	moderator: JoinGuardMember | null;
	caseId: number | null;
	/** The signals the rule saw. In milliseconds. */
	accountCreatedAt: number;
	defaultAvatar: boolean;
	generatedName: boolean;
	/** What the checkpoint page measured, when the member passed it. */
	trust: JoinGuardTrust | null;
	linkedAccounts: number;
	/** In milliseconds. */
	createdAt: number;
	expiresAt: number | null;
	resolvedAt: number | null;
}

/** The filters of the queue; `all` is every status. */
export const JoinGuardQueueFilters = ["Waiting", "Verified", "Kicked", "Banned", "all"] as const;
export type JoinGuardQueueFilter = (typeof JoinGuardQueueFilters)[number];

/**
 * `GET /api/guilds/:guild/joinguard/checkpoints?status=<filter>&cursor=<id>`:
 * a page of the rows of the last 7 days, newest first, and the counts of the
 * same 7 days by filter (`Left` counts in `all` only). `waiting` counts every
 * member who waits now, however long ago they were stopped.
 */
export interface JoinGuardQueuePage {
	entries: JoinGuardQueueEntry[];
	nextCursor: string | null;
	counts: Record<JoinGuardQueueFilter, number>;
	waiting: number;
}

/**
 * `POST /api/guilds/:guild/joinguard/requests`: what a moderator asks for.
 * `Verify` and `Kick` name the row of the queue (`checkpointId`) the member
 * waits on; `Kick` may give a reason. `PostButton` names nothing. Answers
 * `{ id }` with `202`.
 */
export type JoinGuardModeratorRequestBody =
	| { kind: "Verify"; checkpointId: string }
	| { kind: "Kick"; checkpointId: string; reason?: string }
	| { kind: "PostButton" };

/**
 * Why the bot could not do a request, from the `error` column it writes as
 * `<code>: <detail>`: the codes of its `JoinGuardFailure`, or `unknown` for one
 * the website does not know.
 */
export interface JoinGuardRequestError {
	code: string;
	detail: string;
}

/**
 * `GET /api/guilds/:guild/joinguard/requests/:request` and
 * `GET /api/verify/:guild/requests/:request`: whether the bot has done a
 * request yet, and why it could not when it could not.
 */
export interface JoinGuardRequestState {
	id: string;
	kind: JoinGuardRequestKind;
	processed: boolean;
	error: JoinGuardRequestError | null;
}

/**
 * What keeps an account below a trust level, which the verification page
 * names so the member knows what to fix: an account younger than the age of
 * the rule that stopped them, on the shared ban list, with no linked account
 * (only when the guild reads them), with no public badge, or with the default
 * avatar.
 */
export type JoinGuardTrustGap = "accountAge" | "sharedBan" | "linkedAccount" | "badges" | "avatar";

/** Where the member who opens the verification page stands. */
export type JoinGuardVerifyState =
	/** The guild's guard or checkpoint is off, or the bot is not there. */
	| "unavailable"
	/** The member was not stopped, or not in the last stay. */
	| "notStopped"
	| "waiting"
	| "verified"
	| "kicked"
	| "banned"
	| "left";

/**
 * `GET /api/verify/:guild` (signed in): what the page shows. `trust` is
 * measured when the member waits; `missing` lists what keeps it below the
 * guild's minimum, empty when it is enough.
 */
export interface JoinGuardVerifyPage {
	guild: { id: Snowflake; name: string; iconUrl: string | null };
	state: JoinGuardVerifyState;
	checks: { captcha: boolean; connections: boolean; sharedBans: boolean };
	minimumTrust: JoinGuardTrust;
	trust: { level: JoinGuardTrust; linkedAccounts: number; missing: JoinGuardTrustGap[] } | null;
	/** The guild reads linked accounts and the sign-in has not granted `connections`. */
	needsConnections: boolean;
	/** The public Turnstile site key when the guild asks for a captcha; `null` when the site has none. */
	captchaSiteKey: string | null;
	/** Always `true` here; tells this answer from a {@link JoinGuardVerifyGuestPage}. */
	signedIn?: true;
}

/**
 * `GET /api/verify/:guild` for a visitor who is not signed in: only what the
 * sign-in card shows, the guild and what its page checks (so the sign-in can
 * ask for `connections` at once). A guild the bot is not in answers `404`.
 */
export interface JoinGuardVerifyGuestPage {
	signedIn: false;
	guild: JoinGuardVerifyPage["guild"];
	checks: JoinGuardVerifyPage["checks"];
}

/** What `GET /api/verify/:guild` answers, signed in or not; tell them apart with `signedIn`. */
export type JoinGuardVerifyResponse = JoinGuardVerifyPage | JoinGuardVerifyGuestPage;

/**
 * `POST /api/verify/:guild`: the Turnstile token when the guild asks for a
 * captcha. Answers `{ id }` of the `Pass` request with `202`, or refuses with
 * `403` and a `JoinGuardTrustGap`-bearing message when the trust is too low.
 */
export interface JoinGuardVerifyBody {
	turnstileToken?: string;
}

/** The checks of {@link validateJoinGuardRule} that depend on the guild. */
export interface JoinGuardRuleValidationOptions {
	/**
	 * Whether the guild's checkpoint is on. Only `false` refuses a rule that
	 * sends to the checkpoint (`checkpointOff`); leave it out on the server,
	 * where the switch may be staged and not saved yet.
	 */
	checkpointOn?: boolean;
}

function hasJoinGuardCondition(input: JoinGuardRuleInput): boolean {
	return (
		input.accountAgeMax !== null ||
		input.defaultAvatar ||
		input.generatedName ||
		input.nameContains !== null ||
		input.unverifiedBot
	);
}

function hasJoinGuardAction(input: JoinGuardRuleInput): boolean {
	return (
		input.sendToCheckpoint ||
		input.roleId !== null ||
		input.directMessage ||
		input.alertChannelId !== null ||
		input.hardAction !== null
	);
}

function isJoinGuardAccountAge(seconds: number): boolean {
	return (
		Number.isSafeInteger(seconds) &&
		seconds >= JoinGuardAccountAgeDays.minimum * SecondsPerDay &&
		seconds <= JoinGuardAccountAgeDays.maximum * SecondsPerDay
	);
}

function isJoinGuardText(value: string, maximum: number): boolean {
	const length = value.trim().length;
	return length > 0 && length <= maximum;
}

/**
 * The first reason to refuse a rule, in the order of
 * {@link JoinGuardRuleProblem}, or `null` when the rule can be saved. The
 * editor and the routes share it; only the editor passes `checkpointOn`.
 */
export function validateJoinGuardRule(
	input: JoinGuardRuleInput,
	options: JoinGuardRuleValidationOptions = {},
): JoinGuardRuleProblem | null {
	if (!isJoinGuardText(input.name, JoinGuardLimits.ruleName)) return "name";
	if (!hasJoinGuardCondition(input)) return "conditions";
	if (input.accountAgeMax !== null && !isJoinGuardAccountAge(input.accountAgeMax)) {
		return "accountAge";
	}
	if (
		input.nameContains !== null &&
		!isJoinGuardText(input.nameContains, JoinGuardLimits.nameContains)
	) {
		return "nameContains";
	}
	if (!hasJoinGuardAction(input)) return "actions";
	if (input.hardAction !== null && (input.sendToCheckpoint || input.roleId !== null)) {
		return "hardActionConflict";
	}
	if (options.checkpointOn === false && input.sendToCheckpoint) return "checkpointOff";
	return null;
}

/** The account age of a rule in whole days, from the seconds the bot stores. */
export function accountAgeDays(seconds: number): number {
	return Math.round(seconds / SecondsPerDay);
}

/** The seconds the bot stores for an account age of whole days. */
export function accountAgeSeconds(days: number): number {
	return Math.round(days) * SecondsPerDay;
}

/** The checkpoint timeout in whole hours, from the seconds the bot stores; `0` never kicks. */
export function timeoutHours(seconds: number): number {
	return Math.round(seconds / SecondsPerHour);
}

/** The seconds the bot stores for a checkpoint timeout of whole hours; `0` never kicks. */
export function timeoutSeconds(hours: number): number {
	return Math.round(hours) * SecondsPerHour;
}

/**
 * The codes of the bot's `JoinGuardFailure`, which it writes first in the
 * `error` column of a request it could not do.
 */
export const JoinGuardFailureCodes = [
	"InvalidRequest",
	"UnknownGuild",
	"NotWaiting",
	"NotMember",
	"MissingPermissions",
	"NotAllowed",
	"RoleNotManageable",
	"NoChannel",
	"UnknownChannel",
	"Refused",
	"Failed",
] as const;

/**
 * Reads the `error` column of a request, `<code>: <detail>`. A code the
 * website does not know reads as `unknown`, with the whole text as its detail.
 */
export function parseJoinGuardRequestError(error: string): JoinGuardRequestError {
	const separator = error.indexOf(": ");
	const code = separator === -1 ? error : error.slice(0, separator);
	if ((JoinGuardFailureCodes as readonly string[]).includes(code)) {
		return { code, detail: separator === -1 ? "" : error.slice(separator + 2) };
	}
	return { code: "unknown", detail: error };
}

/**
 * The Discord OAuth scope that lets the verification page count the linked
 * accounts of a member (`GET /users/@me/connections`). A sign-in asks for it
 * only from the verification page of a guild that reads them.
 */
export const JoinGuardConnectionsScope = "connections";
