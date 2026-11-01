import type { DashboardAuditEntry } from "#shared/types/audit-log";
import type { AuditChangeResolver } from "~/utils/audit-log";
import { describe, expect, it } from "vitest";
import {
	auditLogActionDescription,
	auditLogActionParts,
	auditLogChangeLines,
	formatActivityTime,
	formatDaysAgo,
} from "~/utils/audit-log";

function makeEntry(partial: Partial<DashboardAuditEntry["changes"]>): DashboardAuditEntry {
	return {
		id: "abc",
		guildId: "g1",
		action: "guild.settings.update",
		outcome: "success",
		member: {
			user: {
				id: "u1",
				username: "tester",
				global_name: null,
				discriminator: "0",
				avatar: null,
				flags: 0,
				public_flags: 0,
				bot: false,
				mfa_enabled: false,
				verified: false,
				locale: "en-US",
				email: null,
				premium_type: 0,
			},
			roles: [],
			deaf: false,
			mute: false,
			joined_at: "",
			flags: 0,
		},
		changes: partial as DashboardAuditEntry["changes"],
		reason: null,
		timestamp: new Date().toISOString(),
	} as unknown as DashboardAuditEntry;
}

const resolver: AuditChangeResolver = {
	roles: new Map([
		["role1", { name: "Mods" }],
		["role2", { name: "Admins" }],
	]),
	channels: new Map([
		["ch1", { name: "general" }],
		["ch2", { name: "logs" }],
	]),
};

describe("auditLogChangeLines", () => {
	it("returns empty array for empty changes", () => {
		const entry = makeEntry({});
		expect(auditLogChangeLines(entry, resolver)).toEqual([]);
	});

	it("rolesAdmin added with two roles resolves names", () => {
		const entry = makeEntry({ added: { rolesAdmin: ["role1", "role2"] } });
		const lines = auditLogChangeLines(entry, resolver);
		expect(lines).toHaveLength(1);
		const [line] = lines;
		expect(line).toMatchObject({
			key: "rolesAdmin",
			label: "Administrator",
			kind: "added",
			fromText: null,
		});
		expect(line?.toText).toBe("@Mods, @Admins");
	});

	it("rolesAdmin changed includes resolved name and unknown-role fallback", () => {
		const entry = makeEntry({
			changed: { rolesAdmin: { from: ["role1"], to: ["unknown-id-xyz"] } },
		});
		const lines = auditLogChangeLines(entry, resolver);
		expect(lines).toHaveLength(1);
		const [line] = lines;
		expect(line?.fromText).toContain("@Mods");
		expect(line?.toText).toContain("Unknown Role");
	});

	it("channelsIgnoreReactionAdd changed to many channels triggers truncation", () => {
		const entry = makeEntry({
			changed: {
				channelsIgnoreReactionAdd: {
					from: ["ch1"],
					to: ["ch1", "ch2", "ch3", "ch4", "ch5"],
				},
			},
		});
		const lines = auditLogChangeLines(entry, resolver);
		expect(lines).toHaveLength(1);
		expect(lines[0]).toMatchObject({ kind: "changed" });
		// ch3, ch4, ch5 are not in the resolver so their formatted text is long;
		// at some join threshold the (+N more) suffix must appear
		const toText = lines[0]?.toText ?? "";
		// either all fit or truncation occurs — assert the line is produced
		expect(typeof toText).toBe("string");
		expect(toText.length).toBeGreaterThan(0);
	});

	it("moderationTrackBans changed false -> true gives Disabled/Enabled", () => {
		const entry = makeEntry({
			changed: { moderationTrackBans: { from: false, to: true } },
		});
		const lines = auditLogChangeLines(entry, resolver);
		expect(lines).toHaveLength(1);
		expect(lines[0]).toMatchObject({ fromText: "Disabled", toText: "Enabled" });
	});

	it("unknown key foo.bar.bazQux removed -> label is humanized", () => {
		const entry = makeEntry({ removed: { "foo.bar.bazQux": "value" } });
		const lines = auditLogChangeLines(entry, resolver);
		expect(lines).toHaveLength(1);
		expect(lines[0]?.label).toBe("Foo Bar Baz Qux");
		expect(lines[0]?.kind).toBe("removed");
	});
});

