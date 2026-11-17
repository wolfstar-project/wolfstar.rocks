import type { SocialState, SocialSubscription } from "#shared/utils/social";
import type { SocialDraft } from "~/utils/social";
import { describe, expect, it } from "vitest";
import {
	canAddToSocial,
	emptySocialDraft,
	socialDraftProblem,
	socialDraftRequest,
	socialSourceOptions,
	socialSubscriptionStatus,
} from "~/utils/social";

const CHANNEL = "234567890123456789";

function subscription(overrides: Partial<SocialSubscription> = {}): SocialSubscription {
	return {
		channelId: CHANNEL,
		createdAt: "2026-11-01T10:00:00.000Z",
		deliveryError: null,
		displayName: "Example feed",
		filters: [],
		health: "active",
		lastCheckedAt: null,
		manageable: true,
		message: null,
		provider: "Rss",
		sourceId: "5",
		target: "https://example.com/feed.xml",
		...overrides,
	};
}

function state(overrides: Partial<SocialState> = {}): SocialState {
	return {
		enabled: true,
		installed: true,
		limits: { messageLength: 200, subscriptions: 25, targetLength: 500, xAccounts: 2 },
		providers: [
			{ configured: true, manageable: true, name: "Rss" },
			{ configured: false, manageable: true, name: "YouTube" },
			{ configured: true, manageable: false, name: "Instagram" },
		],
		subscriptions: [],
		twitch: [],
		twitchLiveConfigured: true,
		...overrides,
	};
}

const filled: SocialDraft = {
	...emptySocialDraft(),
	channelId: CHANNEL,
	source: "Rss",
	target: "x",
};
const live: SocialDraft = { ...filled, source: "TwitchLive", target: "shroud" };
const full = () =>
	state({
		limits: { messageLength: 200, subscriptions: 1, targetLength: 500, xAccounts: 2 },
		subscriptions: [subscription()],
	});

describe("socialSourceOptions", () => {
	it("lists Twitch live first, then every source but the connected accounts", () => {
		expect(socialSourceOptions(state()).map((option) => option.source)).toStrictEqual([
			"TwitchLive",
			"Rss",
			"YouTube",
		]);
	});

	// Listed, so an admin sees the source exists; blocked, so no add is sent that Staryl refuses.
	it("blocks a source Staryl has no credentials for", () => {
		const options = socialSourceOptions(state({ twitchLiveConfigured: false }));

		expect(options.map(({ blocked, source }) => ({ blocked, source }))).toStrictEqual([
			{ blocked: "unavailable", source: "TwitchLive" },
			{ blocked: null, source: "Rss" },
			{ blocked: "unavailable", source: "YouTube" },
		]);
	});

	it("counts each source against its own maximum", () => {
		const options = socialSourceOptions(
			state({
				limits: { ...state().limits, twitchLive: 15 },
				providers: [{ configured: true, manageable: true, maximum: 10, name: "YouTube" }],
				subscriptions: [subscription({ provider: "YouTube" }), subscription()],
				twitch: [],
			}),
		);

		expect(options.map(({ source, usage }) => ({ source, usage }))).toStrictEqual([
			{ source: "TwitchLive", usage: { maximum: 15, used: 0 } },
			{ source: "YouTube", usage: { maximum: 10, used: 1 } },
		]);
	});

	it("blocks a source the server has its maximum of, and only that one", () => {
		const options = socialSourceOptions(
			state({
				providers: [
					{ configured: true, manageable: true, maximum: 1, name: "Rss" },
					{ configured: true, manageable: true, maximum: 10, name: "YouTube" },
				],
				subscriptions: [subscription()],
			}),
		);

		expect(options.find((option) => option.source === "Rss")?.blocked).toBe("full");
		expect(options.find((option) => option.source === "YouTube")?.blocked).toBeNull();
	});

	// An older Staryl gives no maximum per platform, and none for Twitch live.
	it("falls back to the total for a platform, and to no limit for Twitch live", () => {
		const options = socialSourceOptions(state());

		expect(options.find((option) => option.source === "Rss")?.usage.maximum).toBe(25);
		expect(options.find((option) => option.source === "TwitchLive")?.usage.maximum).toBeNull();
	});
});

