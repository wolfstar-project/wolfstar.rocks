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
		addSocialTwitch: vi.fn(),
		removeSocialTwitch: vi.fn(),
		body: undefined as unknown,
		params: {} as Record<string, string | undefined>,
	};

	const globals = globalThis as Record<string, unknown>;
	globals.defineWrappedResponseHandler = (fn: unknown) => fn;
	globals.readBody = () => Promise.resolve(mocks.body);
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
	readSocialState: mocks.readSocialState,
	removeSocialSubscription: mocks.removeSocialSubscription,
	setSocialEnabled: mocks.setSocialEnabled,
	addSocialTwitch: mocks.addSocialTwitch,
	removeSocialTwitch: mocks.removeSocialTwitch,
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
import postHandler from "#server/api/guilds/[guild]/social/subscriptions/index.post";
import twitchDeleteHandler from "#server/api/guilds/[guild]/social/twitch/[channel]/[subscription].delete";
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
});
