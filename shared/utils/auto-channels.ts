/**
 * The channels the bot works in on its own, one row per channel of a table
 * the contract controls: Auto-Delete (`GuildAutoDelete`), Auto-Purge
 * (`GuildAutoPurge`) and Auto-Message (`GuildAutoMessage`).
 *
 * Ported from the bot's `projects/database/src/settings/cleanup/types.ts` and
 * `settings/messages/types.ts`, whose limits it keeps. The bot works in
 * milliseconds; the tables, and this dashboard's API, keep whole seconds.
 */

import { isSnowflake } from "./snowflake";

// #region Auto-Delete

/** What an automatic deletion can leave in a channel: the messages that match one of them are kept. */
export const AUTO_DELETE_ALLOW_KINDS = [
	"links",
	"invites",
	"images",
	"mentions",
	"embeds",
	"text",
] as const;
export type AutoDeleteAllowKind = (typeof AUTO_DELETE_ALLOW_KINDS)[number];

/** The most channels of a server whose messages are deleted (`MaximumAutoDeleteChannels`). */
export const MAXIMUM_AUTO_DELETES = 25;

/** The delay of a deletion, in seconds: at once, up to a day (`AutoDeleteDelayLimits`). */
export const AUTO_DELETE_DELAY = { maximum: 24 * 60 * 60, minimum: 0 } as const;

/** A channel whose messages are deleted a delay after they are sent, but the ones it keeps. */
export interface AutoDelete {
	id: string;
	channelId: string;
	/** Seconds after which a message goes; 0 deletes it at once. */
	delay: number;
	allow: AutoDeleteAllowKind[];
	/** Whether the messages of bots and webhooks go too. */
	bots: boolean;
}

export type AutoDeleteData = Pick<AutoDelete, "allow" | "bots" | "delay">;

// #endregion

// #region Auto-Purge

/**
 * What an automatic purge looks for in the messages it deletes, in the order
 * the bot lists them (`CleanupFilterKinds`).
 */
export const AUTO_PURGE_FILTERS = [
	"any",
	"user",
	"contains",
	"notContains",
	"startsWith",
	"endsWith",
	"links",
	"invites",
	"images",
	"mentions",
	"embeds",
	"bots",
	"humans",
	"text",
] as const;
export type AutoPurgeFilter = (typeof AUTO_PURGE_FILTERS)[number];

/** The filters that need a value: a user ID for `user`, a text for the others. */
export const AUTO_PURGE_VALUE_FILTERS = {
	contains: "text",
	endsWith: "text",
	notContains: "text",
	startsWith: "text",
	user: "user",
} as const satisfies Partial<Record<AutoPurgeFilter, "text" | "user">>;

/** The most channels of a server that are purged (`MaximumAutoPurgeChannels`). */
export const MAXIMUM_AUTO_PURGES = 10;

/** The longest text a filter looks for (`MaximumCleanupValueLength`). */
export const MAXIMUM_AUTO_PURGE_VALUE_LENGTH = 100;

/**
 * The interval of a purge, in seconds (`AutoPurgeIntervalLimits`). Discord
 * only deletes in bulk the messages of the last 14 days, so a longer interval
 * would leave messages a purge can no longer delete.
 */
export const AUTO_PURGE_INTERVAL = { maximum: 14 * 24 * 60 * 60, minimum: 5 * 60 } as const;

/** A channel purged of the messages a filter looks for, every interval. */
export interface AutoPurge {
	id: string;
	channelId: string;
	/** Seconds between two purges. */
	interval: number;
	filter: AutoPurgeFilter;
	/** The user ID or the text the filter looks for, `null` for a filter that needs none. */
	value: string | null;
	/** When it runs next, as a UTC ISO string. */
	nextRunAt: string;
}

export type AutoPurgeData = Pick<AutoPurge, "filter" | "interval" | "value">;

// #endregion

// #region Auto-Message

/** The most messages a server sends again and again, one per channel (`MaximumAutoMessages`). */
export const MAXIMUM_AUTO_MESSAGES = 10;

/** The longest message Discord sends (`MaximumAutoMessageLength`). */
export const MAXIMUM_AUTO_MESSAGE_LENGTH = 2000;

/**
 * The interval of a message, in seconds (`AutoMessageIntervalLimits`): the
 * shortest keeps a channel from being filled with it, the longest is the one
 * of the purges.
 */
export const AUTO_MESSAGE_INTERVAL = { maximum: 14 * 24 * 60 * 60, minimum: 10 * 60 } as const;

/** A message sent in a channel again every interval. */
export interface AutoMessage {
	id: string;
	channelId: string;
	content: string;
	/** Seconds between two messages. */
	interval: number;
	/** Whether its mentions ping who they mention. */
	mentions: boolean;
	/** When it is sent next, as a UTC ISO string. */
	nextRunAt: string;
}

export type AutoMessageData = Pick<AutoMessage, "content" | "interval" | "mentions">;

// #endregion

// #region Validation

/** Why a body was refused, one sentence per field, for the API to answer with. */
export type AutoChannelParseResult<T> =
	| { data: T; errors?: never }
	| { data?: never; errors: string[] };

