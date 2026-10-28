import type { APIGuild } from "discord-api-types/v10";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
	const transaction = {
		settings: { id: "100000000000000000", language: "en-US", honeypotAction: "Ban" },
		write: vi.fn(),
		submit: vi.fn(),
		[Symbol.dispose]: vi.fn(),
	};
	return {
		transaction,
		assertHoneypotIsUsable: vi.fn(),
		plannedSettings: { honeypotAction: "Kick" },
	};
});

vi.mock("#server/database", () => ({
	serializeSettings: (settings: unknown) => JSON.stringify(settings),
	writeSettingsTransaction: async () => mocks.transaction,
}));
vi.mock("#server/database/settings/automod/storage", () => ({
	writeAutoModerationRulePlan: vi.fn(),
}));
vi.mock("#server/utils/automod/rules", () => ({
	writeAutoModerationRules: (_guildId: string, run: (rules: unknown[]) => unknown) => run([]),
}));
vi.mock("#server/utils/settings-transfer/plan", () => ({
	findOversizedRuleLists: () => [],
	getPlannedRules: () => ({ create: [], update: [], remove: [] }),
	getPlannedSettings: () => mocks.plannedSettings,
	planConfigurationImport: () => ({
		isEmpty: false,
		settings: [{ key: "honeypotAction" }],
		rules: { create: [], update: [], remove: [] },
	}),
}));
vi.mock("#server/utils/honeypot/permissions", () => ({
	assertHoneypotIsUsable: mocks.assertHoneypotIsUsable,
}));

import { applyConfigurationImport } from "#server/utils/settings-transfer/apply";

const guild = { id: "100000000000000000" } as APIGuild;

describe("applyConfigurationImport and the honeypot", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// The import can change the action of a live trap: it gets the check `settings.patch` makes.
	it("checks the honeypot against what the import would write", async () => {
		await applyConfigurationImport(guild, {} as never).catch(() => {});

		expect(mocks.assertHoneypotIsUsable).toHaveBeenCalledWith(
			guild,
			mocks.transaction.settings,
			mocks.plannedSettings,
		);
	});

	it("writes nothing when the bot could not carry the honeypot out", async () => {
		mocks.assertHoneypotIsUsable.mockRejectedValueOnce(
			Object.assign(new Error("refused"), { status: 422 }),
		);

		await expect(applyConfigurationImport(guild, {} as never)).rejects.toMatchObject({
			status: 422,
		});
		expect(mocks.transaction.submit).not.toHaveBeenCalled();
	});
});
