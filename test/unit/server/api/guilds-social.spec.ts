import type { SocialSubscription } from "#shared/utils/social";
import { beforeEach, describe, expect, it, vi } from "vitest";

const GUILD = "100000000000000009";
const CHANNEL = "400000000000000001";
const MEMBER = "500000000000000001";

// vi.hoisted() ensures globals are present before the route modules are evaluated.
const { mocks } = vi.hoisted(() => {
	const mocks = {
		audit: vi.fn(),
		logSet: vi.fn(),
		status: vi.fn(),
		readSocialState: vi.fn(),
		setSocialEnabled: vi.fn(),
		addSocialSubscription: vi.fn(),
		removeSocialSubscription: vi.fn(),
		editSocialSubscription: vi.fn(),
		editSocialTwitch: vi.fn(),
		addSocialTwitch: vi.fn(),
		removeSocialTwitch: vi.fn(),
		body: undefined as unknown,
		query: {} as Record<string, unknown>,
		searchSocialTargets: vi.fn(),
		params: {} as Record<string, string | undefined>,
	};

	const globals = globalThis as Record<string, unknown>;
	globals.defineWrappedResponseHandler = (fn: unknown) => fn;
	globals.readBody = () => Promise.resolve(mocks.body);
	globals.getQuery = () => mocks.query;
	globals.getRouterParam = (_event: unknown, name: string) => mocks.params[name];
	globals.setResponseStatus = (_event: unknown, status: number) => mocks.status(status);
	globals.seconds = (n: number) => n;

	return { mocks };
});

vi.mock("#server/utils/guilds/manager", () => ({
	authorizeGuildManager: () => vi.fn(),
	useManagedGuild: () => ({
		guild: { id: "100000000000000009" },
		member: { user: { id: "500000000000000001", username: "alice" } },
	}),
}));

vi.mock("#server/utils/social/staryl", () => ({
	addSocialSubscription: mocks.addSocialSubscription,
	editSocialSubscription: mocks.editSocialSubscription,
	editSocialTwitch: mocks.editSocialTwitch,
	readSocialState: mocks.readSocialState,
	removeSocialSubscription: mocks.removeSocialSubscription,
	setSocialEnabled: mocks.setSocialEnabled,
	addSocialTwitch: mocks.addSocialTwitch,
	removeSocialTwitch: mocks.removeSocialTwitch,
	searchSocialTargets: mocks.searchSocialTargets,
}));

vi.mock("evlog", async (importOriginal) => ({
	...(await importOriginal<typeof import("evlog")>()),
	useLogger: vi.fn().mockReturnValue({ set: mocks.logSet, error: vi.fn() }),
	withAuditMethods: (log: object) => ({ ...log, audit: mocks.audit }),
}));

import type { H3Event } from "h3";
import getHandler from "#server/api/guilds/[guild]/social/index.get";
import patchHandler from "#server/api/guilds/[guild]/social/index.patch";
import deleteHandler from "#server/api/guilds/[guild]/social/subscriptions/[channel]/[source].delete";
import editHandler from "#server/api/guilds/[guild]/social/subscriptions/[channel]/[source].patch";
import postHandler from "#server/api/guilds/[guild]/social/subscriptions/index.post";
import targetsHandler from "#server/api/guilds/[guild]/social/targets.get";
import twitchDeleteHandler from "#server/api/guilds/[guild]/social/twitch/[channel]/[subscription].delete";
import twitchEditHandler from "#server/api/guilds/[guild]/social/twitch/[channel]/[subscription].patch";
import twitchPostHandler from "#server/api/guilds/[guild]/social/twitch/index.post";

type Handler = (event: H3Event) => Promise<unknown>;
const call = (handler: unknown) => (handler as Handler)({} as H3Event);

const subscription: SocialSubscription = {
	channelId: CHANNEL,
	createdAt: "2026-11-01T10:00:00.000Z",
	deliveryError: null,
	displayName: "Example feed",
	filters: [],
	health: "active",
	lastCheckedAt: null,
	manageable: true,
	message: "New post",
	provider: "Rss",
	sourceId: "5",
	target: "https://example.com/feed.xml",
};

