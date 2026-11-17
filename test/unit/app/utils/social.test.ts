import type { SocialState, SocialSubscription } from "#shared/utils/social";
import { describe, expect, it } from "vitest";
import {
	addableSocialProviders,
	emptySocialDraft,
	socialDraftBody,
	socialDraftProblem,
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
		...overrides,
	};
}

const filled = { ...emptySocialDraft(), channelId: CHANNEL, provider: "Rss", target: "x" } as const;

describe("addableSocialProviders", () => {
	it("offers only what Staryl can read and lets the dashboard change", () => {
		expect(addableSocialProviders(state())).toStrictEqual(["Rss"]);
	});
});

describe("socialDraftProblem", () => {
	it("lets a filled draft go", () => {
		expect(socialDraftProblem(filled, state())).toBeNull();
	});

	it.each([
		["no source", { ...filled, provider: null }],
		["a blank target", { ...filled, target: "   " }],
		["no channel", { ...filled, channelId: null }],
	])("holds a draft with %s", (_name, draft) => {
		expect(socialDraftProblem(draft, state())).toBe("incomplete");
	});

	it("names the limit before anything else, since no field can fix it", () => {
		const full = state({
			limits: { messageLength: 200, subscriptions: 1, targetLength: 500, xAccounts: 2 },
			subscriptions: [subscription()],
		});

		expect(socialDraftProblem(emptySocialDraft(), full)).toBe("limit");
	});
});

describe("socialDraftBody", () => {
	it("trims the target and sends a blank message as none", () => {
		expect(
			socialDraftBody({ ...filled, message: "   ", target: "  r/discordapp " }),
		).toStrictEqual({
			channelId: CHANNEL,
			message: null,
			provider: "Rss",
			target: "r/discordapp",
		});
	});

	it("makes no body of a draft without a source", () => {
		expect(socialDraftBody({ ...filled, provider: null })).toBeNull();
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
