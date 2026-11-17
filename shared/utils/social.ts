/**
 * The Social module: the subscriptions Staryl holds for a server, read and
 * changed through Staryl's guild API (wolfstar-project/staryl,
 * `docs/guild-api.md`). Nothing of it is in WolfStar's database.
 *
 * The shapes here are that API's. Its answers are parsed with these schemas
 * where they enter the dashboard (`server/utils/social/staryl.ts`), so a
 * change of Staryl's that the dashboard does not know fails there, and not in
 * a component.
 */

import {
	array,
	boolean,
	check,
	type InferOutput,
	maxLength,
	minLength,
	nullable,
	nullish,
	number,
	object,
	optional,
	picklist,
	pipe,
	string,
	transform,
	trim,
} from "valibot";
import { isSnowflake } from "./snowflake";

/** The platforms Staryl follows, by the name its API gives them (`SocialProviderName`). */
const SOCIAL_PROVIDERS = [
	"Rss",
	"Reddit",
	"Bluesky",
	"Mastodon",
	"YouTube",
	"TwitchVideos",
	"TwitchClips",
	"X",
	"Instagram",
	"TikTok",
] as const;
export type SocialProviderName = (typeof SOCIAL_PROVIDERS)[number];

/** How a followed account or feed is doing (`describeSourceHealth`, and `unavailable`). */
const SOCIAL_HEALTHS = [
	"active",
	"failing",
	"rateLimited",
	"targetUnavailable",
	"authFailed",
	"unavailable",
] as const;

/** Why the last notification of a subscription did not reach its channel. */
const SOCIAL_DELIVERY_ERRORS = [
	"GuildUnavailable",
	"ChannelNotFound",
	"MissingPermissions",
	"SendFailed",
] as const;

const SocialSubscriptionSchema = object({
	provider: picklist(SOCIAL_PROVIDERS),
	sourceId: string(),
	channelId: string(),
	displayName: string(),
	/** What was followed, in its canonical form: a feed URL, a handle, a channel ID. */
	target: string(),
	message: nullable(string()),
	/** The filters that are not at their default; they are set with `/subscriptions`. */
	filters: array(string()),
	health: picklist(SOCIAL_HEALTHS),
	deliveryError: nullable(picklist(SOCIAL_DELIVERY_ERRORS)),
	/** Whether the API adds and removes it: an account its owner connected is listed only. */
	manageable: boolean(),
	createdAt: string(),
	lastCheckedAt: nullable(string()),
});
export type SocialSubscription = InferOutput<typeof SocialSubscriptionSchema>;

/** When a Twitch live notification is posted: as the stream starts, or as it ends. */
const SOCIAL_TWITCH_EVENTS = ["StreamOnline", "StreamOffline"] as const;
export type SocialTwitchEvent = (typeof SOCIAL_TWITCH_EVENTS)[number];

const SocialTwitchSubscriptionSchema = object({
	/**
	 * What a removal names, with the channel. Optional while a Staryl from
	 * before the Twitch live routes answers: a row without it is listed only.
	 */
	subscriptionId: optional(string()),
	streamerId: string(),
	streamerName: nullable(string()),
	channelId: string(),
	type: picklist(SOCIAL_TWITCH_EVENTS),
	message: nullable(string()),
	/** Twitch ended it: no notification arrives until it is added again. */
	revoked: boolean(),
});

export type SocialTwitchSubscription = InferOutput<typeof SocialTwitchSubscriptionSchema>;

export const SocialStateSchema = object({
	/** Whether Staryl is in the server. */
	installed: boolean(),
	/** The switch of the module: off, Staryl posts nothing in the server. */
	enabled: boolean(),
	limits: object({
		/** The sum of every provider's `maximum`: Staryl has no total of its own. */
		subscriptions: number(),
		/** How many Twitch live notifications the server may have. Optional from an older Staryl. */
		twitchLive: optional(number()),
		xAccounts: number(),
		messageLength: number(),
		targetLength: number(),
	}),
	providers: array(
		object({
			name: picklist(SOCIAL_PROVIDERS),
			/** Whether Staryl holds the credentials the platform asks for. */
			configured: boolean(),
			manageable: boolean(),
			/** How many subscriptions of this platform the server may hold. Optional from an older Staryl. */
			maximum: optional(number()),
		}),
	),
	/** Whether Staryl can follow a new streamer live. `false` from a Staryl that does not say. */
	twitchLiveConfigured: optional(boolean(), false),
	subscriptions: array(SocialSubscriptionSchema),
	twitch: array(SocialTwitchSubscriptionSchema),
});
export type SocialState = InferOutput<typeof SocialStateSchema>;

/** The body of `PATCH /api/guilds/:guild/social`. */
export const SocialSwitchBodySchema = object({ enabled: boolean() });

/** What the switch answers with: its value, and what it was before the request. */
export const SocialSwitchSchema = object({ enabled: boolean(), previous: boolean() });

/**
 * What an add answers with: the new subscription, and the ones the server has
 * now. Both are `null` when Staryl saved the subscription and then could not
 * read the list: the add went through, and the list is to be read again.
 */
export const SocialAddedSchema = object({
	subscription: nullable(SocialSubscriptionSchema),
	subscriptions: nullable(array(SocialSubscriptionSchema)),
});

/**
 * What a remove answers with: what it removed, and the subscriptions the
 * server has left, `null` when Staryl could not read them after the removal.
 */
export const SocialRemovedSchema = object({
	removed: SocialSubscriptionSchema,
	subscriptions: nullable(array(SocialSubscriptionSchema)),
});

