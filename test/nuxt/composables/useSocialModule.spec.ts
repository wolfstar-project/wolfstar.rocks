import type { SocialState, SocialSubscription } from "#shared/utils/social";
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { createError } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";

const GUILD = "779";
const CHANNEL = "234567890123456789";
const BASE = `/api/guilds/${GUILD}/social`;

function subscription(sourceId: string): SocialSubscription {
	return {
		channelId: CHANNEL,
		createdAt: "2026-11-01T10:00:00.000Z",
		deliveryError: null,
		displayName: `Feed ${sourceId}`,
		filters: [],
		health: "active",
		lastCheckedAt: null,
		manageable: true,
		message: null,
		provider: "Rss",
		sourceId,
		target: `https://example.com/${sourceId}.xml`,
	};
}

function socialState(overrides: Partial<SocialState> = {}): SocialState {
	return {
		enabled: true,
		installed: true,
		limits: { messageLength: 200, subscriptions: 25, targetLength: 500, xAccounts: 2 },
		providers: [{ configured: true, manageable: true, name: "Rss" }],
		subscriptions: [subscription("5")],
		twitch: [],
		...overrides,
	};
}

/** A refusal as the routes make one: its code in the `data` of the error. */
function refusal(statusCode: number, code: string) {
	return createError({ data: { code }, statusCode, statusMessage: "Refused" });
}

let stored: SocialState = socialState();
let readFails = false;
let writeAnswer: () => unknown = () => null;

registerEndpoint(BASE, {
	method: "GET",
	handler: () => {
		if (readFails) throw refusal(503, "unavailable");
		return stored;
	},
});
registerEndpoint(BASE, { method: "PATCH", handler: () => writeAnswer() });
registerEndpoint(`${BASE}/subscriptions`, { method: "POST", handler: () => writeAnswer() });
registerEndpoint(`${BASE}/subscriptions/${CHANNEL}/5`, {
	method: "DELETE",
	handler: () => writeAnswer(),
});

describe("useSocialModule", () => {
	beforeEach(() => {
		stored = socialState();
		readFails = false;
		writeAnswer = () => null;
		clearNuxtData();
	});

	it("is ready once Staryl answered for a server it is in", async () => {
		const { status } = useSocialModule(GUILD);

		expect(status.value).toStrictEqual({ kind: "loading" });
		await vi.waitFor(() => expect(status.value.kind).toBe("ready"));
	});

	it("says Staryl is not in the server, which has nothing to configure then", async () => {
		stored = socialState({ installed: false, subscriptions: [] });
		const { status } = useSocialModule(GUILD);

		await vi.waitFor(() => expect(status.value).toStrictEqual({ kind: "not-installed" }));
	});

	it("says the module is not available when the read fails", async () => {
		readFails = true;
		const { status } = useSocialModule(GUILD);

		await vi.waitFor(() => expect(status.value).toStrictEqual({ kind: "unavailable" }));
	});

	it("shows the switch as it was saved, also when the read after the write fails", async () => {
		const { setEnabled, state, status } = useSocialModule(GUILD);
		await vi.waitFor(() => expect(status.value.kind).toBe("ready"));

		writeAnswer = () => ({ enabled: false });
		readFails = true;
		const result = await setEnabled(false);
		await flushPromises();

		expect(result).toStrictEqual({ ok: true, value: false });
		await vi.waitFor(() => expect(state.value?.enabled).toBe(false));
		// The write went through: a read that failed after it must not hide the module.
		expect(status.value.kind).toBe("ready");
	});

	it("lists what the server answered an add with", async () => {
		const { addSubscription, state, status } = useSocialModule(GUILD);
		await vi.waitFor(() => expect(status.value.kind).toBe("ready"));

		const added = [subscription("5"), subscription("6")];
		writeAnswer = () => ({ subscriptions: added });
		stored = socialState({ subscriptions: added });
		const result = await addSubscription({
			channelId: CHANNEL,
			message: null,
			provider: "Rss",
			target: "https://example.com/6.xml",
		});

		expect(result.ok).toBe(true);
		await vi.waitFor(() =>
			expect(state.value?.subscriptions.map((entry) => entry.sourceId)).toStrictEqual([
				"5",
				"6",
			]),
		);
	});

	it("hands back the code of a refused add, and leaves the list as it was", async () => {
		const { addSubscription, state, status } = useSocialModule(GUILD);
		await vi.waitFor(() => expect(status.value.kind).toBe("ready"));

		writeAnswer = () => {
			throw refusal(409, "duplicate");
		};
		const result = await addSubscription({
			channelId: CHANNEL,
			message: null,
			provider: "Rss",
			target: "https://example.com/5.xml",
		});

		expect(result).toStrictEqual({ code: "duplicate", ok: false });
		expect(state.value?.subscriptions).toHaveLength(1);
	});

	it("reads a failure without a known code as a generic one", async () => {
		const { setEnabled, status } = useSocialModule(GUILD);
		await vi.waitFor(() => expect(status.value.kind).toBe("ready"));

		writeAnswer = () => {
			throw createError({ statusCode: 500, statusMessage: "Internal Server Error" });
		};

		await expect(setEnabled(false)).resolves.toStrictEqual({ code: "generic", ok: false });
	});

	it("takes a subscription that was already gone off the list", async () => {
		const { removeSubscription, state, status } = useSocialModule(GUILD);
		await vi.waitFor(() => expect(status.value.kind).toBe("ready"));

		writeAnswer = () => {
			throw refusal(404, "subscription-not-found");
		};
		stored = socialState({ subscriptions: [] });
		const result = await removeSubscription({ channelId: CHANNEL, sourceId: "5" });

		expect(result).toStrictEqual({ code: "subscription-not-found", ok: false });
		await vi.waitFor(() => expect(state.value?.subscriptions).toStrictEqual([]));
	});
});
