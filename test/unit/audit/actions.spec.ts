import {
	AuditActionName,
	guildSettingsAccessDenied,
	guildSettingsUpdate,
	oauthStateInvalid,
	sessionRefresh,
	userLogin,
	userLogout,
} from "#shared/audit/actions";
import { describe, expect, it } from "vitest";

const TEST_ACTOR = { type: "user" as const, id: "123" };

describe("audit action registry", () => {
	const actions = [
		{ creator: guildSettingsUpdate, name: "guild.settings.update" },
		{ creator: guildSettingsAccessDenied, name: "guild.settings.access-denied" },
		{ creator: userLogin, name: "user.login" },
		{ creator: userLogout, name: "user.logout" },
		{ creator: sessionRefresh, name: "session.refresh" },
		{ creator: oauthStateInvalid, name: "oauth.state.invalid" },
	] as const;

	for (const { creator, name } of actions) {
		it(`${name}: creator is callable and sets action correctly`, () => {
			const input = creator({ actor: TEST_ACTOR });
			expect(input.action).toBe(name);
		});
	}

	it("AuditActionName type covers all registered actions", () => {
		// Type-level check: if the union is incomplete, TypeScript would flag the assertion below
		const names: AuditActionName[] = [
			"guild.settings.update",
			"guild.settings.access-denied",
			"user.login",
			"user.logout",
			"session.refresh",
			"oauth.state.invalid",
		];
		expect(names).toHaveLength(6);
	});

	it("creator returns AuditInput with actor preserved", () => {
		const actor = { type: "user" as const, id: "456", displayName: "Alice" };
		const input = userLogin({ actor });
		expect(input.actor).toEqual(actor);
	});
});
