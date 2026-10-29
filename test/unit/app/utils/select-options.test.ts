import { describe, expect, it } from "vitest";
import { channelOptions, roleOptions } from "~/utils/select-options";

type Guild = NonNullable<Parameters<typeof channelOptions>[0]>;

// Only the fields the helpers read; the rest of a guild is irrelevant here.
function guild(partial: { channels?: object[]; roles?: object[] }): Guild {
	return { channels: [], id: "100", roles: [], ...partial } as unknown as Guild;
}

describe("channelOptions", () => {
	const options = channelOptions(
		guild({
			channels: [
				{ id: "1", name: "Staff", parentId: null, rawPosition: 2, type: 4 },
				{ id: "2", name: "Info", parentId: null, rawPosition: 1, type: 4 },
				{ id: "3", name: "mod-log", parentId: "1", rawPosition: 5, type: 0 },
				{ id: "4", name: "rules", parentId: "2", rawPosition: 3, type: 0 },
				{ id: "5", name: "news", parentId: "2", rawPosition: 1, type: 5 },
				{ id: "6", name: "lobby", parentId: null, rawPosition: 9, type: 0 },
				{ id: "7", name: "Voice", parentId: "1", rawPosition: 0, type: 2 },
			],
		}),
	);

	it("keeps text and announcement channels only", () => {
		expect(options.map((option) => option.label)).not.toContain("Voice");
		expect(options.map((option) => option.label)).not.toContain("Staff");
	});

	it("orders them as Discord does: by category, then by position", () => {
		expect(options.map((option) => option.label)).toStrictEqual([
			"lobby",
			"news",
			"rules",
			"mod-log",
		]);
	});

	it("groups each channel under its category", () => {
		expect(options.map((option) => option.group)).toStrictEqual([
			undefined,
			"Info",
			"Info",
			"Staff",
		]);
	});

	it("is empty while the guild has not loaded", () => {
		expect(channelOptions(undefined)).toStrictEqual([]);
	});

	it("offers the kinds of channel it is asked for", () => {
		const voice = channelOptions(
			guild({
				channels: [
					{ id: "1", name: "Staff", parentId: null, rawPosition: 2, type: 4 },
					{ id: "3", name: "mod-log", parentId: "1", rawPosition: 5, type: 0 },
					{ id: "7", name: "Voice", parentId: "1", rawPosition: 0, type: 2 },
				],
			}),
			[0, 2],
		);
		expect(voice.map((option) => option.label)).toStrictEqual(["Voice", "mod-log"]);
	});
});

describe("roleOptions", () => {
	const options = roleOptions(
		guild({
			roles: [
				{ color: 0, id: "100", name: "@everyone", rawPosition: 0 },
				{ color: 5_793_266, id: "2", name: "Admin", rawPosition: 9 },
				{ color: 0, id: "3", name: "Member", rawPosition: 1 },
				{ color: 65_280, id: "4", name: "Mod", rawPosition: 5 },
			],
		}),
	);

	it("lists the roles highest first, without @everyone", () => {
		expect(options.map((option) => option.label)).toStrictEqual(["Admin", "Mod", "Member"]);
	});

	it("gives a role its colour, and none to one that has Discord's default", () => {
		expect(options.map((option) => option.color)).toStrictEqual([
			"#5865f2",
			"#00ff00",
			undefined,
		]);
	});
});
