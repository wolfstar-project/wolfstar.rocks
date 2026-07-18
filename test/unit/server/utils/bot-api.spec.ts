import {
	decryptSapphireAuth,
	encryptSapphireAuth,
	type SapphireAuthPayload,
} from "#server/utils/bot-api";
import { describe, expect, it } from "vitest";

// aes-256-cbc requires a 32-byte key — match Discord client-secret length.
const SECRET = "0123456789abcdef0123456789abcdef";

describe("sapphire auth cookie crypto", () => {
	it("round-trips a valid payload", () => {
		const payload: SapphireAuthPayload = {
			expires: Date.now() + 60_000,
			id: "123456789012345678",
			refresh: "refresh-token",
			token: "access-token",
		};

		const encrypted = encryptSapphireAuth(payload, SECRET);
		expect(encrypted).toContain(".");

		const decrypted = decryptSapphireAuth(encrypted, SECRET);
		expect(decrypted).toStrictEqual(payload);
	});

	it("returns null for expired payloads", () => {
		const encrypted = encryptSapphireAuth(
			{
				expires: Date.now() - 1,
				id: "1",
				refresh: "",
				token: "t",
			},
			SECRET,
		);
		expect(decryptSapphireAuth(encrypted, SECRET)).toBeNull();
	});

	it("returns null for tampered tokens", () => {
		const encrypted = encryptSapphireAuth(
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
		expect(decryptSapphireAuth(tampered, SECRET)).toBeNull();
		expect(decryptSapphireAuth("not-a-token", SECRET)).toBeNull();
	});
});
