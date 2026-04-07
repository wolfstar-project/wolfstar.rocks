import { avatarURL, guildIconURL } from "#shared/utils/discord";
import { DefaultRestOptions } from "@discordjs/rest";
import { describe, expect, it } from "vitest";

describe("avatarURL", () => {
	it("should return avatar URL for a user with an avatar hash", () => {
		const user = { id: "123456789", avatar: "abcdef123456" };
		const url = avatarURL(user);
		expect(url).toContain("/avatars/123456789/abcdef123456");
		expect(url).toContain(".webp");
	});

	it("should return animated avatar URL for animated hash", () => {
		const user = { id: "123456789", avatar: "a_abcdef123456" };
		const url = avatarURL(user);
		expect(url).toContain(".gif");
	});

	it("should return default avatar URL when avatar is null", () => {
		const user = { id: "123456789012345678", avatar: null };
		const url = avatarURL(user);
		expect(url).toContain("/embed/avatars/");
		expect(url).toContain(".png");
	});

	it("should calculate correct default avatar index from user id", () => {
		const user = { id: "0", avatar: null };
		const url = avatarURL(user);
		const index = Number(BigInt("0") >> 22n) % 5;
		expect(url).toContain(`/embed/avatars/${index}`);
	});

	it("should respect size option", () => {
		const user = { id: "123456789", avatar: "abcdef123456" };
		const url = avatarURL(user, { size: 256 });
		expect(url).toContain("size=256");
	});

	it("should respect forceStatic option for animated avatars", () => {
		const user = { id: "123456789", avatar: "a_abcdef123456" };
		const url = avatarURL(user, { forceStatic: true });
		expect(url).not.toContain(".gif");
		expect(url).toContain(".webp");
	});

	it("should use the CDN base URL", () => {
		const user = { id: "123456789", avatar: "abcdef123456" };
		const url = avatarURL(user);
		expect(url).toContain(DefaultRestOptions.cdn);
	});

	it("should throw for invalid extension", () => {
		const user = { id: "123456789", avatar: "abcdef123456" };
		expect(() => avatarURL(user, { extension: "bmp" as "png" })).toThrow(RangeError);
	});

	it("should throw for invalid size", () => {
		const user = { id: "123456789", avatar: "abcdef123456" };
		expect(() => avatarURL(user, { size: 3 as 16 })).toThrow(RangeError);
	});
});

describe("guildIconURL", () => {
	it("should return icon URL for a guild with an icon hash", () => {
		const guild = { id: "111", name: "Test", icon: "iconhash123", acronym: "T" };
		const url = guildIconURL(guild);
		expect(url).toContain("/icons/111/iconhash123");
		expect(url).toContain(".webp");
	});

	it("should return animated icon URL for animated hash", () => {
		const guild = { id: "111", name: "Test", icon: "a_iconhash123", acronym: "T" };
		const url = guildIconURL(guild);
		expect(url).toContain(".gif");
	});

	it("should return acronym when icon is null", () => {
		const guild = { id: "111", name: "Test Guild", icon: null, acronym: "TG" };
		const result = guildIconURL(guild);
		expect(result).toBe("TG");
	});

	it("should respect size option", () => {
		const guild = { id: "111", name: "Test", icon: "iconhash123", acronym: "T" };
		const url = guildIconURL(guild, { size: 512 });
		expect(url).toContain("size=512");
	});

	it("should respect forceStatic option for animated icons", () => {
		const guild = { id: "111", name: "Test", icon: "a_iconhash123", acronym: "T" };
		const url = guildIconURL(guild, { forceStatic: true });
		expect(url).not.toContain(".gif");
	});
});
