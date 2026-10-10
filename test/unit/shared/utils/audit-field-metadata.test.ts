import {
	getAuditFieldMetadata,
	humanizeKey,
	AUDIT_FIELD_METADATA,
} from "#shared/utils/audit-field-metadata";
import { describe, expect, it } from "vitest";

describe("AUDIT_FIELD_METADATA", () => {
	it("rolesAdmin is type role, array true, label Administrator", () => {
		expect(AUDIT_FIELD_METADATA["rolesAdmin"]).toStrictEqual({
			label: "Administrator",
			type: "role",
			array: true,
		});
	});

	it("logsMemberAdd is type channel, array false, verbatim label", () => {
		expect(AUDIT_FIELD_METADATA["logsMemberAdd"]).toStrictEqual({
			label: "Member Add Logs",
			type: "channel",
			array: false,
		});
	});

	it("logsIgnoreReactions is type channel, array true", () => {
		expect(AUDIT_FIELD_METADATA["logsIgnoreReactions"]).toMatchObject({
			type: "channel",
			array: true,
		});
	});

	it("commandsDisabled is type command-name, array true", () => {
		expect(AUDIT_FIELD_METADATA["commandsDisabled"]).toMatchObject({
			type: "command-name",
			array: true,
		});
	});

	it("rolesPublic is type role, array true", () => {
		expect(AUDIT_FIELD_METADATA["rolesPublic"]).toMatchObject({
			type: "role",
			array: true,
		});
	});

	it("rolesInitial holds several roles in V7", () => {
		expect(AUDIT_FIELD_METADATA["rolesInitial"]).toMatchObject({
			type: "role",
			array: true,
		});
	});

	it("rolesMuted is type role, array false", () => {
		expect(AUDIT_FIELD_METADATA["rolesMuted"]).toMatchObject({
			type: "role",
			array: false,
		});
	});

	it("module flags and track toggles are booleans", () => {
		for (const key of ["modulesAutomod", "moderationTrackBans", "reportsNotify"]) {
			expect(AUDIT_FIELD_METADATA[key]).toMatchObject({ type: "boolean", array: false });
		}
	});
});

describe("getAuditFieldMetadata", () => {
	it("returns registry entry for a known key", () => {
		expect(getAuditFieldMetadata("rolesAdmin")).toStrictEqual({
			label: "Administrator",
			type: "role",
			array: true,
		});
	});

	// Rows written before the V7 move keep their V6 keys.
	it("resolves a renamed V6 key to its V7 entry", () => {
		expect(getAuditFieldMetadata("channelsLogsMemberAdd")).toStrictEqual({
			label: "Member Add Logs",
			type: "channel",
			array: false,
		});
		expect(getAuditFieldMetadata("disabledCommands")).toMatchObject({
			type: "command-name",
			array: true,
		});
	});

	it("still labels a V6 key that V7 dropped", () => {
		expect(getAuditFieldMetadata("prefix")).toStrictEqual({
			label: "Prefix",
			type: "string",
			array: false,
		});
	});

	it("returns humanized fallback for an unknown key", () => {
		expect(getAuditFieldMetadata("foo.bar")).toStrictEqual({
			label: "Foo Bar",
			type: "unknown",
			array: false,
		});
	});
});

describe("humanizeKey", () => {
	it("splits camelCase words and title-cases each", () => {
		expect(humanizeKey("logsMemberAdd")).toBe("Logs Member Add");
	});

	it("replaces dots with spaces and title-cases each word", () => {
		expect(humanizeKey("foo.bar.bazQux")).toBe("Foo Bar Baz Qux");
	});
});
