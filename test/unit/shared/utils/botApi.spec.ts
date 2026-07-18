import type { BotApiAuthPayload } from "#shared/types/botApi";
import {
	decryptBotApiAuth,
	encryptBotApiAuth,
	getOptionalBotApiAuthHeaders,
	normalizeBotApiCommand,
	normalizeBotApiCommands,
} from "#shared/utils/botApi";
import { describe, expect, it } from "vitest";

// aes-256-cbc requires a 32-byte key — match Discord client-secret length.
const SECRET = "0123456789abcdef0123456789abcdef";

describe("botApi auth cookie crypto", () => {
	it("round-trips a valid payload", () => {
		const payload: BotApiAuthPayload = {
			expires: Date.now() + 60_000,
			id: "123456789012345678",
			refresh: "refresh-token",
			token: "access-token",
		};

		const encrypted = encryptBotApiAuth(payload, SECRET);
		expect(encrypted).toContain(".");

		const decrypted = decryptBotApiAuth(encrypted, SECRET);
		expect(decrypted).toStrictEqual(payload);
	});

	it("returns null for expired payloads", () => {
		const encrypted = encryptBotApiAuth(
			{
				expires: Date.now() - 1,
				id: "1",
				refresh: "",
				token: "t",
			},
			SECRET,
		);
		expect(decryptBotApiAuth(encrypted, SECRET)).toBeNull();
	});

	it("returns null for tampered tokens", () => {
		const encrypted = encryptBotApiAuth(
			{
				expires: Date.now() + 60_000,
				id: "1",
				refresh: "",
				token: "t",
			},
			SECRET,
		);
		const [data, iv] = encrypted.split(".");
		expect(data).toBeTruthy();
		expect(iv).toBeTruthy();
		const tampered = `AAAA${data!.slice(4)}.${iv}`;
		expect(decryptBotApiAuth(tampered, SECRET)).toBeNull();
		expect(decryptBotApiAuth("not-a-token", SECRET)).toBeNull();
	});
});

describe("getOptionalBotApiAuthHeaders", () => {
	it("returns an empty object when credentials are missing", () => {
		expect(
			getOptionalBotApiAuthHeaders({
				accessToken: null,
				secret: SECRET,
				userId: "1",
			}),
		).toStrictEqual({});
		expect(
			getOptionalBotApiAuthHeaders({
				accessToken: "token",
				secret: "",
				userId: "1",
			}),
		).toStrictEqual({});
	});

	it("builds a Cookie header that decrypts to the session payload", () => {
		const headers = getOptionalBotApiAuthHeaders({
			accessToken: "access-token",
			cookieName: "SAPPHIRE_AUTH",
			secret: SECRET,
			userId: "123456789012345678",
		});

		expect(headers.Cookie).toMatch(/^SAPPHIRE_AUTH=.[^\n\r.\u2028\u2029]*\..+$/);
		const token = headers.Cookie!.slice("SAPPHIRE_AUTH=".length);
		const decrypted = decryptBotApiAuth(token, SECRET);
		expect(decrypted?.id).toBe("123456789012345678");
		expect(decrypted?.token).toBe("access-token");
	});
});

const sampleBotApiCommand = {
	alias: ["vk", "vkick"],
	category: "Moderation",
	description: "Kick a user from voice",
	extendedHelp: {
		usages: ["User"],
		examples: ["@Pete"],
	},
	guarded: false,
	name: "voicekick",
	permissionLevel: 5,
	preconditions: {
		entries: [],
		mode: 0,
		runCondition: 0,
	},
	subCategory: null,
};

describe("normalizeBotApiCommand", () => {
	it("maps bot API alias to dashboard aliases and coerces null subCategory", () => {
		expect(normalizeBotApiCommand(sampleBotApiCommand)).toStrictEqual({
			aliases: ["vk", "vkick"],
			category: "Moderation",
			description: "Kick a user from voice",
			extendedHelp: {
				usages: ["User"],
				examples: ["@Pete"],
			},
			guarded: false,
			name: "voicekick",
			permissionLevel: 5,
			preconditions: {
				entries: [],
				mode: 0,
				runCondition: 0,
			},
			subCategory: "",
		});
	});

	it("defaults missing alias to an empty array", () => {
		const { alias: _alias, ...withoutAlias } = sampleBotApiCommand;
		expect(normalizeBotApiCommand(withoutAlias).aliases).toStrictEqual([]);
	});

	it("falls back to aliases when alias is absent", () => {
		const { alias: _alias, ...withoutAlias } = sampleBotApiCommand;
		expect(
			normalizeBotApiCommand({ ...withoutAlias, aliases: ["legacy"] }).aliases,
		).toStrictEqual(["legacy"]);
	});

	it("preserves a non-null subCategory", () => {
		expect(
			normalizeBotApiCommand({ ...sampleBotApiCommand, subCategory: "Voice" }).subCategory,
		).toBe("Voice");
	});
});

describe("normalizeBotApiCommands", () => {
	it("normalizes each command in the list", () => {
		const result = normalizeBotApiCommands([sampleBotApiCommand]);
		expect(result).toHaveLength(1);
		expect(result[0]?.aliases).toStrictEqual(["vk", "vkick"]);
		expect(result[0]?.subCategory).toBe("");
	});
});
