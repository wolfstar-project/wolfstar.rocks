import type { SlashCommandDefinition } from "#shared/types/slash-command";
import {
	toSlashCommandDisplayInput,
	validateSlashCommandDefinition,
} from "#shared/utils/slash-command";
import { describe, expect, it } from "vitest";

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