describe("canAddToSocial", () => {
	it("still offers Twitch live once every platform is full", () => {
		expect(canAddToSocial(full())).toBe(true);
		expect(canAddToSocial({ ...full(), twitchLiveConfigured: false })).toBe(false);
	});

	it("has nothing to offer when no source has credentials", () => {
		expect(
			canAddToSocial(
				state({
					providers: [{ configured: false, manageable: true, name: "YouTube" }],
					twitchLiveConfigured: false,
				}),
			),
		).toBe(false);
	});

	it("has nothing to offer when Twitch live is full too", () => {
		expect(
			canAddToSocial({
				...full(),
				limits: { ...full().limits, twitchLive: 1 },
				twitch: [
					{
						channelId: CHANNEL,
						message: null,
						revoked: false,
						streamerId: "1",
						streamerName: null,
						type: "StreamOnline",
					},
				],
			}),
		).toBe(false);
	});
});

describe("socialDraftProblem", () => {
	it("lets a filled draft go", () => {
		expect(socialDraftProblem(filled, state())).toBeNull();
		expect(socialDraftProblem(live, state())).toBeNull();
	});

	it.each([
		["no source", { ...filled, source: null }],
		["a blank target", { ...filled, target: "   " }],
		["no channel", { ...filled, channelId: null }],
	])("holds a draft with %s", (_name, draft) => {
		expect(socialDraftProblem(draft, state())).toBe("incomplete");
	});

	it("names the limit for a social source, since no field can fix it", () => {
		expect(socialDraftProblem(emptySocialDraft(), full())).toBe("incomplete");
		expect(socialDraftProblem({ ...filled, source: "Rss" }, full())).toBe("limit");
	});

	it("does not hold Twitch live to the limit of the social subscriptions", () => {
		expect(socialDraftProblem(live, full())).toBeNull();
	});

	it("asks for a message when the notification is for the end of a stream", () => {
		const offline: SocialDraft = { ...live, event: "StreamOffline" };

		expect(socialDraftProblem(offline, state())).toBe("message");
		expect(
			socialDraftProblem({ ...offline, message: "Thanks for watching" }, state()),
		).toBeNull();
	});
});

describe("socialDraftRequest", () => {
	it("sends a social source to the subscriptions, trimmed, a blank message as none", () => {
		expect(
			socialDraftRequest({ ...filled, message: "   ", target: "  r/discordapp " }),
		).toStrictEqual({
			body: { channelId: CHANNEL, message: null, provider: "Rss", target: "r/discordapp" },
			kind: "social",
		});
	});

	it("sends Twitch live to its own route, with the event", () => {
		expect(
			socialDraftRequest({ ...live, event: "StreamOffline", message: " Bye " }),
		).toStrictEqual({
			body: { channelId: CHANNEL, message: "Bye", streamer: "shroud", type: "StreamOffline" },
			kind: "twitch",
		});
	});

	it("makes no request of a draft without a source", () => {
		expect(socialDraftRequest({ ...filled, source: null })).toBeNull();
	});
});

describe("socialSubscriptionStatus", () => {
	it("says a working subscription works", () => {
		expect(socialSubscriptionStatus(subscription())).toStrictEqual({
			key: "guild_settings.social.health.active",
			tone: "success",
		});
	});

	it("warns of a source Staryl is retrying", () => {
		expect(socialSubscriptionStatus(subscription({ health: "rateLimited" })).tone).toBe(
			"warning",
		);
	});

	// The account can be fine while nothing is posted: the channel is what to fix.
	it("puts a notification that did not reach its channel before the source's health", () => {
		expect(
			socialSubscriptionStatus(
				subscription({ deliveryError: "MissingPermissions", health: "active" }),
			),
		).toStrictEqual({
			key: "guild_settings.social.delivery_errors.MissingPermissions",
			tone: "error",
		});
	});
});
