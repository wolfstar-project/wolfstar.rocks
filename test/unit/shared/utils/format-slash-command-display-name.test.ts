import {
	formatSlashCommandDisplayName,
	validateSlashCommandDisplayParts,
} from "#shared/utils/format-slash-command-display-name";
import { describe, expect, it } from "vitest";

describe("validateSlashCommandDisplayParts", () => {
	it("accepts a top-level command", () => {
		expect(validateSlashCommandDisplayParts({ commandName: "help" })).toEqual({
			commandName: "help",
		});
	});

	it("accepts a direct subcommand", () => {
		expect(
			validateSlashCommandDisplayParts({ commandName: "help", subcommand: "topic" }),
		).toEqual({
			commandName: "help",
			subcommand: "topic",
		});
	});

	it("accepts a subcommand group with a subcommand", () => {
		expect(
			validateSlashCommandDisplayParts({
				commandName: "conf",
				subcommandGroup: "menu",
				subcommand: "save",
			}),
		).toEqual({
			commandName: "conf",
			subcommandGroup: "menu",
			subcommand: "save",
		});
	});

	it("rejects a subcommand group without a subcommand", () => {
		expect(() =>
			validateSlashCommandDisplayParts({
				commandName: "conf",
				subcommandGroup: "menu",
			}),
		).toThrow("subcommand is required when subcommandGroup is set");
	});

	it("rejects nested subcommand groups", () => {
		expect(() =>
			validateSlashCommandDisplayParts({
				commandName: "conf",
				subcommandGroup: "menu",
				subcommandSubgroup: "advanced",
				subcommand: "save",
			}),
		).toThrow("subcommand groups cannot be nested");
	});
});

describe("formatSlashCommandDisplayName", () => {
	it("formats a top-level command", () => {
		expect(formatSlashCommandDisplayName({ commandName: "help" })).toBe("help");
	});

	it("formats a command with a subcommand", () => {
		expect(formatSlashCommandDisplayName({ commandName: "help", subcommand: "topic" })).toBe(
			"help topic",
		);
	});

	it("formats a command with a subcommand group and subcommand", () => {
		expect(
			formatSlashCommandDisplayName({
				commandName: "conf",
				subcommandGroup: "menu",
				subcommand: "save",
			}),
		).toBe("conf menu save");
	});

	it("strips leading slashes and converts hyphens to spaces", () => {
		expect(
			formatSlashCommandDisplayName({
				commandName: "/conf",
				subcommandGroup: "user-settings",
				subcommand: "reset-password",
			}),
		).toBe("conf user settings reset password");
	});
});
