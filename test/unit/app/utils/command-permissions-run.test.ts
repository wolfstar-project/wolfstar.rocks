import type { Overwrite } from "#shared/utils/command-permissions";
import { ApplicationCommandPermissionType } from "discord-api-types/v10";
import { describe, expect, it, vi } from "vitest";
import {
	listsToRows,
	rowsToLists,
	runSequentialSaves,
	stageRows,
} from "~/utils/command-permissions-run";

const GUILD = "110000000000000000";
const ROLE = "300000000000000001";
const USER = "200000000000000001";
const CHANNEL = "400000000000000001";

const row = (
	id: string,
	type: ApplicationCommandPermissionType,
	permission: boolean,
): Overwrite => ({
	id,
	type,
	permission,
});

describe("runSequentialSaves", () => {
	const drafts = ["a", "b", "c"].map((commandId) => ({
		commandId,
		permissions: [],
		snapshot: "[]",
	}));

	it("waits for each save before the next and stops at the first failure", async () => {
		const order: string[] = [];
		const save = vi.fn(async (commandId: string) => {
			order.push(`start ${commandId}`);
			await new Promise((resolve) => setTimeout(resolve, 5));
			if (commandId === "b") throw { data: { code: "conflict" } };
			order.push(`end ${commandId}`);
		});

		const outcome = await runSequentialSaves(drafts, save);

		expect(order).toEqual(["start a", "end a", "start b"]);
		expect(outcome).toEqual({ sent: ["a"], failed: { commandId: "b", code: "conflict" } });
		expect(save).toHaveBeenCalledTimes(2);
	});

	it("sends every draft when none fails", async () => {
		const outcome = await runSequentialSaves(drafts, async () => {});
		expect(outcome).toEqual({ sent: ["a", "b", "c"], failed: null });
	});

	it("reads an error without a code as unknown", async () => {
		const outcome = await runSequentialSaves(drafts.slice(0, 1), async () => {
			throw new Error("network");
		});
		expect(outcome.failed).toEqual({ commandId: "a", code: "unknown" });
	});
});

describe("rowsToLists and listsToRows", () => {
	const rows = [
		row(GUILD, ApplicationCommandPermissionType.Role, false),
		row(ROLE, ApplicationCommandPermissionType.Role, true),
		row(USER, ApplicationCommandPermissionType.User, false),
		row("109999999999999999", ApplicationCommandPermissionType.Channel, false),
		row(CHANNEL, ApplicationCommandPermissionType.Channel, true),
	];

	it("sorts the rows into lists, @everyone and All channels apart", () => {
		expect(rowsToLists(rows, GUILD)).toEqual({
			everyone: false,
			allChannels: false,
			roles: { allow: [ROLE], deny: [] },
			users: { allow: [], deny: [USER] },
			channels: { allow: [CHANNEL], deny: [] },
		});
	});

	it("gives back the same set", () => {
		expect(listsToRows(rowsToLists(rows, GUILD), GUILD)).toEqual(expect.arrayContaining(rows));
		expect(listsToRows(rowsToLists(rows, GUILD), GUILD)).toHaveLength(rows.length);
	});

	it("leaves @everyone out when it is not set", () => {
		const lists = { ...rowsToLists(rows, GUILD), everyone: null };
		expect(listsToRows(lists, GUILD).some((entry) => entry.id === GUILD)).toBe(false);
	});
});

describe("stageRows", () => {
	const A = [row(ROLE, ApplicationCommandPermissionType.Role, true)];
	const B = [row(ROLE, ApplicationCommandPermissionType.Role, false)];
	const edit = [row(USER, ApplicationCommandPermissionType.User, true)];

	it("keeps the rows a draft was made on when Discord's rows change under it", () => {
		const first = stageRows({}, "ban", edit, A);
		// A reload after a stopped run brings Discord's newer rows, B.
		const again = stageRows(first, "ban", [...edit, ...B], B);
		expect(again.ban?.base).toEqual(A);
	});

	it("drops the draft once it matches the rows it was made on", () => {
		const staged = stageRows({}, "ban", edit, A);
		expect(stageRows(staged, "ban", A, A)).toEqual({});
	});
});
