import type { OnboardingStage, OnboardingStageInput } from "#shared/utils/onboarding";
import {
	createOnboardingStage,
	deleteOnboardingStage,
	reorderOnboardingStages,
	setOnboardingLogChannel,
	updateOnboardingStage,
} from "#server/utils/onboarding/stages";
import { describe, expect, it } from "vitest";
import { createMemoryOnboardingStore } from "./memory-store";

const GUILD_ID = "123456789012345678";

function makeInput(overrides: Partial<OnboardingStageInput> = {}): OnboardingStageInput {
	return {
		answers: [],
		challenge: "Button",
		enabled: true,
		failureAction: "None",
		failureTimeout: null,
		maxAttempts: 3,
		name: "Quick check",
		question: null,
		roleId: null,
		timeLimit: 600,
		trigger: "Join",
		...overrides,
	};
}

function makeStage(id: string, name: string, position: number): OnboardingStage {
	return { ...makeInput({ name }), createdAt: 0, id, position };
}

function threeStages() {
	return createMemoryOnboardingStore({
		revision: 7,
		stages: [
			makeStage("1", "Are you human?", 0),
			makeStage("2", "Server rules", 1),
			makeStage("3", "Quick check", 2),
		],
	});
}

describe("createOnboardingStage", () => {
	it("adds the stage after the ones the guild has, and raises the revision", async () => {
		const { store, record } = createMemoryOnboardingStore({
			revision: 2,
			stages: [makeStage("1", "Are you human?", 0)],
		});

		const result = await createOnboardingStage(
			store,
			GUILD_ID,
			2,
			makeInput({ name: " New " }),
		);

		expect(result).toMatchObject({ ok: true, value: { name: "New", position: 1 } });
		expect(record().revision).toBe(3);
		expect(record().stages.map((stage) => stage.name)).toStrictEqual(["Are you human?", "New"]);
	});

	it("refuses a write that read an older revision, and writes nothing", async () => {
		const { store, record } = createMemoryOnboardingStore({ revision: 5 });

		const result = await createOnboardingStage(store, GUILD_ID, 4, makeInput());

		expect(result).toStrictEqual({ error: { code: "conflict" }, ok: false });
		expect(record()).toMatchObject({ revision: 5, stages: [] });
	});

	it("refuses a sixth stage", async () => {
		const { store, record } = createMemoryOnboardingStore({
			stages: ["a", "b", "c", "d", "e"].map((name, index) =>
				makeStage(String(index + 1), name, index),
			),
		});

		const result = await createOnboardingStage(store, GUILD_ID, 0, makeInput());

		expect(result).toStrictEqual({ error: { code: "limit" }, ok: false });
		expect(record().revision).toBe(0);
	});

	it("refuses a name another stage has, whatever its case", async () => {
		const { store } = threeStages();

		const result = await createOnboardingStage(
			store,
			GUILD_ID,
			7,
			makeInput({ name: "server RULES" }),
		);

		expect(result).toStrictEqual({ error: { code: "nameTaken" }, ok: false });
	});

	it("refuses a stage the bot could not run, with its problem", async () => {
		const { store, record } = createMemoryOnboardingStore();

		const result = await createOnboardingStage(
			store,
			GUILD_ID,
			0,
			makeInput({ challenge: "Question", question: "Ready?" }),
		);

		expect(result).toStrictEqual({ error: { code: "stage", problem: "answers" }, ok: false });
		expect(record().revision).toBe(0);
	});
});

describe("createOnboardingStage with the captcha", () => {
	it("creates a Captcha stage only when the site checks one", async () => {
		const { store, record } = createMemoryOnboardingStore();
		const input = makeInput({ challenge: "Captcha" });

		const refused = await createOnboardingStage(store, GUILD_ID, 0, input);
		const created = await createOnboardingStage(store, GUILD_ID, 0, input, {
			captchaAvailable: true,
		});

		expect(refused).toStrictEqual({ error: { code: "stage", problem: "captcha" }, ok: false });
		expect(created.ok).toBe(true);
		expect(record().stages.map((stage) => stage.challenge)).toStrictEqual(["Captcha"]);
	});
});

