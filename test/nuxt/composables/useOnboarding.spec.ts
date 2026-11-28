import type { OnboardingStageInput, OnboardingState } from "#shared/utils/onboarding";
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { createError, getQuery } from "h3";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockOnboardingStage, createMockOnboardingState } from "~~/test/mocks/onboarding";

const GUILD_ID = "666666666666666666";
const BASE = `/api/guilds/${GUILD_ID}/onboarding`;

// What the server holds: a write with an older revision than this is refused.
let server: OnboardingState = createMockOnboardingState();
let bodies: unknown[] = [];

function refuse(statusCode: number, data: Record<string, unknown>): never {
	throw createError({ data, statusCode });
}

/** Refuses an old revision as the routes do, then stores the change at the next one. */
function write(revision: unknown, change: (current: OnboardingState) => Partial<OnboardingState>) {
	if (revision !== server.revision) refuse(409, { code: "conflict" });
	server = { ...server, ...change(server), revision: server.revision + 1 };
	return server;
}

const stageInput: OnboardingStageInput = {
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
};

registerEndpoint(BASE, { handler: () => server, method: "GET" });

// h3's `readBody` needs Node's `Buffer`, which the browser has not: the body
// is read off the web request the event carries.
registerEndpoint(BASE, {
	handler: async (event) => {
		const body = (await event.req.json()) as { revision: number; logChannelId: string | null };
		bodies.push(body);
		if (body.logChannelId === "999") {
			refuse(422, { code: "logPermissions", missing: ["SendMessages"] });
		}
		return write(body.revision, () => ({ logChannelId: body.logChannelId }));
	},
	method: "PATCH",
});

registerEndpoint(`${BASE}/stages`, {
	handler: async (event) => {
		const body = (await event.req.json()) as { revision: number; stage: OnboardingStageInput };
		bodies.push(body);
		return write(body.revision, (current) => ({
			stages: [
				...current.stages,
				createMockOnboardingStage({
					...body.stage,
					id: String(current.stages.length + 1),
					position: current.stages.length,
				}),
			],
		}));
	},
	method: "POST",
});

registerEndpoint(`${BASE}/stages/order`, {
	handler: async (event) => {
		const body = (await event.req.json()) as { revision: number; order: string[] };
		bodies.push(body);
		return write(body.revision, (current) => ({
			stages: body.order.flatMap((id, position) => {
				const stage = current.stages.find((entry) => entry.id === id);
				return stage ? [{ ...stage, position }] : [];
			}),
		}));
	},
	method: "PUT",
});

registerEndpoint(`${BASE}/stages/1`, {
	handler: async (event) => {
		const body = (await event.req.json()) as {
			revision: number;
			stage: Partial<OnboardingStageInput>;
		};
		bodies.push(body);
		return write(body.revision, (current) => ({
			stages: current.stages.map((stage) =>
				stage.id === "1" ? { ...stage, ...body.stage } : stage,
			),
		}));
	},
	method: "PATCH",
});

registerEndpoint(`${BASE}/stages/1`, {
	handler: (event) => {
		const revision = Number(getQuery(event).revision);
		bodies.push({ revision });
		return write(revision, (current) => ({
			stages: current.stages.filter((stage) => stage.id !== "1"),
		}));
	},
	method: "DELETE",
});

async function openOnboarding() {
	const onboarding = useOnboarding(GUILD_ID);
	await vi.waitFor(() => expect(onboarding.status.value).toBe("success"));
	return onboarding;
}

