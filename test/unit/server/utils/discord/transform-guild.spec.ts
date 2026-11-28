import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// All Nuxt server auto-import globals that discord.ts uses at module-init time
// (defineCachedFunction / hours) must be present before the module is evaluated.
// vi.hoisted() runs before any static import is resolved.
const { mockGetChannels, mockGuildsGet, guildCache } = vi.hoisted(() => {
	const mockGetChannels = vi.fn();
	const mockGuildsGet = vi.fn();
	const guildCache = new Map<string, unknown>();

	(globalThis as Record<string, unknown>).defineCachedFunction = (
		fn: (...args: unknown[]) => unknown,
		opts?: {
			getKey?: (...args: unknown[]) => string;
			validate?: (entry: { value: unknown }) => boolean;
		},
	) => {
		return async (...args: unknown[]) => {
			const key = opts?.getKey?.(...args) ?? String(args[0]);
			if (guildCache.has(key)) {
				return guildCache.get(key);
			}
			const result = await fn(...args);
			if (opts?.validate === undefined || opts.validate({ value: result })) {
				guildCache.set(key, result);
			}
			return result;
		};
	};
	(globalThis as Record<string, unknown>).hours = (n: number) => n * 3600;
	(globalThis as Record<string, unknown>).useApi = () => ({
		guilds: {
			get: mockGuildsGet,
			getChannels: mockGetChannels,
			getMember: vi.fn().mockRejectedValue(new Error("no member")),
		},
		users: {
			getCurrent: vi.fn(),
			getGuilds: vi.fn(),
			getGuildMember: vi.fn(),
		},
	});
	(globalThis as Record<string, unknown>).instrumentDiscordApiCall = (
		_name: string,
		fn: () => unknown,
	) => fn();
	(globalThis as Record<string, unknown>).instrumentBotApiCall = (
		_name: string,
		fn: () => unknown,
	) => fn();
	(globalThis as Record<string, unknown>).getUserSession = vi.fn();
	(globalThis as Record<string, unknown>).$fetch = vi.fn();
	(globalThis as Record<string, unknown>).useRuntimeConfig = () => ({
		public: { apiBaseUrl: "" },
	});
	(globalThis as Record<string, unknown>).errors = {
		unauthorized: () => Object.assign(new Error("Unauthorized"), { status: 401 }),
	};
	(globalThis as Record<string, unknown>).flattenGuild = (guild: Record<string, unknown>) => ({
		...guild,
		acronym: "TG",
		emojis: [],
		roles: [],
	});
	(globalThis as Record<string, unknown>).guildNameToAcronym = (name: string) =>
		name.slice(0, 2).toUpperCase();
	(globalThis as Record<string, unknown>).logger = {
		warn: vi.fn(),
		info: vi.fn(),
		error: vi.fn(),
		debug: vi.fn(),
	};

	return { mockGetChannels, mockGuildsGet, guildCache };
});

vi.mock("@sentry/nuxt", () => ({
	metrics: { count: vi.fn() },
	startSpan: vi.fn(),
}));

vi.mock("#server/database", () => ({
	readSettings: vi.fn().mockResolvedValue({ rolesAdmin: [] }),
	readSettingsPermissionNodes: vi.fn().mockReturnValue({
		run: vi.fn().mockResolvedValue(null),
	}),
}));

// Every test probes the same guild with its own mocks; the probe memo has its
// own spec (`cache.spec.ts`), so here each probe reaches Discord.
vi.mock("#server/utils/discord/cache", async (importOriginal) => ({
	...(await importOriginal<typeof import("#server/utils/discord/cache")>()),
	removePersistedGuild: vi.fn().mockResolvedValue(undefined),
	rememberGuildProbe: (_guildId: string, run: () => Promise<unknown>) => run(),
}));

import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import { transformGuild } from "#server/utils/discord";
import { invalidateGuildCache } from "#server/utils/discord/cache";

const userId = "user-123";

// oauthGuild.owner: true ensures getManageable short-circuits to true
// without calling manage/getMember/readSettings — isolating includeChannels behaviour.
const oauthGuild: RESTAPIPartialCurrentUserGuild = {
	id: "guild-456",
	name: "Test Guild",
	icon: null,
	owner: true,
	permissions: "8",
	features: [],
};

const mockApiGuild = {
	id: "guild-456",
	name: "Test Guild",
	owner_id: "owner-789",
	roles: [],
	channels: [],
	emojis: [],
	features: [],
	icon: null,
};