describe("updateOnboardingStage", () => {
	it("changes the fields that are given and answers the stage before and after", async () => {
		const { store, record } = threeStages();

		const result = await updateOnboardingStage(store, GUILD_ID, 7, "2", { enabled: false });

		expect(result).toMatchObject({
			ok: true,
			value: { after: { enabled: false, id: "2" }, before: { enabled: true, id: "2" } },
		});
		expect(record().stages[1]).toMatchObject({ enabled: false, name: "Server rules" });
		expect(record().revision).toBe(8);
	});

	it("reads the change with the fields the stage has", async () => {
		const { store, record } = threeStages();

		const result = await updateOnboardingStage(store, GUILD_ID, 7, "2", {
			challenge: "Question",
		});

		expect(result).toStrictEqual({ error: { code: "stage", problem: "question" }, ok: false });
		expect(record().stages[1]?.challenge).toBe("Button");
	});

	it("empties the question of a stage that no longer asks one", async () => {
		const { store, record } = createMemoryOnboardingStore({
			stages: [
				{
					...makeStage("1", "Server rules", 0),
					answers: ["yes"],
					challenge: "Question",
					question: "Did you read the rules?",
				},
			],
		});

		await updateOnboardingStage(store, GUILD_ID, 0, "1", { challenge: "Emoji" });

		expect(record().stages[0]).toMatchObject({
			answers: [],
			challenge: "Emoji",
			question: null,
		});
	});

	it("lets a stage keep its own name, and refuses the name of another", async () => {
		const { store } = threeStages();

		const kept = await updateOnboardingStage(store, GUILD_ID, 7, "2", { name: "SERVER rules" });
		const taken = await updateOnboardingStage(store, GUILD_ID, 8, "2", { name: "quick check" });

		expect(kept.ok).toBe(true);
		expect(taken).toStrictEqual({ error: { code: "nameTaken" }, ok: false });
	});

	it("checks only a role the change sets", async () => {
		const { store, record } = createMemoryOnboardingStore({
			stages: [{ ...makeStage("1", "Server rules", 0), roleId: "111" }],
		});
		const cannotGive = () => false;

		const renamed = await updateOnboardingStage(
			store,
			GUILD_ID,
			0,
			"1",
			{ name: "Rules", roleId: "111" },
			{ canGiveRole: cannotGive },
		);
		const moved = await updateOnboardingStage(
			store,
			GUILD_ID,
			1,
			"1",
			{ roleId: "222" },
			{ canGiveRole: cannotGive },
		);

		expect(renamed.ok).toBe(true);
		expect(moved).toStrictEqual({ error: { code: "role" }, ok: false });
		expect(record().stages[0]).toMatchObject({ name: "Rules", roleId: "111" });
		expect(record().revision).toBe(1);
	});

	it("switches off a stage the bot's panel gave the captcha", async () => {
		const { store, record } = createMemoryOnboardingStore({
			stages: [{ ...makeStage("4", "Captcha check", 0), challenge: "Captcha" }],
		});

		const result = await updateOnboardingStage(store, GUILD_ID, 0, "4", { enabled: false });

		expect(result.ok).toBe(true);
		expect(record().stages[0]).toMatchObject({ challenge: "Captcha", enabled: false });
	});

	it("gives a stage the captcha when the site checks one", async () => {
		const { store, record } = threeStages();

		const result = await updateOnboardingStage(
			store,
			GUILD_ID,
			7,
			"1",
			{ challenge: "Captcha" },
			{ captchaAvailable: true },
		);

		expect(result.ok).toBe(true);
		expect(record().stages[0]?.challenge).toBe("Captcha");
	});

	it("refuses to give a stage the captcha when the site cannot check one", async () => {
		const { store, record } = threeStages();

		const result = await updateOnboardingStage(store, GUILD_ID, 7, "1", {
			challenge: "Captcha",
		});

		expect(result).toStrictEqual({ error: { code: "stage", problem: "captcha" }, ok: false });
		expect(record().stages[0]?.challenge).toBe("Button");
	});

	it("refuses a stage that is gone", async () => {
		const { store } = threeStages();

		const result = await updateOnboardingStage(store, GUILD_ID, 7, "99", { enabled: false });

		expect(result).toStrictEqual({ error: { code: "unknown" }, ok: false });
	});

	it("refuses a write that read an older revision", async () => {
		const { store, record } = threeStages();

		const result = await updateOnboardingStage(store, GUILD_ID, 6, "2", { enabled: false });

		expect(result).toStrictEqual({ error: { code: "conflict" }, ok: false });
		expect(record().stages[1]?.enabled).toBe(true);
	});
});

describe("deleteOnboardingStage", () => {
	it("removes the stage and closes the gap in the sequence", async () => {
		const { store, record } = threeStages();

		const result = await deleteOnboardingStage(store, GUILD_ID, 7, "2");

		expect(result).toMatchObject({ ok: true, value: { name: "Server rules" } });
		expect(record().stages.map((stage) => [stage.id, stage.position])).toStrictEqual([
			["1", 0],
			["3", 1],
		]);
	});

	it("refuses a stage that is gone", async () => {
		const { store } = threeStages();

		const result = await deleteOnboardingStage(store, GUILD_ID, 7, "99");

		expect(result).toStrictEqual({ error: { code: "unknown" }, ok: false });
	});
});

describe("reorderOnboardingStages", () => {
	it("gives each stage its new place, and answers the order before and after", async () => {
		const { store, record } = threeStages();

		const result = await reorderOnboardingStages(store, GUILD_ID, 7, ["3", "1", "2"]);

		expect(result).toStrictEqual({
			ok: true,
			value: {
				after: ["Quick check", "Are you human?", "Server rules"],
				before: ["Are you human?", "Server rules", "Quick check"],
			},
		});
		expect(record().stages.map((stage) => [stage.id, stage.position])).toStrictEqual([
			["3", 0],
			["1", 1],
			["2", 2],
		]);
	});

	it.each([
		["leaves a stage out", ["1", "2"]],
		["names a stage twice", ["1", "1", "2"]],
		["names a stage the guild has not", ["1", "2", "9"]],
	])("refuses an order that %s", async (_label, order) => {
		const { store, record } = threeStages();

		const result = await reorderOnboardingStages(store, GUILD_ID, 7, order);

		expect(result).toStrictEqual({ error: { code: "invalid" }, ok: false });
		expect(record().revision).toBe(7);
	});
});

describe("setOnboardingLogChannel", () => {
	it("sets the channel and answers the one before", async () => {
		const { store, record } = createMemoryOnboardingStore({ logChannelId: "300", revision: 1 });

		const result = await setOnboardingLogChannel(store, GUILD_ID, 1, null);

		expect(result).toStrictEqual({ ok: true, value: { before: "300" } });
		expect(record()).toMatchObject({ logChannelId: null, revision: 2 });
	});

	it("refuses a write that read an older revision, and keeps the channel", async () => {
		const { store, record } = createMemoryOnboardingStore({ logChannelId: "300", revision: 2 });

		const result = await setOnboardingLogChannel(store, GUILD_ID, 1, "400");

		expect(result).toStrictEqual({ error: { code: "conflict" }, ok: false });
		expect(record().logChannelId).toBe("300");
	});
});
