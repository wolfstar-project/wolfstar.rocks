import { describe, expect, it, vi } from "vitest";

const R1 = "300000000000000001";

const { mockReadFreshSettings } = vi.hoisted(() => {
	const globals = globalThis as Record<string, unknown>;
	globals.defineWrappedResponseHandler = (fn: unknown) => fn;
	globals.getRouterParam = () => "ban";
	globals.seconds = (n: number) => n;
	return { mockReadFreshSettings: vi.fn() };
});

vi.mock("#server/utils/guilds/manager", () => ({
	authorizeGuildManager: () => vi.fn(),
	useManagedGuild: () => ({ guild: { id: "guild-1" }, member: { user: { id: "user-1" } } }),
}));

vi.mock("#server/database", () => ({ readFreshSettings: mockReadFreshSettings }));

import type { H3Event } from "h3";
import getHandler from "#server/api/guilds/[guild]/command-rules/[command].get";
import { getCommandRuleRevision } from "#shared/utils/command-rules";

const callHandler = getHandler as unknown as (event: H3Event) => Promise<unknown>;

describe("GET /api/guilds/:guild/command-rules/:command", () => {
	it("reads the rule from the database, with its revision", async () => {
		mockReadFreshSettings.mockResolvedValue({
			commandsDisabled: ["ban"],
			commandsRestrictions: [{ command: "ban", ignoredRoles: [R1] }],
		});

		const state = await callHandler({} as H3Event);

		expect(mockReadFreshSettings).toHaveBeenCalledWith("guild-1");
		const rule = {
			command: "ban",
			allowedChannels: [],
			ignoredChannels: [],
			allowedRoles: [],
			ignoredRoles: [R1],
			allowedUsers: [],
			ignoredUsers: [],
		};
		expect(state).toEqual({
			command: "ban",
			enabled: false,
			onlyAllowed: false,
			rule,
			revision: getCommandRuleRevision(rule, true),
		});
	});
});