/**
 * What an edit answers with: the subscription before and after it, and the
 * server's list, `null` when Staryl could not read it after the write.
 */
export const SocialEditedSchema = object({
	previous: SocialSubscriptionSchema,
	subscription: SocialSubscriptionSchema,
	subscriptions: nullable(array(SocialSubscriptionSchema)),
});

/** What a Twitch live add answers with, as a social add does. */
export const SocialTwitchAddedSchema = object({
	subscription: nullable(SocialTwitchSubscriptionSchema),
	twitch: nullable(array(SocialTwitchSubscriptionSchema)),
});

/** What a Twitch live removal answers with, as a social removal does. */
export const SocialTwitchRemovedSchema = object({
	removed: SocialTwitchSubscriptionSchema,
	twitch: nullable(array(SocialTwitchSubscriptionSchema)),
});

/** What a Twitch live edit answers with, as a social edit does. */
export const SocialTwitchEditedSchema = object({
	previous: SocialTwitchSubscriptionSchema,
	subscription: SocialTwitchSubscriptionSchema,
	twitch: nullable(array(SocialTwitchSubscriptionSchema)),
});

/** What the target search answers: accounts that match, and what an add takes for each. */
export const SocialTargetSuggestionsSchema = object({
	suggestions: array(object({ name: string(), value: string() })),
});
export type SocialTargetSuggestion = InferOutput<
	typeof SocialTargetSuggestionsSchema
>["suggestions"][number];

/** The query of `GET /api/guilds/:guild/social/targets`. Staryl ignores one under 2 characters. */
export const SocialTargetQuerySchema = object({
	source: picklist([...SOCIAL_PROVIDERS, "TwitchLive"]),
	query: pipe(string(), trim(), maxLength(100)),
});

/** The longest target and message Staryl takes; its API repeats them in `limits`. */
const SOCIAL_TARGET_MAXIMUM = 500;
const SOCIAL_MESSAGE_MAXIMUM = 200;

/** The body of `POST /api/guilds/:guild/social/subscriptions`. */
export const SocialSubscriptionBodySchema = object({
	provider: picklist(SOCIAL_PROVIDERS),
	target: pipe(string(), trim(), minLength(1), maxLength(SOCIAL_TARGET_MAXIMUM)),
	channelId: pipe(
		string(),
		check((value) => isSnowflake(value), "Expected a channel ID"),
	),
	message: pipe(
		nullish(pipe(string(), trim(), maxLength(SOCIAL_MESSAGE_MAXIMUM)), null),
		transform((value) => value || null),
	),
});
export type SocialSubscriptionBody = InferOutput<typeof SocialSubscriptionBodySchema>;

/**
 * The body of `PATCH …/social/subscriptions/:channel/:source` and of
 * `PATCH …/social/twitch/:channel/:subscription`. The account, the source and
 * the event name the subscription and stay: those are a removal and an add.
 * An empty message removes it; Staryl refuses that for an offline notification.
 */
export const SocialEditBodySchema = object({
	channelId: pipe(
		string(),
		check((value) => isSnowflake(value), "Expected a channel ID"),
	),
	message: pipe(
		nullish(pipe(string(), trim(), maxLength(SOCIAL_MESSAGE_MAXIMUM)), null),
		transform((value) => value || null),
	),
});
export type SocialEditBody = InferOutput<typeof SocialEditBodySchema>;

/** A Twitch login: up to 25 letters, digits and underscores, with or without the @. */
const TWITCH_LOGIN_PATTERN = /^@?\w{1,25}$/u;

/** The body of `POST /api/guilds/:guild/social/twitch`. An offline notification needs a message. */
export const SocialTwitchBodySchema = pipe(
	object({
		streamer: pipe(
			string(),
			trim(),
			check((value) => TWITCH_LOGIN_PATTERN.test(value), "Expected a Twitch login"),
		),
		channelId: pipe(
			string(),
			check((value) => isSnowflake(value), "Expected a channel ID"),
		),
		type: picklist(SOCIAL_TWITCH_EVENTS),
		message: pipe(
			nullish(pipe(string(), trim(), maxLength(SOCIAL_MESSAGE_MAXIMUM)), null),
			transform((value) => value || null),
		),
	}),
	check(
		(body) => body.type === "StreamOnline" || body.message !== null,
		"An offline notification needs a message",
	),
);
export type SocialTwitchBody = InferOutput<typeof SocialTwitchBodySchema>;

/**
 * Why a request of the Social module was refused. The first group is Staryl's
 * own codes; `unavailable` is the dashboard's, for a Staryl it cannot reach or
 * has no secret for, and `generic` stands for anything else.
 */
export const SOCIAL_ERROR_CODES = [
	"duplicate",
	"guild-unavailable",
	"channel-not-found",
	"channel-not-supported",
	"missing-permissions",
	"provider-not-configured",
	"provider-not-manageable",
	"limit-reached",
	"x-limit-reached",
	"target-invalid",
	"target-not-found",
	"target-blocked",
	"target-unsupported",
	"target-unreachable",
	"subscription-not-found",
	"send-failed",
	"message-required",
	"streamer-not-found",
	"twitch-failed",
	"invalid",
	"unavailable",
] as const;
export type SocialErrorCode = (typeof SOCIAL_ERROR_CODES)[number] | "generic";

export function isSocialErrorCode(value: unknown): value is (typeof SOCIAL_ERROR_CODES)[number] {
	return (SOCIAL_ERROR_CODES as readonly unknown[]).includes(value);
}