const ok = <Value>(value: Value) => ({ ok: true, value });
const refused = (status: number, code: string) => ({
	error: { code, kind: "refused", status },
	ok: false,
});

/** The patch of the audit event a route emitted. */
function auditedPatch(): unknown {
	return mocks.audit.mock.calls[0]?.[0]?.changes?.patch;
}

describe("the Social module's routes", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.body = undefined;
		mocks.params = {};
	});

	describe("GET /api/guilds/:guild/social", () => {
		it("answers with the module as Staryl holds it, read for the member who asks", async () => {
			const state = { enabled: true, installed: true };
			mocks.readSocialState.mockResolvedValue(ok(state));

			await expect(call(getHandler)).resolves.toBe(state);
			expect(mocks.readSocialState).toHaveBeenCalledWith(GUILD, MEMBER);
		});

		it.each([
			["has no secret for Staryl", { kind: "not-configured" }],
			["cannot reach Staryl", { kind: "unreachable", status: null }],
			["gets an answer it does not know", { kind: "invalid-answer", issues: ["x"] }],
		])("answers 503 when the dashboard %s", async (_name, error) => {
			mocks.readSocialState.mockResolvedValue({ error, ok: false });

			await expect(call(getHandler)).rejects.toMatchObject({
				data: { code: "unavailable" },
				statusCode: 503,
			});
			// What went wrong is kept for the log, since the member is told only that it failed.
			expect(mocks.logSet).toHaveBeenCalledWith({ staryl: error });
		});
	});

	describe("PATCH /api/guilds/:guild/social", () => {
		it("turns the module off and records the change", async () => {
			mocks.body = { enabled: false };
			mocks.setSocialEnabled.mockResolvedValue(ok({ enabled: false, previous: true }));

			await expect(call(patchHandler)).resolves.toStrictEqual({ enabled: false });

			expect(mocks.setSocialEnabled).toHaveBeenCalledWith(GUILD, MEMBER, false);
			expect(auditedPatch()).toStrictEqual([
				{ from: true, op: "replace", path: "/social.enabled", value: false },
			]);
		});

		it("records nothing for a switch that already had the value", async () => {
			mocks.body = { enabled: true };
			mocks.setSocialEnabled.mockResolvedValue(ok({ enabled: true, previous: true }));

			await call(patchHandler);

			expect(mocks.audit).not.toHaveBeenCalled();
		});

		it.each([[{}], [{ enabled: "false" }], [null]])(
			"refuses the body %j without asking Staryl",
			async (body) => {
				mocks.body = body;

				await expect(call(patchHandler)).rejects.toMatchObject({
					data: { code: "invalid" },
					statusCode: 400,
				});
				expect(mocks.setSocialEnabled).not.toHaveBeenCalled();
			},
		);
	});

	describe("POST /api/guilds/:guild/social/subscriptions", () => {
		const body = {
			channelId: CHANNEL,
			provider: "Rss",
			target: "  https://example.com/feed.xml ",
		};

		it("adds the subscription, answers 201 with the list and records what was added", async () => {
			mocks.body = { ...body, message: "New post" };
			mocks.addSocialSubscription.mockResolvedValue(
				ok({ subscription, subscriptions: [subscription] }),
			);

			await expect(call(postHandler)).resolves.toStrictEqual({
				subscriptions: [subscription],
			});

			expect(mocks.status).toHaveBeenCalledWith(201);
			expect(mocks.addSocialSubscription).toHaveBeenCalledWith(GUILD, MEMBER, {
				channelId: CHANNEL,
				message: "New post",
				provider: "Rss",
				target: "https://example.com/feed.xml",
			});
			expect(auditedPatch()).toStrictEqual([
				{
					op: "add",
					path: `/social.${CHANNEL}.5`,
					value: {
						message: "New post",
						name: "Example feed",
						provider: "Rss",
						target: "https://example.com/feed.xml",
					},
				},
			]);
		});

		// Staryl saved it and could not list the subscriptions: still an add, with no list.
		it("answers 201 with no list when Staryl could not read one after the add", async () => {
			mocks.body = body;
			mocks.addSocialSubscription.mockResolvedValue(
				ok({ subscription: null, subscriptions: null }),
			);

			await expect(call(postHandler)).resolves.toStrictEqual({ subscriptions: null });

			expect(mocks.status).toHaveBeenCalledWith(201);
			// The add went through, so it is recorded, from what was asked for.
			expect(auditedPatch()).toStrictEqual([
				{
					op: "add",
					path: `/social.${CHANNEL}.unknown`,
					value: expect.objectContaining({
						provider: "Rss",
						target: "https://example.com/feed.xml",
					}),
				},
			]);
		});

		it("sends a blank message as none", async () => {
			mocks.body = { ...body, message: "   " };
			mocks.addSocialSubscription.mockResolvedValue(
				ok({ subscription, subscriptions: [subscription] }),
			);

			await call(postHandler);

			expect(mocks.addSocialSubscription).toHaveBeenCalledWith(
				GUILD,
				MEMBER,
				expect.objectContaining({ message: null }),
			);
		});

		it.each([
			["a platform Staryl does not have", { ...body, provider: "Myspace" }],
			["a blank target", { ...body, target: "   " }],
			["a target over the limit", { ...body, target: "x".repeat(501) }],
			["a channel that is not an ID", { ...body, channelId: "general" }],
			["a message over the limit", { ...body, message: "x".repeat(201) }],
		])("refuses %s without asking Staryl", async (_name, invalid) => {
			mocks.body = invalid;

			await expect(call(postHandler)).rejects.toMatchObject({
				data: { code: "invalid" },
				statusCode: 400,
			});
			expect(mocks.addSocialSubscription).not.toHaveBeenCalled();
		});

		it("passes on why Staryl refused, with its status", async () => {
			mocks.body = body;
			mocks.addSocialSubscription.mockResolvedValue(refused(422, "target-not-found"));

			await expect(call(postHandler)).rejects.toMatchObject({
				data: { code: "target-not-found" },
				statusCode: 422,
			});
			expect(mocks.audit).not.toHaveBeenCalled();
		});

		it("does not pass on a code the dashboard has no sentence for", async () => {
			mocks.body = body;
			mocks.addSocialSubscription.mockResolvedValue(refused(422, "brand-new-code"));

			await expect(call(postHandler)).rejects.toMatchObject({
				data: { code: "generic" },
				statusCode: 422,
			});
		});
	});

	describe("DELETE /api/guilds/:guild/social/subscriptions/:channel/:source", () => {
		it("removes the subscription and records what was removed", async () => {
			mocks.params = { channel: CHANNEL, source: "5" };
			mocks.removeSocialSubscription.mockResolvedValue(
				ok({ removed: subscription, subscriptions: [] }),
			);

			await expect(call(deleteHandler)).resolves.toStrictEqual({ subscriptions: [] });

			expect(mocks.removeSocialSubscription).toHaveBeenCalledWith(
				GUILD,
				MEMBER,
				CHANNEL,
				"5",
			);
			expect(auditedPatch()).toStrictEqual([
				{
					from: expect.objectContaining({ name: "Example feed", provider: "Rss" }),
					op: "remove",
					path: `/social.${CHANNEL}.5`,
				},
			]);
		});

		// Both end up in the path of the call to Staryl.
		it.each([
			["a channel that is not an ID", { channel: "general", source: "5" }],
			["a source that climbs the path", { channel: CHANNEL, source: "../../1" }],
			["no source", { channel: CHANNEL }],
		])("refuses %s without asking Staryl", async (_name, params) => {
			mocks.params = params;

			await expect(call(deleteHandler)).rejects.toMatchObject({
				data: { code: "invalid" },
				statusCode: 400,
			});
			expect(mocks.removeSocialSubscription).not.toHaveBeenCalled();
		});

		it("answers 404 for a subscription Staryl does not have", async () => {
			mocks.params = { channel: CHANNEL, source: "5" };
			mocks.removeSocialSubscription.mockResolvedValue(
				refused(404, "subscription-not-found"),
			);

			await expect(call(deleteHandler)).rejects.toMatchObject({
				data: { code: "subscription-not-found" },
				statusCode: 404,
			});
		});
	});

	describe("PATCH /api/guilds/:guild/social/subscriptions/:channel/:source", () => {
		const OTHER = "400000000000000002";

		it("changes the message and records it under the same subscription", async () => {
			mocks.params = { channel: CHANNEL, source: "5" };
			mocks.body = { channelId: CHANNEL, message: "  Fresh  " };
			const edited = { ...subscription, message: "Fresh" };
			mocks.editSocialSubscription.mockResolvedValue(
				ok({ previous: subscription, subscription: edited, subscriptions: [edited] }),
			);

			await expect(call(editHandler)).resolves.toStrictEqual({ subscriptions: [edited] });

			expect(mocks.editSocialSubscription).toHaveBeenCalledWith(
				GUILD,
				MEMBER,
				{ channelId: CHANNEL, sourceId: "5" },
				{ channelId: CHANNEL, message: "Fresh" },
			);
			expect(JSON.stringify(auditedPatch())).toContain("Fresh");
			expect(JSON.stringify(auditedPatch())).toContain(`/social.${CHANNEL}.5`);
		});

		it("records a move as leaving one channel and arriving in the other", async () => {
			mocks.params = { channel: CHANNEL, source: "5" };
			mocks.body = { channelId: OTHER, message: "" };
			const moved = { ...subscription, channelId: OTHER, message: null };
			mocks.editSocialSubscription.mockResolvedValue(
				ok({ previous: subscription, subscription: moved, subscriptions: [moved] }),
			);

			await call(editHandler);

			expect(mocks.editSocialSubscription).toHaveBeenCalledWith(
				GUILD,
				MEMBER,
				{ channelId: CHANNEL, sourceId: "5" },
				{ channelId: OTHER, message: null },
			);
			expect(auditedPatch()).toStrictEqual(
				expect.arrayContaining([
					expect.objectContaining({ op: "remove", path: `/social.${CHANNEL}.5` }),
					expect.objectContaining({ op: "add", path: `/social.${OTHER}.5` }),
				]),
			);
		});

		it.each([
			[
				"a source that climbs the path",
				{ channel: CHANNEL, source: "../1" },
				{ channelId: CHANNEL },
			],
			[
				"a channel that is not an ID",
				{ channel: CHANNEL, source: "5" },
				{ channelId: "news" },
			],
			[
				"a message over the limit",
				{ channel: CHANNEL, source: "5" },
				{ channelId: CHANNEL, message: "x".repeat(201) },
			],
		])("refuses %s without asking Staryl", async (_name, params, body) => {
			mocks.params = params;
			mocks.body = body;

			await expect(call(editHandler)).rejects.toMatchObject({
				data: { code: "invalid" },
				statusCode: 400,
			});
			expect(mocks.editSocialSubscription).not.toHaveBeenCalled();
		});

		it("keeps the saved message when the body leaves it out", async () => {
			mocks.params = { channel: CHANNEL, source: "5" };
			mocks.body = { channelId: OTHER };
			const moved = { ...subscription, channelId: OTHER };
			mocks.editSocialSubscription.mockResolvedValue(
				ok({ previous: subscription, subscription: moved, subscriptions: [moved] }),
			);

			await call(editHandler);

			expect(mocks.editSocialSubscription.mock.calls[0]?.[3]).toStrictEqual({
				channelId: OTHER,
			});
		});

		it("passes on that the new channel already follows the account", async () => {
			mocks.params = { channel: CHANNEL, source: "5" };
			mocks.body = { channelId: OTHER };
			mocks.editSocialSubscription.mockResolvedValue(refused(409, "duplicate"));

			await expect(call(editHandler)).rejects.toMatchObject({
				data: { code: "duplicate" },
				statusCode: 409,
			});
			expect(mocks.audit).not.toHaveBeenCalled();
		});
	});

	describe("PATCH /api/guilds/:guild/social/twitch/:channel/:subscription", () => {
		const live = {
			channelId: CHANNEL,
			message: "Bye",
			revoked: false,
			streamerId: "123",
			streamerName: "CoolStreamer",
			subscriptionId: "7",
			type: "StreamOffline" as const,
		};

		it("changes the message and records the change", async () => {
			mocks.params = { channel: CHANNEL, subscription: "7" };
			mocks.body = { channelId: CHANNEL, message: "See you" };
			const edited = { ...live, message: "See you" };
			mocks.editSocialTwitch.mockResolvedValue(
				ok({ previous: live, subscription: edited, twitch: [edited] }),
			);

			await expect(call(twitchEditHandler)).resolves.toStrictEqual({ twitch: [edited] });

			expect(mocks.editSocialTwitch).toHaveBeenCalledWith(
				GUILD,
				MEMBER,
				{ channelId: CHANNEL, subscriptionId: "7" },
				{ channelId: CHANNEL, message: "See you" },
			);
			expect(JSON.stringify(auditedPatch())).toContain("See you");
		});

		it("passes on that an end of stream keeps its message", async () => {
			mocks.params = { channel: CHANNEL, subscription: "7" };
			mocks.body = { channelId: CHANNEL, message: "" };
			mocks.editSocialTwitch.mockResolvedValue(refused(422, "message-required"));

			await expect(call(twitchEditHandler)).rejects.toMatchObject({
				data: { code: "message-required" },
				statusCode: 422,
			});
		});

		it("refuses a subscription that climbs the path, without asking Staryl", async () => {
			mocks.params = { channel: CHANNEL, subscription: "../7" };
			mocks.body = { channelId: CHANNEL };

			await expect(call(twitchEditHandler)).rejects.toMatchObject({
				data: { code: "invalid" },
				statusCode: 400,
			});
			expect(mocks.editSocialTwitch).not.toHaveBeenCalled();
		});
	});

	describe("POST /api/guilds/:guild/social/twitch", () => {
		const live = {
			channelId: CHANNEL,
			message: null,
			revoked: false,
			streamerId: "123",
			streamerName: "CoolStreamer",
			subscriptionId: "7",
			type: "StreamOnline" as const,
		};
		const body = { channelId: CHANNEL, streamer: " @shroud ", type: "StreamOnline" };

		it("follows the streamer, answers 201 with the list and records the add", async () => {
			mocks.body = body;
			mocks.addSocialTwitch.mockResolvedValue(ok({ subscription: live, twitch: [live] }));

			await expect(call(twitchPostHandler)).resolves.toStrictEqual({ twitch: [live] });

			expect(mocks.status).toHaveBeenCalledWith(201);
			expect(mocks.addSocialTwitch).toHaveBeenCalledWith(GUILD, MEMBER, {
				channelId: CHANNEL,
				message: null,
				streamer: "@shroud",
				type: "StreamOnline",
			});
			expect(auditedPatch()).toStrictEqual([
				{
					op: "add",
					path: `/social.twitch.${CHANNEL}.7`,
					value: { event: "StreamOnline", message: null, streamer: "CoolStreamer" },
				},
			]);
		});

		it.each([
			["an end of stream without a message", { ...body, type: "StreamOffline" }],
			["a login with a space", { ...body, streamer: "cool streamer" }],
			["an unknown event", { ...body, type: "StreamRaid" }],
			["a channel that is not an ID", { ...body, channelId: "news" }],
		])("refuses %s without asking Staryl", async (_name, invalid) => {
			mocks.body = invalid;

			await expect(call(twitchPostHandler)).rejects.toMatchObject({
				data: { code: "invalid" },
				statusCode: 400,
			});
			expect(mocks.addSocialTwitch).not.toHaveBeenCalled();
		});

		it("passes on that Twitch has no such streamer", async () => {
			mocks.body = body;
			mocks.addSocialTwitch.mockResolvedValue(refused(422, "streamer-not-found"));

			await expect(call(twitchPostHandler)).rejects.toMatchObject({
				data: { code: "streamer-not-found" },
				statusCode: 422,
			});
		});
	});

	describe("DELETE /api/guilds/:guild/social/twitch/:channel/:subscription", () => {
		it("removes the subscription and records what was removed", async () => {
			mocks.params = { channel: CHANNEL, subscription: "7" };
			mocks.removeSocialTwitch.mockResolvedValue(
				ok({
					removed: {
						channelId: CHANNEL,
						message: "Bye",
						revoked: false,
						streamerId: "123",
						streamerName: null,
						subscriptionId: "7",
						type: "StreamOffline",
					},
					twitch: [],
				}),
			);

			await expect(call(twitchDeleteHandler)).resolves.toStrictEqual({ twitch: [] });

			expect(mocks.removeSocialTwitch).toHaveBeenCalledWith(GUILD, MEMBER, CHANNEL, "7");
			// Twitch did not give the name: the id stands in for it.
			expect(auditedPatch()).toStrictEqual([
				{
					from: { event: "StreamOffline", message: "Bye", streamer: "123" },
					op: "remove",
					path: `/social.twitch.${CHANNEL}.7`,
				},
			]);
		});

		it("refuses a subscription that climbs the path, without asking Staryl", async () => {
			mocks.params = { channel: CHANNEL, subscription: "../7" };

			await expect(call(twitchDeleteHandler)).rejects.toMatchObject({
				data: { code: "invalid" },
				statusCode: 400,
			});
			expect(mocks.removeSocialTwitch).not.toHaveBeenCalled();
		});
	});

	describe("GET /api/guilds/:guild/social/targets", () => {
		it("passes the search on to Staryl and answers its suggestions", async () => {
			mocks.query = { query: " shro ", source: "TwitchLive" };
			const suggestions = { suggestions: [{ name: "Shroud", value: "shroud" }] };
			mocks.searchSocialTargets.mockResolvedValue(ok(suggestions));

			await expect(call(targetsHandler)).resolves.toBe(suggestions);
			expect(mocks.searchSocialTargets).toHaveBeenCalledWith(
				GUILD,
				MEMBER,
				"TwitchLive",
				"shro",
			);
		});

		// Staryl before the search route: no suggestion, and nothing logged as an outage.
		it("answers no suggestion to a Staryl without the search", async () => {
			mocks.query = { query: "bsky", source: "Bluesky" };
			mocks.searchSocialTargets.mockResolvedValue({
				error: { kind: "unreachable", status: 404 },
				ok: false,
			});

			await expect(call(targetsHandler)).resolves.toStrictEqual({ suggestions: [] });
			expect(mocks.logSet).not.toHaveBeenCalled();
		});

		it("still reports Staryl as unavailable when it is down", async () => {
			mocks.query = { query: "bsky", source: "Bluesky" };
			mocks.searchSocialTargets.mockResolvedValue({
				error: { kind: "unreachable", status: 502 },
				ok: false,
			});

			await expect(call(targetsHandler)).rejects.toMatchObject({ statusCode: 503 });
		});

		it.each([
			["an unknown source", { query: "tom", source: "Myspace" }],
			["no query", { source: "Bluesky" }],
			["a query longer than any handle", { query: "b".repeat(101), source: "Bluesky" }],
		])("refuses %s without asking Staryl", async (_name, query) => {
			mocks.query = query;

			await expect(call(targetsHandler)).rejects.toMatchObject({
				data: { code: "invalid" },
				statusCode: 400,
			});
			expect(mocks.searchSocialTargets).not.toHaveBeenCalled();
		});
	});
});

// Mock the explicit server imports at the same boundaries as the former globals.
vi.mock("#server/utils/wrappedEventHandler", () => ({
	defineWrappedResponseHandler: (...args: unknown[]) =>
		(
			Reflect.get(globalThis, "defineWrappedResponseHandler") as (
				...args: unknown[]
			) => unknown
		)(...args),
}));
vi.mock("nuxt/server", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	readBody: (...args: unknown[]) =>
		(Reflect.get(globalThis, "readBody") as (...args: unknown[]) => unknown)(...args),
	getQuery: (...args: unknown[]) =>
		(Reflect.get(globalThis, "getQuery") as (...args: unknown[]) => unknown)(...args),
	getRouterParam: (...args: unknown[]) =>
		(Reflect.get(globalThis, "getRouterParam") as (...args: unknown[]) => unknown)(...args),
	setResponseStatus: (...args: unknown[]) =>
		(Reflect.get(globalThis, "setResponseStatus") as (...args: unknown[]) => unknown)(...args),
}));