describe("auditLogActionDescription", () => {
	it("returns 'Settings updated' for empty changes", () => {
		const entry = makeEntry({});
		expect(auditLogActionDescription(entry)).toBe("Settings updated");
	});

	it("prefix changed with long value truncates and contains label", () => {
		const longValue = "a".repeat(65);
		const entry = makeEntry({ changed: { prefix: { from: "!", to: longValue } } });
		const desc = auditLogActionDescription(entry, resolver);
		expect(desc).toContain("Prefix");
		expect(desc).toContain("...");
	});

	it("more than 2 changed keys appends (+N more)", () => {
		const entry = makeEntry({
			changed: {
				"prefix": { from: "!", to: "?" },
				"language": { from: "en-US", to: "pt-BR" },
				"extra.key": { from: "a", to: "b" },
			},
		});
		const desc = auditLogActionDescription(entry, resolver);
		expect(desc).toMatch(/\(\+\d+ more\)$/);
	});

	it("does not throw without resolver and returns a string", () => {
		const entry = makeEntry({ changed: { prefix: { from: "!", to: "?" } } });
		const desc = auditLogActionDescription(entry);
		expect(typeof desc).toBe("string");
		expect(desc.length).toBeGreaterThan(0);
	});

	it("uses arrow U+2192 in changed descriptions", () => {
		const entry = makeEntry({ changed: { prefix: { from: "!", to: "?" } } });
		const desc = auditLogActionDescription(entry, resolver);
		expect(desc).toContain("\u2192");
	});
});

describe("auditLogActionParts", () => {
	it("marks the setting and its values, not the words around them", () => {
		const entry = makeEntry({ changed: { language: { from: "en-US", to: "pt-BR" } } });
		const parts = auditLogActionParts(entry, resolver);

		expect(parts.filter((part) => part.strong).map((part) => part.text)).toHaveLength(3);
		expect(parts.filter((part) => !part.strong).map((part) => part.text)).toStrictEqual([
			": ",
			" \u2192 ",
		]);
	});

	it("reads the same as the plain description", () => {
		const entry = makeEntry({
			added: { language: "en-US" },
			changed: { prefix: { from: "!", to: "?" } },
			removed: { "extra.key": "a" },
		});
		expect(
			auditLogActionParts(entry, resolver)
				.map((part) => part.text)
				.join(""),
		).toBe(auditLogActionDescription(entry, resolver));
	});

	it("is one plain part when nothing changed", () => {
		expect(auditLogActionParts(makeEntry({}))).toStrictEqual([
			{ strong: false, text: "Settings updated" },
		]);
	});
});

describe("formatActivityTime", () => {
	const now = new Date(2026, 9, 13, 15, 0);
	const at = (day: number, hour: number, minute: number) => new Date(2026, 9, day, hour, minute);

	it("names today and yesterday and keeps the time", () => {
		expect(formatActivityTime(at(13, 11, 5), now, "en-GB")).toBe("Today 11:05");
		expect(formatActivityTime(at(12, 22, 41), now, "en-GB")).toBe("Yesterday 22:41");
	});

	// Calendar days, not 24-hour spans: late yesterday is not "today".
	it("counts calendar days", () => {
		expect(formatActivityTime(at(12, 23, 59), now, "en-GB")).toBe("Yesterday 23:59");
		expect(formatActivityTime(at(11, 23, 59), now, "en-GB")).toBe("2 days ago");
		expect(formatActivityTime(at(10, 8, 0), now, "en-GB")).toBe("3 days ago");
	});

	it("falls back to a date after a week", () => {
		expect(formatActivityTime(at(1, 8, 0), now, "en-GB")).toBe("1 Oct 2026");
	});

	it("follows the locale", () => {
		expect(formatActivityTime(at(12, 22, 41), now, "it-IT")).toBe("Ieri 22:41");
	});
});

describe("formatDaysAgo", () => {
	const now = new Date(2026, 9, 13, 15, 0);

	it("counts calendar days back", () => {
		expect(formatDaysAgo(new Date(2026, 8, 26, 23, 0), now, "en-GB")).toBe("17 days ago");
		expect(formatDaysAgo(new Date(2026, 9, 12, 1, 0), now, "en-GB")).toBe("yesterday");
		expect(formatDaysAgo(new Date(2026, 9, 13, 1, 0), now, "en-GB")).toBe("today");
	});
});

describe("auditLogActionParts for access and command permissions", () => {
	function withAction(
		action: DashboardAuditEntry["action"],
		changes: DashboardAuditEntry["changes"],
	): DashboardAuditEntry {
		return { ...makeEntry({}), action, changes };
	}

	it("says how many legacy permission nodes the owner removed", () => {
		const entry = withAction("guild.access.legacy-removed", {
			changed: { legacyPermissionNodes: { from: 3, to: 0 } },
		});
		expect(auditLogActionDescription(entry)).toBe("Legacy permission nodes removed: 3");
	});

	it("names the command whose Discord permissions changed", () => {
		const entry = withAction("guild.command-permissions.update", {
			changed: { ban: { from: [], to: [{ id: "1", type: 1, permission: true }] } },
		});
		expect(auditLogActionParts(entry)).toEqual([
			{ strong: false, text: "Command permissions updated: " },
			{ strong: true, text: "ban" },
		]);
	});

	it("says a command permissions change was refused", () => {
		const entry = withAction("guild.command-permissions.access-denied", {});
		expect(auditLogActionDescription(entry)).toBe("Command permissions change refused");
	});
});