function bodyOf(body: unknown): Record<string, unknown> {
	return typeof body === "object" && body !== null && !Array.isArray(body)
		? (body as Record<string, unknown>)
		: {};
}

function wholeNumberIn(
	value: unknown,
	range: { maximum: number; minimum: number },
): value is number {
	return (
		Number.isInteger(value) &&
		(value as number) >= range.minimum &&
		(value as number) <= range.maximum
	);
}

/** Reads the body of an Auto-Delete write: `delay` (seconds), `allow` and `bots`. */
export function parseAutoDeleteData(body: unknown): AutoChannelParseResult<AutoDeleteData> {
	const { allow, bots, delay } = bodyOf(body);
	const errors: string[] = [];

	if (!wholeNumberIn(delay, AUTO_DELETE_DELAY)) {
		errors.push(
			`delay: Expected a whole number of seconds from 0 to ${AUTO_DELETE_DELAY.maximum}.`,
		);
	}
	if (
		!Array.isArray(allow) ||
		!allow.every((kind) => (AUTO_DELETE_ALLOW_KINDS as readonly unknown[]).includes(kind))
	) {
		errors.push(`allow: Expected a list of ${AUTO_DELETE_ALLOW_KINDS.join(", ")}.`);
	}
	if (typeof bots !== "boolean") errors.push("bots: Expected a boolean.");

	if (errors.length > 0) return { errors };
	return {
		data: {
			// In the bot's order, once each.
			allow: AUTO_DELETE_ALLOW_KINDS.filter((kind) => (allow as unknown[]).includes(kind)),
			bots: bots as boolean,
			delay: delay as number,
		},
	};
}

/** Reads a user for a purge: a mention, as the bot's command takes it, or an ID. */
function readUserId(value: string): string | null {
	const id = /^<@!?(\d+)>$/u.exec(value)?.[1] ?? value;
	return isSnowflake(id) ? id : null;
}

/**
 * Reads the body of an Auto-Purge write: `interval` (seconds), `filter` and
 * the `value` the filter needs, if any.
 */
export function parseAutoPurgeData(body: unknown): AutoChannelParseResult<AutoPurgeData> {
	const { filter, interval, value } = bodyOf(body);
	const errors: string[] = [];

	if (!wholeNumberIn(interval, AUTO_PURGE_INTERVAL)) {
		errors.push(
			`interval: Expected a whole number of seconds from ${AUTO_PURGE_INTERVAL.minimum} to ${AUTO_PURGE_INTERVAL.maximum}.`,
		);
	}
	if (!(AUTO_PURGE_FILTERS as readonly unknown[]).includes(filter)) {
		errors.push(`filter: Expected one of ${AUTO_PURGE_FILTERS.join(", ")}.`);
		return { errors };
	}

	const kind = AUTO_PURGE_VALUE_FILTERS[filter as keyof typeof AUTO_PURGE_VALUE_FILTERS];
	let parsedValue: string | null = null;
	if (kind === undefined) {
		if (value !== null && value !== undefined)
			errors.push("value: This filter takes no value.");
	} else if (typeof value !== "string" || value.trim() === "") {
		errors.push(`value: This filter needs a ${kind}.`);
	} else if (kind === "user") {
		parsedValue = readUserId(value.trim());
		if (parsedValue === null) errors.push("value: Expected a user ID or a mention.");
	} else if (value.trim().length > MAXIMUM_AUTO_PURGE_VALUE_LENGTH) {
		errors.push(`value: Expected ${MAXIMUM_AUTO_PURGE_VALUE_LENGTH} characters at most.`);
	} else {
		parsedValue = value.trim();
	}

	if (errors.length > 0) return { errors };
	return {
		data: {
			filter: filter as AutoPurgeFilter,
			interval: interval as number,
			value: parsedValue,
		},
	};
}

/** Reads the body of an Auto-Message write: `content`, `interval` (seconds) and `mentions`. */
export function parseAutoMessageData(body: unknown): AutoChannelParseResult<AutoMessageData> {
	const { content, interval, mentions } = bodyOf(body);
	const errors: string[] = [];

	if (typeof content !== "string" || content.trim() === "") {
		errors.push("content: The message cannot be empty.");
	} else if (content.length > MAXIMUM_AUTO_MESSAGE_LENGTH) {
		errors.push(`content: Expected ${MAXIMUM_AUTO_MESSAGE_LENGTH} characters at most.`);
	}
	if (!wholeNumberIn(interval, AUTO_MESSAGE_INTERVAL)) {
		errors.push(
			`interval: Expected a whole number of seconds from ${AUTO_MESSAGE_INTERVAL.minimum} to ${AUTO_MESSAGE_INTERVAL.maximum}.`,
		);
	}
	if (typeof mentions !== "boolean") errors.push("mentions: Expected a boolean.");

	if (errors.length > 0) return { errors };
	return {
		data: {
			content: content as string,
			interval: interval as number,
			mentions: mentions as boolean,
		},
	};
}

// #endregion