describe("transformGuild", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		guildCache.clear();
	});

	it("does not call getGuildChannels and returns channels:[] when includeChannels is false", async () => {
		mockGuildsGet.mockResolvedValue(mockApiGuild);

		const result = await transformGuild(userId, oauthGuild, { includeChannels: false });

		expect(mockGetChannels).not.toHaveBeenCalled();
		expect(result.channels).toEqual([]);
	});

	it("calls getGuildChannels exactly once when includeChannels is true", async () => {
		mockGuildsGet.mockResolvedValue(mockApiGuild);
		mockGetChannels.mockResolvedValue([{ id: "chan-1", name: "general" }]);

		const result = await transformGuild(userId, oauthGuild, { includeChannels: true });

		expect(mockGetChannels).toHaveBeenCalledOnce();
		expect(mockGetChannels).toHaveBeenCalledWith(oauthGuild.id);
		expect(Array.isArray(result.channels)).toBe(true);
	});

	it("calls getGuildChannels exactly once when options are omitted", async () => {
		mockGuildsGet.mockResolvedValue(mockApiGuild);
		mockGetChannels.mockResolvedValue([]);

		await transformGuild(userId, oauthGuild);

		expect(mockGetChannels).toHaveBeenCalledOnce();
	});

	it("response shape always includes manageable, permissions, wolfstarIsIn, and channels", async () => {
		mockGuildsGet.mockResolvedValue(mockApiGuild);
		mockGetChannels.mockResolvedValue([]);

		const result = await transformGuild(userId, oauthGuild);

		expect(result).toHaveProperty("manageable");
		expect(result).toHaveProperty("permissions");
		expect(result).toHaveProperty("wolfstarIsIn");
		expect(result).toHaveProperty("channels");
	});

	it("returns channels:[] and wolfstarIsIn:false when guild is not in bot", async () => {
		mockGuildsGet.mockRejectedValue(Object.assign(new Error("Not found"), { status: 404 }));

		const result = await transformGuild(userId, oauthGuild, { includeChannels: false });

		expect(result.wolfstarIsIn).toBe(false);
		expect(result.manageable).toBe(true);
		expect(result.channels).toEqual([]);
		expect(mockGetChannels).not.toHaveBeenCalled();
	});

	it("falls back to cached guild when live probe fails with a non-404 error", async () => {
		guildCache.set(`guild:${oauthGuild.id}`, mockApiGuild);
		mockGuildsGet.mockRejectedValue(
			Object.assign(new Error("Service unavailable"), { status: 503 }),
		);

		const result = await transformGuild(userId, oauthGuild, { includeChannels: false });

		expect(result.wolfstarIsIn).toBe(true);
		expect(mockGuildsGet).toHaveBeenCalled();
	});
});

