import type { SlashCommandDefinition } from "#shared/types/chat-input-command";
import {
	formatSlashCommandDisplayName,
	toSlashCommandDisplayInput,
	validateSlashCommandDefinition,
	validateSlashCommandDisplayParts,
} from "#shared/utils/chat-input-command";
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

describe("validateSlashCommandDefinition", () => {
	it("accepts a command with direct subcommands", () => {
		expect(() =>
			validateSlashCommandDefinition({
				name: "conf",
				subcommands: [{ name: "menu" }, { name: "reset" }],
			}),
		).not.toThrow();
	});

	it("accepts a command with subcommand groups", () => {
		expect(() =>
			validateSlashCommandDefinition({
				name: "conf",
				subcommandGroups: [
					{
						name: "menu",
						subcommands: [{ name: "save" }, { name: "load" }],
					},
					{
						name: "user",
						subcommands: [{ name: "profile" }],
					},
				],
			}),
		).not.toThrow();
	});

	it("accepts a command with mixed groups and direct subcommands", () => {
		expect(() =>
			validateSlashCommandDefinition({
				name: "conf",
				subcommandGroups: [
					{
						name: "menu",
						subcommands: [{ name: "save" }],
					},
				],
				subcommands: [{ name: "reset" }],
			}),
		).not.toThrow();
	});

	it("accepts a command with top-level options only", () => {
		expect(() =>
			validateSlashCommandDefinition({
				name: "warn",
				options: [{ name: "user" }, { name: "reason" }],
			}),
		).not.toThrow();
	});

	it("rejects top-level options together with subcommands", () => {
		expect(() =>
			validateSlashCommandDefinition({
				name: "conf",
				subcommands: [{ name: "menu" }],
				options: [{ name: "value" }],
			} satisfies SlashCommandDefinition),
		).toThrow("commands with subcommands cannot have top-level options");
	});

	it("rejects subcommand groups without subcommands", () => {
		expect(() =>
			validateSlashCommandDefinition({
				name: "conf",
				subcommandGroups: [{ name: "menu", subcommands: [] }],
			}),
		).toThrow('subcommand group "menu" must contain at least one subcommand');
	});
});

describe("toSlashCommandDisplayInput", () => {
	it("maps invocation props to display input", () => {
		expect(
			toSlashCommandDisplayInput({
				name: "conf",
				subcommandGroup: "menu",
				subcommand: "save",
			}),
		).toEqual({
			commandName: "conf",
			subcommandGroup: "menu",
			subcommand: "save",
		});
	});
});
