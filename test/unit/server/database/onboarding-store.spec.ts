import { describe, expect, it, vi } from "vitest";

const GUILD_ID = "100000000000000009";

/**
 * A database another write commits to while the read is in flight. The stage
 * query answers the rows it sees when it is sent, and the write then commits;
 * the onboarding row answers what is committed when its query is answered,
 * one turn later, as a second connection would.
 */
const database = vi.hoisted(() => {
	const committed = {
		revision: 1,
		stages: [{ name: "Old name" }],
	};

	function stageRow(name: string, id: bigint) {
		return {
			answers: [],
			challenge: "Button",
			createdAt: "2026-11-26 10:00:00.000",
			enabled: true,
			failureAction: "None",
			failureTimeout: null,
			guildId: 1n,
			id,
			maxAttempts: 3,
			name,
			position: 0,
			question: null,
			roleId: null,
			timeLimit: 600,
			trigger: "Join",
		};
	}

	function commitConcurrentWrite() {
		committed.revision = 2;
		committed.stages = [{ name: "New name" }];
	}

	const orm = {
		public: {
			GuildOnboarding: {
				first: () =>
					new Promise((resolve) => {
						setTimeout(() =>
							resolve({
								channelId: null,
								enabled: true,
								logChannelId: null,
								messageId: null,
								revision: committed.revision,
							}),
						);
					}),
			},
			GuildOnboardingStage: {
				where: () => ({
					all: () => {
						const seen = committed.stages.map((stage, index) =>
							stageRow(stage.name, BigInt(index + 1)),
						);
						commitConcurrentWrite();
						return Promise.resolve(seen);
					},
				}),
			},
		},
	};

	return { orm };
});

vi.mock("#server/database/prisma", () => ({ db: { orm: database.orm } }));
vi.mock("#server/database/settings/notify", () => ({ notifyGuildSettingsUpdate: vi.fn() }));

import { onboardingStore } from "#server/database/settings/onboarding/store";

describe("onboardingStore.read", () => {
	it("never pairs stages with a revision newer than they are", async () => {
		const record = await onboardingStore.read(GUILD_ID);

		// The stages are the ones of revision 1: a write sent with revision 2
		// would overwrite the new name without a conflict.
		expect(record.stages.map((stage) => stage.name)).toStrictEqual(["Old name"]);
		expect(record.revision).toBe(1);
	});
});
