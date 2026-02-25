import { guildNameToAcronym } from "#server/utils/guildNameToAcronym";
import { bench, describe } from "vitest";

describe("guildNameToAcronym benchmarks", () => {
	// Short names (1-3 words)
	bench("short name - single word", () => {
		guildNameToAcronym("Raid");
	});

	bench("short name - two words", () => {
		guildNameToAcronym("Epic Games");
	});

	bench("short name - three words", () => {
		guildNameToAcronym("The Cool Squad");
	});

	// Long names (many words)
	bench("long name - 10 words", () => {
		guildNameToAcronym("The Very Long And Totally Awesome Guild Name With Many Words");
	});

	bench("long name - 20 words", () => {
		guildNameToAcronym(
			"This Is An Extremely Long Discord Server Name That Has Way Too Many Words And Will Definitely Be Truncated To Just Three Letters",
		);
	});

	// Names with special characters
	bench("special chars - possessives", () => {
		guildNameToAcronym("Bob's Gaming Server");
	});

	bench("special chars - unicode apostrophe", () => {
		guildNameToAcronym("Alice's Community");
	});

	bench("special chars - hyphens", () => {
		guildNameToAcronym("The Multi-Gaming Network");
	});

	bench("special chars - numbers", () => {
		guildNameToAcronym("Team 404 Not Found");
	});

	bench("special chars - numbers at start", () => {
		guildNameToAcronym("24/7 Gaming Hub");
	});

	// Names with emojis and unicode
	bench("unicode - emojis", () => {
		guildNameToAcronym("😎 Cool Server 🎮");
	});

	bench("unicode - mixed scripts", () => {
		guildNameToAcronym("国際 Community ゲーム");
	});

	bench("unicode - accented characters", () => {
		guildNameToAcronym("Café Français Élégant");
	});

	// Edge cases
	bench("edge case - single character", () => {
		guildNameToAcronym("X");
	});

	bench("edge case - empty string", () => {
		guildNameToAcronym("");
	});

	bench("edge case - whitespace only", () => {
		guildNameToAcronym("   ");
	});

	bench("edge case - excessive whitespace", () => {
		guildNameToAcronym("Too     Many      Spaces");
	});

	// Real-world patterns
	bench("real-world - typical server name", () => {
		guildNameToAcronym("WolfStar Community");
	});

	bench("real-world - gaming clan", () => {
		guildNameToAcronym("[CLAN] Tactical Gaming Division");
	});

	bench("real-world - roleplay server", () => {
		guildNameToAcronym("Medieval Fantasy Roleplay Kingdom");
	});
});
