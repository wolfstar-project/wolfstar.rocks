import {
	ComponentEmbedError,
	toComponentEmbed,
	toComponentEmbedJson,
} from "discord-component-embed";
import { describe, expect, it } from "vitest";
import {
	buildDiscordLinkCard,
	STARYL_ACCENT_COLOR,
} from "../../../../app/utils/discord-component-embed";

const options = {
	buttons: [
		{ label: "Invite WolfStar", url: "https://discord.com/oauth2/authorize?client_id=1" },
	],
	description: "Moderation for Discord.",
	thumbnailDescription: "WolfStar",
	thumbnailUrl: "https://wolfstar.rocks/avatars/wolfstar.png",
	title: "WolfStar",
};

describe("buildDiscordLinkCard", () => {
	it("produces a valid Components v2 payload", () => {
		const payload = toComponentEmbed(buildDiscordLinkCard(options));

		expect(payload.component).toMatchObject({ accent_color: 0xfd171b, type: 17 });
		expect(payload.component.components).toHaveLength(3);
	});

	it("puts the title and description in the section text", () => {
		const json = toComponentEmbedJson(buildDiscordLinkCard(options));

		expect(json).toContain("# WolfStar");
		expect(json).toContain("Moderation for Discord.");
		expect(json).toContain(options.thumbnailUrl);
		expect(json).toContain("Invite WolfStar");
	});

	it("honors a custom accent color", () => {
		const payload = toComponentEmbed(
			buildDiscordLinkCard({ ...options, accentColor: 0x123456 }),
		);

		expect(payload.component).toMatchObject({ accent_color: 0x123456 });
	});

	it("exposes the Staryl accent color as a valid RGB integer", () => {
		const payload = toComponentEmbed(
			buildDiscordLinkCard({ ...options, accentColor: STARYL_ACCENT_COLOR }),
		);

		expect(payload.component).toMatchObject({ accent_color: 0x787c89 });
	});

	it("rejects a button label over Discord's 80 character limit", () => {
		const tooLong = { ...options, buttons: [{ label: "x".repeat(81), url: "https://a.b" }] };

		expect(() => toComponentEmbed(buildDiscordLinkCard(tooLong))).toThrow(ComponentEmbedError);
	});
});
