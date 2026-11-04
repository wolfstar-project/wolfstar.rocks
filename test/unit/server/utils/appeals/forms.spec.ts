import type { AppealForm, AppealQuestion } from "#shared/utils/appeal-forms";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Every write runs in a transaction that first takes the guild's advisory lock.
const database = vi.hoisted(() => {
	const tx = { execute: vi.fn(), orm: { transaction: true } };
	return {
		lockQuery: vi.fn((_strings: TemplateStringsArray, ...keys: unknown[]) => ({
			affectedCount: () => ({ build: () => ({ keys }) }),
		})),
		tx,
	};
});
vi.mock("#server/database/prisma", () => ({
	db: {
		orm: {},
		raw: { sql: database.lockQuery },
		transaction: (run: (tx: typeof database.tx) => unknown) => run(database.tx),
	},
}));

const storage = vi.hoisted(() => ({
	fetchAppealForms: vi.fn(),
	insertAppealForm: vi.fn(),
	patchAppealForm: vi.fn(),
	removeAppealForm: vi.fn(),
}));
vi.mock("#server/database/settings/appeals/storage", () => storage);

import {
	AppealFormError,
	createAppealForm,
	deleteAppealForm,
	reorderAppealForms,
	updateAppealForm,
} from "#server/utils/appeals/forms";
import { getDefaultAppealForm, MaximumAppealForms } from "#shared/utils/appeal-forms";

const GUILD_ID = "123456789012345678";

const question: AppealQuestion = {
	id: "why",
	kind: "text",
	label: "Why?",
	long: true,
	maxLength: 1000,
	required: true,
};

function makeForm(id: string, name: string, position = Number(id) - 1): AppealForm {
	return {
		...getDefaultAppealForm(),
		guildId: GUILD_ID,
		id,
		name,
		position,
		questions: [question],
	};
}

async function codeOf(promise: Promise<unknown>) {
	const error = await promise.catch((caught: unknown) => caught);
	expect(error).toBeInstanceOf(AppealFormError);
	return (error as AppealFormError).code;
}