describe("the bot's membership probe on Cloudflare Workers", () => {
	const probeKey = "discord:guild-probe:guild-456";
	const stored = new Map<string, unknown>();

	beforeEach(() => {
		vi.clearAllMocks();
		guildCache.clear();
		stored.clear();
		vi.stubGlobal("navigator", { userAgent: "Cloudflare-Workers" });
		vi.stubGlobal("useStorage", () => ({
			getItem: async (key: string) => stored.get(key) ?? null,
			hasItem: async (key: string) => stored.has(key),
			setItem: async (key: string, value: unknown) => {
				stored.set(key, value);
			},
			removeItem: async (key: string) => {
				stored.delete(key);
			},
		}));
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("answers with the probe another isolate shared, without asking Discord", async () => {
		stored.set(probeKey, { at: Date.now() - 30_000, value: mockApiGuild });

		const result = await transformGuild(userId, oauthGuild, { includeChannels: false });

		expect(mockGuildsGet).not.toHaveBeenCalled();
		expect(result.wolfstarIsIn).toBe(true);
	});

	it("answers that the bot is absent from a shared probe", async () => {
		stored.set(probeKey, { at: Date.now(), value: null });

		const result = await transformGuild(userId, oauthGuild, { includeChannels: false });

		expect(mockGuildsGet).not.toHaveBeenCalled();
		expect(result.wolfstarIsIn).toBe(false);
	});

	it("answers that the bot is absent from a shared probe five minutes old", async () => {
		stored.set(probeKey, { at: Date.now() - 5 * 60_000, value: null });

		const result = await transformGuild(userId, oauthGuild, { includeChannels: false });

		expect(mockGuildsGet).not.toHaveBeenCalled();
		expect(result.wolfstarIsIn).toBe(false);
	});

	it("asks Discord once a shared probe that found the bot absent is ten minutes old", async () => {
		stored.set(probeKey, { at: Date.now() - 10 * 60_000 - 1_000, value: null });
		mockGuildsGet.mockResolvedValue(mockApiGuild);

		const result = await transformGuild(userId, oauthGuild, { includeChannels: false });

		expect(mockGuildsGet).toHaveBeenCalledOnce();
		expect(result.wolfstarIsIn).toBe(true);
	});

	it("asks Discord after an invalidation here older than a minute", async () => {
		vi.useFakeTimers({ toFake: ["Date"] });
		const before = Date.now() - 1_000;
		await invalidateGuildCache("guild-456");
		stored.set(probeKey, { at: before, value: null });
		vi.setSystemTime(Date.now() + 2 * 60_000);
		mockGuildsGet.mockResolvedValue(mockApiGuild);

		const result = await transformGuild(userId, oauthGuild, { includeChannels: false });
		vi.useRealTimers();

		expect(mockGuildsGet).toHaveBeenCalledOnce();
		expect(result.wolfstarIsIn).toBe(true);
	});

	it("asks Discord once the shared probe of a guild with the bot is older than its window, and shares the answer", async () => {
		stored.set(probeKey, { at: Date.now() - 61_000, value: mockApiGuild });
		mockGuildsGet.mockResolvedValue(mockApiGuild);

		const result = await transformGuild(userId, oauthGuild, { includeChannels: false });

		expect(mockGuildsGet).toHaveBeenCalledOnce();
		expect(result.wolfstarIsIn).toBe(true);
		await vi.waitFor(() => expect(stored.get(probeKey)).toMatchObject({ value: mockApiGuild }));
	});

	it("shares that the bot is absent when Discord answers 404", async () => {
		mockGuildsGet.mockRejectedValue(Object.assign(new Error("Unknown Guild"), { status: 404 }));

		const result = await transformGuild(userId, oauthGuild, { includeChannels: false });

		expect(result.wolfstarIsIn).toBe(false);
		await vi.waitFor(() => expect(stored.get(probeKey)).toMatchObject({ value: null }));
	});

	it("asks Discord again after the guild cache was invalidated here", async () => {
		stored.set(probeKey, { at: Date.now() - 1_000, value: null });
		await invalidateGuildCache("guild-456");
		stored.set(probeKey, { at: Date.now() - 1_000, value: null });
		mockGuildsGet.mockResolvedValue(mockApiGuild);

		const result = await transformGuild(userId, oauthGuild, { includeChannels: false });

		expect(mockGuildsGet).toHaveBeenCalledOnce();
		expect(result.wolfstarIsIn).toBe(true);
	});

	it("does not share an answer that a refresh overtook", async () => {
		let finish: (guild: unknown) => void = () => {};
		mockGuildsGet.mockReturnValue(
			new Promise((resolve) => {
				finish = resolve;
			}),
		);

		const stale = transformGuild(userId, oauthGuild, { includeChannels: false });
		await vi.waitFor(() => expect(mockGuildsGet).toHaveBeenCalledOnce());
		await new Promise((resolve) => setTimeout(resolve, 2));
		await invalidateGuildCache("guild-456");
		finish(mockApiGuild);
		await stale;

		expect(stored.has(probeKey)).toBe(false);
	});

	it("shares nothing when Discord fails", async () => {
		mockGuildsGet.mockRejectedValue(Object.assign(new Error("Bad Gateway"), { status: 502 }));

		await transformGuild(userId, oauthGuild, { includeChannels: false });

		expect(stored.has(probeKey)).toBe(false);
	});
});

// Mock the explicit server imports at the same boundaries as the former globals.
vi.mock("nitro/kv", () => ({
	useKV: (...args: unknown[]) =>
		(Reflect.get(globalThis, "useStorage") as (...args: unknown[]) => unknown)(...args),
}));
vi.mock("nitro/cache", () => ({
	defineCachedFunction: (...args: unknown[]) =>
		(Reflect.get(globalThis, "defineCachedFunction") as (...args: unknown[]) => unknown)(
			...args,
		),
}));
vi.mock("#server/utils/shared", () => ({
	useApi: (...args: unknown[]) =>
		(Reflect.get(globalThis, "useApi") as (...args: unknown[]) => unknown)(...args),
}));
vi.mock("#server/utils/sentry/metrics", () => ({
	instrumentDiscordApiCall: (...args: unknown[]) =>
		(Reflect.get(globalThis, "instrumentDiscordApiCall") as (...args: unknown[]) => unknown)(
			...args,
		),
	instrumentBotApiCall: (...args: unknown[]) =>
		(Reflect.get(globalThis, "instrumentBotApiCall") as (...args: unknown[]) => unknown)(
			...args,
		),
}));
vi.mock("nuxt/server", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	useRuntimeConfig: (...args: unknown[]) =>
		(Reflect.get(globalThis, "useRuntimeConfig") as (...args: unknown[]) => unknown)(...args),
}));
vi.mock("#server/utils/errors", () => ({
	errors: (...args: unknown[]) =>
		(Reflect.get(globalThis, "errors") as (...args: unknown[]) => unknown)(...args),
}));
vi.mock("#server/utils/ApiTransformers", () => ({
	flattenGuild: (...args: unknown[]) =>
		(Reflect.get(globalThis, "flattenGuild") as (...args: unknown[]) => unknown)(...args),
}));
vi.mock("#server/utils/guildNameToAcronym", () => ({
	guildNameToAcronym: (...args: unknown[]) =>
		(Reflect.get(globalThis, "guildNameToAcronym") as (...args: unknown[]) => unknown)(...args),
}));
