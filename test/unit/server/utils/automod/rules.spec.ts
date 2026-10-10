import type { AutoModerationRule } from "#shared/utils/automod-rules";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("#server/database/prisma", () => ({ db: { orm: {} } }));

const storage = vi.hoisted(() => ({
	fetchAutoModerationRules: vi.fn(),
	insertAutoModerationRule: vi.fn(),
	patchAutoModerationRule: vi.fn(),
	removeAutoModerationRule: vi.fn(),
}));
vi.mock("#server/database/settings/automod/storage", () => storage);

import {
	AutoModerationRuleError,
	createAutoModerationRule,
	deleteAutoModerationRule,
	updateAutoModerationRule,
} from "#server/utils/automod/rules";
import {
	getDefaultAutoModerationRule,
	MaximumAutoModerationRules,
} from "#shared/utils/automod-rules";

const GUILD_ID = "123456789012345678";

function makeRule(id: string, name: string): AutoModerationRule {
	return { ...getDefaultAutoModerationRule("Words"), guildId: GUILD_ID, id, name };
}

async function codeOf(promise: Promise<unknown>) {
	const error = await promise.catch((caught: unknown) => caught);
	expect(error).toBeInstanceOf(AutoModerationRuleError);
	return (error as AutoModerationRuleError).code;
}

describe("auto-moderation rule service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		storage.fetchAutoModerationRules.mockResolvedValue([makeRule("1", "Spam")]);
		storage.insertAutoModerationRule.mockImplementation(
			async (_db: unknown, guildId: string, data: object) => ({ ...data, guildId, id: "2" }),
		);
		storage.patchAutoModerationRule.mockResolvedValue(true);
		storage.removeAutoModerationRule.mockResolvedValue(true);
	});

	describe("createAutoModerationRule", () => {
		it("creates the rule from the type's defaults with the trimmed name", async () => {
			const rule = await createAutoModerationRule(GUILD_ID, "  Links  ", "Links");

			expect(rule).toMatchObject({ name: "Links", type: "Links", options: { allowed: [] } });
		});

		it("refuses a name another rule has, whatever the case", async () => {
			expect(await codeOf(createAutoModerationRule(GUILD_ID, "sPAM", "Words"))).toBe(
				"nameTaken",
			);
			expect(storage.insertAutoModerationRule).not.toHaveBeenCalled();
		});

		// A name made of digits could be taken for the ID of another rule.
		it("refuses an empty, over-long or digits-only name", async () => {
			for (const name of ["   ", "a".repeat(51), "12345"]) {
				expect(await codeOf(createAutoModerationRule(GUILD_ID, name, "Words"))).toBe(
					"nameInvalid",
				);
			}
		});

		it("refuses a rule past the limit", async () => {
			storage.fetchAutoModerationRules.mockResolvedValue(
				Array.from({ length: MaximumAutoModerationRules }, (_, index) =>
					makeRule(String(index + 1), `Rule ${index}`),
				),
			);
			expect(await codeOf(createAutoModerationRule(GUILD_ID, "One more", "Words"))).toBe(
				"limit",
			);
		});

		// Two processes creating the same name at once get past the name check;
		// the unique index is what stops the second one.
		it("maps the unique index violation to nameTaken", async () => {
			storage.insertAutoModerationRule.mockRejectedValue(
				new Error("query failed", {
					cause: new Error(
						'duplicate key value violates unique constraint "GuildAutoModerationRule_guild_id_name_key"',
					),
				}),
			);
			expect(await codeOf(createAutoModerationRule(GUILD_ID, "Fresh", "Words"))).toBe(
				"nameTaken",
			);
		});

		it("lets any other failure through untouched", async () => {
			storage.insertAutoModerationRule.mockRejectedValue(new Error("connection reset"));
			await expect(createAutoModerationRule(GUILD_ID, "Fresh", "Words")).rejects.toThrow(
				"connection reset",
			);
		});
	});

	describe("updateAutoModerationRule", () => {
		it("resolves the change from the rule the database has", async () => {
			const change = await updateAutoModerationRule(GUILD_ID, "1", (rule) => ({
				enabled: !rule.enabled,
			}));

			expect(storage.patchAutoModerationRule).toHaveBeenCalledWith(
				expect.anything(),
				GUILD_ID,
				"1",
				{ enabled: false },
			);
			expect(change.before.enabled).toBe(true);
			expect(change.after.enabled).toBe(false);
			expect(change.patch).toStrictEqual({ enabled: false });
		});

		it("writes nothing when the resolver changes nothing", async () => {
			const change = await updateAutoModerationRule(GUILD_ID, "1", () => null);

			expect(storage.patchAutoModerationRule).not.toHaveBeenCalled();
			expect(change.patch).toStrictEqual({});
		});

		it("lets a rule keep its own name but not take another's", async () => {
			storage.fetchAutoModerationRules.mockResolvedValue([
				makeRule("1", "Spam"),
				makeRule("2", "Links"),
			]);

			await expect(
				updateAutoModerationRule(GUILD_ID, "1", () => ({ name: "spam" })),
			).resolves.toMatchObject({ patch: { name: "spam" } });
			expect(
				await codeOf(updateAutoModerationRule(GUILD_ID, "1", () => ({ name: "LINKS" }))),
			).toBe("nameTaken");
		});

		it("reports a rule that does not exist", async () => {
			expect(
				await codeOf(updateAutoModerationRule(GUILD_ID, "404", () => ({ enabled: false }))),
			).toBe("unknown");
		});
	});

	describe("deleteAutoModerationRule", () => {
		it("returns the rule it deleted", async () => {
			await expect(deleteAutoModerationRule(GUILD_ID, "1")).resolves.toMatchObject({
				name: "Spam",
			});
			expect(storage.removeAutoModerationRule).toHaveBeenCalledWith(
				expect.anything(),
				GUILD_ID,
				"1",
			);
		});

		it("reports a rule that does not exist", async () => {
			expect(await codeOf(deleteAutoModerationRule(GUILD_ID, "404"))).toBe("unknown");
		});
	});

	it("runs the writes of a guild one after the other", async () => {
		const order: string[] = [];
		storage.patchAutoModerationRule.mockImplementation(
			async (_db: unknown, _guild: string, _id: string, patch: { name?: string }) => {
				order.push(`start:${patch.name}`);
				await new Promise((resolve) => setTimeout(resolve, 5));
				order.push(`end:${patch.name}`);
				return true;
			},
		);

		await Promise.all([
			updateAutoModerationRule(GUILD_ID, "1", () => ({ name: "First" })),
			updateAutoModerationRule(GUILD_ID, "1", () => ({ name: "Second" })),
		]);

		expect(order).toStrictEqual(["start:First", "end:First", "start:Second", "end:Second"]);
	});
});