describe("appeal form service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		storage.fetchAppealForms.mockResolvedValue([makeForm("1", "Ban appeal")]);
		storage.insertAppealForm.mockImplementation(
			async (_db: unknown, guildId: string, data: object) => ({ ...data, guildId, id: "2" }),
		);
		storage.patchAppealForm.mockResolvedValue(true);
		storage.removeAppealForm.mockResolvedValue(true);
	});

	describe("createAppealForm", () => {
		it("creates the form from the defaults, after the others, with the trimmed name", async () => {
			const form = await createAppealForm(GUILD_ID, {
				name: "  Mute appeal  ",
				questions: [question],
			});

			expect(form).toMatchObject({
				name: "Mute appeal",
				enabled: true,
				types: [],
				position: 1,
				questions: [question],
			});
		});

		// A deleted form leaves a gap, so the number of forms is not the next place.
		it("puts a new form after the highest place, not at the number of forms", async () => {
			storage.fetchAppealForms.mockResolvedValue([makeForm("3", "Third", 2)]);

			await createAppealForm(GUILD_ID, { name: "Fourth", questions: [question] });

			expect(storage.insertAppealForm).toHaveBeenCalledWith(
				expect.anything(),
				GUILD_ID,
				expect.objectContaining({ position: 3 }),
			);
		});

		it("refuses a form that asks nothing", async () => {
			expect(await codeOf(createAppealForm(GUILD_ID, { name: "Empty" }))).toBe("invalid");
			expect(
				await codeOf(
					createAppealForm(GUILD_ID, {
						name: "Notice",
						questions: [{ id: "n", kind: "display", content: "Hi" }],
					}),
				),
			).toBe("invalid");
			expect(storage.insertAppealForm).not.toHaveBeenCalled();
		});

		it("refuses a name another form has, whatever the case", async () => {
			expect(
				await codeOf(
					createAppealForm(GUILD_ID, { name: "bAN APPEAL", questions: [question] }),
				),
			).toBe("nameTaken");
			expect(storage.insertAppealForm).not.toHaveBeenCalled();
		});

		// A name made of digits could be taken for the ID of another form.
		it("refuses an empty, over-long or digits-only name", async () => {
			for (const name of ["   ", "a".repeat(101), "12345"]) {
				expect(
					await codeOf(createAppealForm(GUILD_ID, { name, questions: [question] })),
				).toBe("nameInvalid");
			}
		});

		it("refuses a form past the limit", async () => {
			storage.fetchAppealForms.mockResolvedValue(
				Array.from({ length: MaximumAppealForms }, (_, index) =>
					makeForm(String(index + 1), `Form ${index}`),
				),
			);
			expect(
				await codeOf(
					createAppealForm(GUILD_ID, { name: "One more", questions: [question] }),
				),
			).toBe("limit");
		});

		// Two processes creating the same name at once get past the name check;
		// the unique index is what stops the second one.
		it("maps the unique index violation to nameTaken", async () => {
			storage.insertAppealForm.mockRejectedValue(
				new Error("query failed", {
					cause: new Error(
						'duplicate key value violates unique constraint "AppealForm_guild_id_name_key"',
					),
				}),
			);
			expect(
				await codeOf(createAppealForm(GUILD_ID, { name: "Fresh", questions: [question] })),
			).toBe("nameTaken");
		});

		it("lets any other failure through untouched", async () => {
			storage.insertAppealForm.mockRejectedValue(new Error("connection reset"));
			await expect(
				createAppealForm(GUILD_ID, { name: "Fresh", questions: [question] }),
			).rejects.toThrow("connection reset");
		});
	});

	describe("updateAppealForm", () => {
		it("resolves the change from the form the database has", async () => {
			const change = await updateAppealForm(GUILD_ID, "1", (form) => ({
				enabled: !form.enabled,
			}));

			expect(storage.patchAppealForm).toHaveBeenCalledWith(expect.anything(), GUILD_ID, "1", {
				enabled: false,
			});
			expect(change.before.enabled).toBe(true);
			expect(change.after.enabled).toBe(false);
			expect(change.patch).toStrictEqual({ enabled: false });
		});

		it("writes nothing when the resolver changes nothing", async () => {
			const change = await updateAppealForm(GUILD_ID, "1", () => null);

			expect(storage.patchAppealForm).not.toHaveBeenCalled();
			expect(change.patch).toStrictEqual({});
		});

		it("lets a form keep its own name but not take another's", async () => {
			storage.fetchAppealForms.mockResolvedValue([
				makeForm("1", "Ban appeal"),
				makeForm("2", "Mute appeal"),
			]);

			await expect(
				updateAppealForm(GUILD_ID, "1", () => ({ name: "ban appeal" })),
			).resolves.toMatchObject({ patch: { name: "ban appeal" } });
			expect(
				await codeOf(updateAppealForm(GUILD_ID, "1", () => ({ name: "MUTE APPEAL" }))),
			).toBe("nameTaken");
		});

		it("reports a form that does not exist", async () => {
			expect(
				await codeOf(updateAppealForm(GUILD_ID, "404", () => ({ enabled: false }))),
			).toBe("unknown");
		});
	});

	describe("deleteAppealForm", () => {
		it("returns the form it deleted", async () => {
			await expect(deleteAppealForm(GUILD_ID, "1")).resolves.toMatchObject({
				name: "Ban appeal",
			});
			expect(storage.removeAppealForm).toHaveBeenCalledWith(expect.anything(), GUILD_ID, "1");
		});

		it("reports a form that does not exist", async () => {
			expect(await codeOf(deleteAppealForm(GUILD_ID, "404"))).toBe("unknown");
		});
	});

	describe("reorderAppealForms", () => {
		beforeEach(() => {
			storage.fetchAppealForms.mockResolvedValue([
				makeForm("1", "First"),
				makeForm("2", "Second"),
				makeForm("3", "Third"),
			]);
		});

		it("writes only the forms whose place changes", async () => {
			const { before, forms } = await reorderAppealForms(GUILD_ID, ["2", "1", "3"]);

			expect(before.map((form) => form.id)).toStrictEqual(["1", "2", "3"]);
			expect(forms.map((form) => [form.id, form.position])).toStrictEqual([
				["2", 0],
				["1", 1],
				["3", 2],
			]);
			expect(storage.patchAppealForm).toHaveBeenCalledTimes(2);
			expect(storage.patchAppealForm).toHaveBeenCalledWith(expect.anything(), GUILD_ID, "2", {
				position: 0,
			});
			expect(storage.patchAppealForm).toHaveBeenCalledWith(expect.anything(), GUILD_ID, "1", {
				position: 1,
			});
		});

		it("refuses an order that misses a form, names one twice or one the guild does not have", async () => {
			for (const ids of [
				["1", "2"],
				["1", "1", "2"],
				["1", "2", "404"],
			]) {
				expect(await codeOf(reorderAppealForms(GUILD_ID, ids))).toBe("invalid");
			}
			expect(storage.patchAppealForm).not.toHaveBeenCalled();
		});
	});

	it("runs the writes of a guild one after the other", async () => {
		const order: string[] = [];
		storage.patchAppealForm.mockImplementation(
			async (_db: unknown, _guild: string, _id: string, patch: { name?: string }) => {
				order.push(`start:${patch.name}`);
				await new Promise((resolve) => setTimeout(resolve, 5));
				order.push(`end:${patch.name}`);
				return true;
			},
		);

		await Promise.all([
			updateAppealForm(GUILD_ID, "1", () => ({ name: "First" })),
			updateAppealForm(GUILD_ID, "1", () => ({ name: "Second" })),
		]);

		expect(order).toStrictEqual(["start:First", "end:First", "start:Second", "end:Second"]);
	});

	// The bot reads the forms from the database every time, so unlike the
	// rules there is no notification after the lock: one statement only.
	it("reads and writes inside one transaction that holds the guild's lock, and tells the bot nothing", async () => {
		await updateAppealForm(GUILD_ID, "1", () => ({ enabled: false }));

		expect(database.tx.execute).toHaveBeenCalledTimes(1);
		const [namespace, guildKey] = database.lockQuery.mock.calls[0]?.slice(1) ?? [];
		expect(namespace).toBeTypeOf("number");
		expect(guildKey).toBe(Number(BigInt(GUILD_ID) % 2_147_483_647n));
		expect(storage.fetchAppealForms).toHaveBeenCalledWith(database.tx.orm, GUILD_ID);
		expect(storage.patchAppealForm).toHaveBeenCalledWith(database.tx.orm, GUILD_ID, "1", {
			enabled: false,
		});
	});
});
