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

	it("channelsLogsMemberAdd is type channel, array false, verbatim label", () => {
		expect(AUDIT_FIELD_METADATA["channelsLogsMemberAdd"]).toStrictEqual({
			label: "Member Add Logs",
			type: "channel",
			array: false,
		});
	});

	it("channelsIgnoreReactionAdd is type channel, array true", () => {
		expect(AUDIT_FIELD_METADATA["channelsIgnoreReactionAdd"]).toMatchObject({
			type: "channel",
			array: true,
		});
	});

	it("prefix is type string, array false", () => {
		expect(AUDIT_FIELD_METADATA["prefix"]).toMatchObject({
			type: "string",
			array: false,
		});
	});

	it("disabledCommands is type command-name, array true", () => {
		expect(AUDIT_FIELD_METADATA["disabledCommands"]).toMatchObject({
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

	it("rolesInitial is type role, array false", () => {
		expect(AUDIT_FIELD_METADATA["rolesInitial"]).toMatchObject({
			type: "role",
			array: false,
		});
	});

	it("eventsBanAdd is type boolean, array false", () => {
		expect(AUDIT_FIELD_METADATA["eventsBanAdd"]).toMatchObject({
			type: "boolean",
			array: false,
		});
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
		expect(humanizeKey("channelsLogsMemberAdd")).toBe("Channels Logs Member Add");
	});

	it("replaces dots with spaces and title-cases each word", () => {
		expect(humanizeKey("foo.bar.bazQux")).toBe("Foo Bar Baz Qux");
	});
});
