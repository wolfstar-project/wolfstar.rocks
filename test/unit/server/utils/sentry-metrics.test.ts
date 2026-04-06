import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSetAttribute = vi.fn();
const mockSetStatus = vi.fn();

vi.mock("@sentry/nuxt", () => ({
	startSpan: vi.fn(
		(
			_options: unknown,
			callback: (span: {
				setAttribute: typeof mockSetAttribute;
				setStatus: typeof mockSetStatus;
			}) => unknown,
		) => callback({ setAttribute: mockSetAttribute, setStatus: mockSetStatus }),
	),
}));

import {
	instrumentBotApiCall,
	instrumentCacheGet,
	instrumentCachePut,
	instrumentDiscordApiCall,
} from "#server/utils/sentry-metrics";
import * as Sentry from "@sentry/nuxt";

describe("instrumentCacheGet", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("sets cache.hit=true and cache.item_size on cache hit", async () => {
		const value = { foo: "bar" };
		const result = await instrumentCacheGet("test-key", () => Promise.resolve(value));

		expect(result).toBe(value);
		expect(Sentry.startSpan).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "test-key",
				op: "cache.get",
				attributes: expect.objectContaining({
					"cache.key": ["test-key"],
				}),
			}),
			expect.any(Function),
		);
		expect(mockSetAttribute).toHaveBeenCalledWith("cache.hit", true);
		expect(mockSetAttribute).toHaveBeenCalledWith(
			"cache.item_size",
			JSON.stringify(value).length,
		);
	});

	it("sets cache.hit=false on cache miss (null)", async () => {
		const result = await instrumentCacheGet("miss-key", () => Promise.resolve(null));

		expect(result).toBeNull();
		expect(mockSetAttribute).toHaveBeenCalledWith("cache.hit", false);
		expect(mockSetAttribute).not.toHaveBeenCalledWith("cache.item_size", expect.anything());
	});

	it("propagates errors from fn", async () => {
		const error = new Error("read failure");
		await expect(instrumentCacheGet("err-key", () => Promise.reject(error))).rejects.toThrow(
			"read failure",
		);
	});
});

describe("instrumentCachePut", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("calls fn and sets cache.key attribute", async () => {
		const fn = vi.fn().mockResolvedValue(undefined);
		await instrumentCachePut("put-key", fn);

		expect(fn).toHaveBeenCalledOnce();
		expect(Sentry.startSpan).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "put-key",
				op: "cache.put",
				attributes: expect.objectContaining({
					"cache.key": ["put-key"],
				}),
			}),
			expect.any(Function),
		);
	});

	it("includes item_size when provided", async () => {
		const fn = vi.fn().mockResolvedValue(undefined);
		await instrumentCachePut("sized-key", fn, 42);

		expect(Sentry.startSpan).toHaveBeenCalledWith(
			expect.objectContaining({
				attributes: expect.objectContaining({
					"cache.item_size": 42,
				}),
			}),
			expect.any(Function),
		);
	});

	it("propagates errors from fn", async () => {
		const error = new Error("write failure");
		await expect(instrumentCachePut("err-key", () => Promise.reject(error))).rejects.toThrow(
			"write failure",
		);
	});
});

describe("instrumentDiscordApiCall", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("wraps a successful Discord API call in a span with ok status", async () => {
		const data = { id: "123", username: "test" };
		const result = await instrumentDiscordApiCall("users.getCurrent", () =>
			Promise.resolve(data),
		);

		expect(result).toBe(data);
		expect(Sentry.startSpan).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "discord.api users.getCurrent",
				op: "http.client.discord",
				attributes: expect.objectContaining({
					"server.address": "discord.com",
					"discord.endpoint": "users.getCurrent",
				}),
			}),
			expect.any(Function),
		);
		expect(mockSetStatus).toHaveBeenCalledWith({ code: 1, message: "ok" });
	});

	it("sets error status and error.type on failure", async () => {
		const error = new Error("Discord rate limited");
		await expect(
			instrumentDiscordApiCall("users.getCurrent", () => Promise.reject(error)),
		).rejects.toThrow("Discord rate limited");

		expect(mockSetStatus).toHaveBeenCalledWith({ code: 2, message: "internal_error" });
		expect(mockSetAttribute).toHaveBeenCalledWith("error.type", "Error");
	});

	it("passes additional attributes to the span", async () => {
		await instrumentDiscordApiCall("guilds.getMember", () => Promise.resolve({ user: {} }), {
			guild_id: "456",
		});

		expect(Sentry.startSpan).toHaveBeenCalledWith(
			expect.objectContaining({
				attributes: expect.objectContaining({
					guild_id: "456",
				}),
			}),
			expect.any(Function),
		);
	});
});