describe("useOnboarding", () => {
	beforeEach(() => {
		server = createMockOnboardingState({
			revision: 4,
			stages: [
				createMockOnboardingStage({ id: "1", name: "Are you human?" }),
				createMockOnboardingStage({ id: "2", name: "Server rules", position: 1 }),
			],
		});
		bodies = [];
		clearNuxtData();
	});

	it("reads the onboarding of the guild", async () => {
		const onboarding = await openOnboarding();

		expect(onboarding.state.value?.revision).toBe(4);
		expect(onboarding.state.value?.stages.map((stage) => stage.name)).toStrictEqual([
			"Are you human?",
			"Server rules",
		]);
	});

	it("creates a stage with the revision it read, and shows the server's answer", async () => {
		const onboarding = await openOnboarding();

		const result = await onboarding.createStage(stageInput);

		expect(bodies).toStrictEqual([{ revision: 4, stage: stageInput }]);
		expect(result.ok).toBe(true);
		await vi.waitFor(() => expect(onboarding.state.value?.revision).toBe(5));
		expect(onboarding.state.value?.stages).toHaveLength(3);
	});

	it("sends each next write with the revision of the answer before", async () => {
		const onboarding = await openOnboarding();

		await onboarding.updateStage("1", { enabled: false });
		await vi.waitFor(() => expect(onboarding.state.value?.revision).toBe(5));
		await onboarding.reorderStages(["2", "1"]);
		await vi.waitFor(() => expect(onboarding.state.value?.revision).toBe(6));
		await onboarding.deleteStage("1");
		await vi.waitFor(() => expect(onboarding.state.value?.revision).toBe(7));

		expect(bodies).toStrictEqual([
			{ revision: 4, stage: { enabled: false } },
			{ order: ["2", "1"], revision: 5 },
			{ revision: 6 },
		]);
		expect(onboarding.state.value?.stages.map((stage) => stage.id)).toStrictEqual(["2"]);
	});

	it("turns the conflict on when someone else wrote first, and keeps what the page showed", async () => {
		const onboarding = await openOnboarding();
		// Another administrator saves from the bot's panel.
		server = { ...server, logChannelId: "777", revision: 5 };

		const result = await onboarding.updateStage("1", { enabled: false });

		expect(result).toStrictEqual({ error: { code: "conflict" }, ok: false });
		expect(onboarding.conflict.value).toBe(true);
		expect(onboarding.state.value?.revision).toBe(4);
		expect(server.stages[0]?.enabled).toBe(true);
	});

	it("sends the revision a draft was opened on, and refuses it once the onboarding moved on", async () => {
		const onboarding = await openOnboarding();
		// The page reads again behind the editor, which was opened at revision 4.
		server = { ...server, revision: 5 };
		await onboarding.refresh();
		await vi.waitFor(() => expect(onboarding.state.value?.revision).toBe(5));

		const result = await onboarding.updateStage("1", { name: "Old draft" }, 4);

		expect(bodies).toStrictEqual([{ revision: 4, stage: { name: "Old draft" } }]);
		expect(result).toStrictEqual({ error: { code: "conflict" }, ok: false });
		expect(onboarding.conflict.value).toBe(true);
	});

	it("ends the conflict by reading the onboarding again", async () => {
		const onboarding = await openOnboarding();
		server = { ...server, logChannelId: "777", revision: 5 };
		await onboarding.updateStage("1", { enabled: false });

		await onboarding.reload();

		expect(onboarding.conflict.value).toBe(false);
		expect(onboarding.state.value?.revision).toBe(5);
		expect(onboarding.state.value?.logChannelId).toBe("777");

		const retried = await onboarding.updateStage("1", { enabled: false });
		expect(retried.ok).toBe(true);
	});

	it("answers a refused log channel with the permissions the bot lacks, and no conflict", async () => {
		const onboarding = await openOnboarding();

		const result = await onboarding.setLogChannel("999");

		expect(result).toStrictEqual({
			error: { code: "logPermissions", missing: ["SendMessages"] },
			ok: false,
		});
		expect(onboarding.conflict.value).toBe(false);
		expect(onboarding.state.value?.logChannelId).toBeNull();
	});

	it("saves the log channel", async () => {
		const onboarding = await openOnboarding();

		const result = await onboarding.setLogChannel("300");

		expect(result.ok).toBe(true);
		expect(bodies).toStrictEqual([{ logChannelId: "300", revision: 4 }]);
		await vi.waitFor(() => expect(onboarding.state.value?.logChannelId).toBe("300"));
	});
});