describe("instrumentBotApiCall", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("wraps a successful bot API call in a span with ok status", async () => {
		const data = [{ name: "help" }];
		const result = await instrumentBotApiCall("commands.fetch", () => Promise.resolve(data));

		expect(result).toBe(data);
		expect(Sentry.startSpan).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "bot.api commands.fetch",
				op: "http.client.bot",
				attributes: expect.objectContaining({
					"bot.endpoint": "commands.fetch",
				}),
			}),
			expect.any(Function),
		);
		expect(mockSetStatus).toHaveBeenCalledWith({ code: 1, message: "ok" });
	});

	it("sets error status and error.type on failure", async () => {
		const error = new Error("Bot API unreachable");
		await expect(
			instrumentBotApiCall("commands.fetch", () => Promise.reject(error)),
		).rejects.toThrow("Bot API unreachable");

		expect(mockSetStatus).toHaveBeenCalledWith({ code: 2, message: "internal_error" });
		expect(mockSetAttribute).toHaveBeenCalledWith("error.type", "Error");
	});
});

describe("instrumentDiscordApiCall", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("wraps a successful Discord API call in a span with ok status", async () => {
		const data = { id: "123", username: "test" };
		const result = await instrumentDiscordApiCall("users.getCurrent", () =>
			Promise.resolve(data),
		);

		expect(result).toBe(data);
		expect(Sentry.startSpan).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "discord.api users.getCurrent",
				op: "http.client.discord",
				attributes: expect.objectContaining({
					"server.address": "discord.com",
					"discord.endpoint": "users.getCurrent",
				}),
			}),
			expect.any(Function),
		);
		expect(mockSetStatus).toHaveBeenCalledWith({ code: 1, message: "ok" });
	});

	it("sets error status and error.type on failure", async () => {
		const error = new Error("Discord rate limited");
		await expect(
			instrumentDiscordApiCall("users.getCurrent", () => Promise.reject(error)),
		).rejects.toThrow("Discord rate limited");

		expect(mockSetStatus).toHaveBeenCalledWith({ code: 2, message: "internal_error" });
		expect(mockSetAttribute).toHaveBeenCalledWith("error.type", "Error");
	});

	it("passes additional attributes to the span", async () => {
		await instrumentDiscordApiCall("guilds.getMember", () => Promise.resolve({ user: {} }), {
			guild_id: "456",
		});

		expect(Sentry.startSpan).toHaveBeenCalledWith(
			expect.objectContaining({
				attributes: expect.objectContaining({
					guild_id: "456",
				}),
			}),
			expect.any(Function),
		);
	});
});

describe("instrumentBotApiCall", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("wraps a successful bot API call in a span with ok status", async () => {
		const data = [{ name: "help" }];
		const result = await instrumentBotApiCall("commands.fetch", () => Promise.resolve(data));

		expect(result).toBe(data);
		expect(Sentry.startSpan).toHaveBeenCalledWith(
			expect.objectContaining({
				name: "bot.api commands.fetch",
				op: "http.client.bot",
				attributes: expect.objectContaining({
					"bot.endpoint": "commands.fetch",
				}),
			}),
			expect.any(Function),
		);
		expect(mockSetStatus).toHaveBeenCalledWith({ code: 1, message: "ok" });
	});

	it("sets error status and error.type on failure", async () => {
		const error = new Error("Bot API unreachable");
		await expect(
			instrumentBotApiCall("commands.fetch", () => Promise.reject(error)),
		).rejects.toThrow("Bot API unreachable");

		expect(mockSetStatus).toHaveBeenCalledWith({ code: 2, message: "internal_error" });
		expect(mockSetAttribute).toHaveBeenCalledWith("error.type", "Error");
	});
});
