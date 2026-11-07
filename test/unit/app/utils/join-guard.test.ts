import type { JoinGuardQueueEntry, JoinGuardRuleInput } from "#shared/utils/join-guard";
import { validateJoinGuardRule } from "#shared/utils/join-guard";
import { describe, expect, it } from "vitest";
import {
	createJoinGuardRuleDraft,
	formatJoinGuardAgo,
	joinGuardActionChips,
	joinGuardConditionChips,
	joinGuardDecision,
	joinGuardDraftToInput,
	joinGuardFailureKey,
	joinGuardRuleErrorKey,
	joinGuardRuleSummary,
	joinGuardRuleToDraft,
	joinGuardRuleTone,
	joinGuardSignals,
	joinGuardTimeoutHours,
	joinGuardTimeoutSeconds,
	joinGuardVerifyLink,
	parseJoinGuardDays,
	toggleJoinGuardCheckpoint,
	toggleJoinGuardHardAction,
	toggleJoinGuardRole,
	type JoinGuardNames,
	type JoinGuardText,
} from "~/utils/join-guard";
import guilds from "../../../../i18n/locales/en/guilds.json";

// The English source, read the way the app's `ts` and `tc` read it: `{name}`
// is replaced, and a `zero | one | other` string is picked by its count.
function lookup(key: string): string {
	let node: unknown = guilds;
	for (const part of key.split(".")) {
		node = (node as Record<string, unknown> | undefined)?.[part];
	}
	if (typeof node !== "string") throw new Error(`No English string for ${key}`);
	return node;
}

function interpolate(text: string, params: Record<string, string | number> = {}): string {
	return text.replaceAll(/\{(\w+)\}/g, (match, name: string) =>
		name in params ? String(params[name]) : match,
	);
}

const text: JoinGuardText = {
	tc: (key, params) => {
		const values = typeof params === "number" ? { count: params } : params;
		const count = Number(values.count);
		const forms = lookup(key).split(" | ");
		const form = forms.length === 3 ? forms[count === 0 ? 0 : count === 1 ? 1 : 2] : forms[0];
		return interpolate(form ?? "", values);
	},
	ts: (key, params) => interpolate(lookup(key), params),
};

const names: JoinGuardNames = {
	channel: (id) => (id === "300" ? "mod-chat" : null),
	role: (id) => (id === "200" ? "Quarantine" : null),
};

const DAY = 86_400;

function makeRule(overrides: Partial<JoinGuardRuleInput> = {}): JoinGuardRuleInput {
	return {
		accountAgeMax: null,
		alertChannelId: null,
		defaultAvatar: false,
		directMessage: false,
		enabled: true,
		generatedName: false,
		hardAction: null,
		name: "Fresh accounts",
		nameContains: null,
		roleId: null,
		sendToCheckpoint: false,
		unverifiedBot: false,
		...overrides,
	};
}

describe("join guard rule chips", () => {
	it("lists every condition a rule sets, in the design's order", () => {
		const rule = makeRule({
			accountAgeMax: 7 * DAY,
			defaultAvatar: true,
			generatedName: true,
			nameContains: "nitro",
			unverifiedBot: true,
		});

		expect(joinGuardConditionChips(rule, text)).toStrictEqual([
			"< 7 days",
			"Default avatar",
			"Generated name",
			"Name has “nitro”",
			"Unverified app",
		]);
		expect(joinGuardConditionChips(makeRule({ accountAgeMax: DAY }), text)).toStrictEqual([
			"< 1 day",
		]);
	});

	it("names the role and the channel of the actions, or says they are gone", () => {
		const rule = makeRule({
			alertChannelId: "300",
			directMessage: true,
			roleId: "200",
			sendToCheckpoint: true,
		});
		expect(joinGuardActionChips(rule, text, names)).toStrictEqual([
			"Checkpoint",
			"@Quarantine",
			"DM",
			"Alert #mod-chat",
		]);

		const gone = makeRule({ alertChannelId: "999", hardAction: "Ban" });
		expect(joinGuardActionChips(gone, text, names)).toStrictEqual([
			"Alert #deleted-channel",
			"Ban",
		]);
	});

	it("tones a rule by the hardest thing it does", () => {
		expect(joinGuardRuleTone(makeRule({ hardAction: "Kick" }))).toBe("error");
		expect(joinGuardRuleTone(makeRule({ hardAction: "Ban" }))).toBe("error");
		expect(joinGuardRuleTone(makeRule({ sendToCheckpoint: true }))).toBe("primary");
		expect(joinGuardRuleTone(makeRule({ directMessage: true }))).toBe("warning");
	});
});

describe("joinGuardRuleSummary", () => {
	it("says what the rule does in one sentence", () => {
		const rule = makeRule({
			accountAgeMax: 7 * DAY,
			alertChannelId: "300",
			directMessage: true,
			sendToCheckpoint: true,
		});

		expect(joinGuardRuleSummary(rule, text, names, "en")).toBe(
			"A member who joins with an account younger than 7 days is sent to the checkpoint and is told why in a DM, and #mod-chat is alerted.",
		);
	});

	it("puts the kick first and lists three conditions", () => {
		const rule = makeRule({
			accountAgeMax: 30 * DAY,
			defaultAvatar: true,
			generatedName: true,
			hardAction: "Kick",
		});

		expect(joinGuardRuleSummary(rule, text, names, "en")).toBe(
			"A member who joins with an account younger than 30 days, a default avatar, and a generated-looking name is kicked and a case is opened.",
		);
	});

	it("leaves an ellipsis for what the rule does not set yet", () => {
		const rule = makeRule({ name: "" });
		expect(joinGuardRuleSummary(rule, text, names, "en")).toBe("A member who joins with … ….");
	});
});

describe("the rule draft", () => {
	it("starts a new rule as the design does, with the checkpoint when it is on", () => {
		const draft = createJoinGuardRuleDraft(true);
		expect(draft).toMatchObject({
			accountAge: true,
			accountAgeDays: 7,
			directMessage: true,
			enabled: true,
			sendToCheckpoint: true,
		});
		expect(createJoinGuardRuleDraft(false).sendToCheckpoint).toBe(false);
	});

	it("goes back to the rule it was made from", () => {
		const rule = makeRule({
			accountAgeMax: 14 * DAY,
			alertChannelId: "300",
			nameContains: "free nitro",
			roleId: "200",
		});

		expect(joinGuardDraftToInput(joinGuardRuleToDraft(rule))).toStrictEqual(rule);
	});

	it("keeps a ticked box's empty field, so the validation names it", () => {
		const draft = {
			...createJoinGuardRuleDraft(false),
			accountAgeDays: null,
			name: "  Raids  ",
		};
		const input = joinGuardDraftToInput(draft);

		expect(input.name).toBe("Raids");
		expect(input.accountAgeMax).toBe(0);
		expect(validateJoinGuardRule(input, { checkpointOn: false })).toBe("accountAge");

		const named = joinGuardDraftToInput({
			...createJoinGuardRuleDraft(false),
			accountAge: false,
			name: "Names",
			nameContains: true,
			nameContainsText: " ",
		});
		expect(validateJoinGuardRule(named, { checkpointOn: false })).toBe("nameContains");
	});

	it("drops a role or a channel that is ticked but not picked", () => {
		const input = joinGuardDraftToInput({
			...createJoinGuardRuleDraft(false),
			alert: true,
			directMessage: false,
			giveRole: true,
			name: "Quiet",
		});

		expect(input.roleId).toBeNull();
		expect(input.alertChannelId).toBeNull();
		expect(validateJoinGuardRule(input, { checkpointOn: false })).toBe("actions");
	});

	it("refuses the checkpoint while it is off", () => {
		const input = joinGuardDraftToInput({ ...createJoinGuardRuleDraft(true), name: "Fresh" });
		expect(validateJoinGuardRule(input, { checkpointOn: false })).toBe("checkpointOff");
		expect(validateJoinGuardRule(input, { checkpointOn: true })).toBeNull();
	});
});

describe("kick and ban exclusivity", () => {
	const base = {
		...createJoinGuardRuleDraft(true),
		giveRole: true,
		roleId: "200",
	};

	it("turns off the checkpoint and the role when a kick or a ban is ticked", () => {
		const kicked = toggleJoinGuardHardAction(base, "Kick");
		expect(kicked).toMatchObject({
			giveRole: false,
			hardAction: "Kick",
			sendToCheckpoint: false,
		});

		const banned = toggleJoinGuardHardAction(kicked, "Ban");
		expect(banned.hardAction).toBe("Ban");

		expect(toggleJoinGuardHardAction(banned, "Ban").hardAction).toBeNull();
	});

	it("drops the kick or the ban when the checkpoint or a role is ticked again", () => {
		const banned = toggleJoinGuardHardAction(base, "Ban");

		expect(toggleJoinGuardCheckpoint(banned)).toMatchObject({
			hardAction: null,
			sendToCheckpoint: true,
		});
		expect(toggleJoinGuardRole(banned)).toMatchObject({ giveRole: true, hardAction: null });
		// Unticking leaves the kick or ban alone.
		expect(toggleJoinGuardCheckpoint(base).sendToCheckpoint).toBe(false);
	});
});

describe("the editor's fields", () => {
	it("keeps the digits of the days, four at most", () => {
		expect(parseJoinGuardDays("7")).toBe(7);
		expect(parseJoinGuardDays("1a2")).toBe(12);
		expect(parseJoinGuardDays("123456")).toBe(1234);
		expect(parseJoinGuardDays("")).toBeNull();
		expect(parseJoinGuardDays(null)).toBeNull();
	});

	it("converts the timeout between hours and seconds, 0 never kicking", () => {
		expect(joinGuardTimeoutHours(86_400)).toBe(24);
		expect(joinGuardTimeoutHours(0)).toBe(0);
		expect(joinGuardTimeoutHours(10_000_000)).toBe(168);
		expect(joinGuardTimeoutSeconds(24)).toBe(86_400);
		expect(joinGuardTimeoutSeconds(500)).toBe(604_800);
		expect(joinGuardTimeoutSeconds(-3)).toBe(0);
		expect(joinGuardTimeoutSeconds(null)).toBe(0);
	});

	it("prints the checkpoint link without the scheme", () => {
		expect(joinGuardVerifyLink("https://wolfstar.rocks/", "254360814063058944")).toStrictEqual({
			href: "https://wolfstar.rocks/verify/254360814063058944",
			label: "wolfstar.rocks/verify/254360814063058944",
		});
	});
});

describe("the queue rows", () => {
	const entry: Pick<
		JoinGuardQueueEntry,
		"defaultAvatar" | "generatedName" | "linkedAccounts" | "status" | "resolution" | "moderator"
	> = {
		defaultAvatar: true,
		generatedName: true,
		linkedAccounts: 0,
		moderator: null,
		resolution: null,
		status: "Waiting",
	};

	it("lists the signals the guard saw", () => {
		expect(joinGuardSignals(entry, text)).toBe(
			"default avatar · generated name · no linked accounts",
		);
		expect(
			joinGuardSignals(
				{ ...entry, defaultAvatar: false, generatedName: false, linkedAccounts: 2 },
				text,
			),
		).toBe("2 linked accounts");
	});

	it("says who or what decided a row", () => {
		expect(
			joinGuardDecision({ ...entry, resolution: "Checkpoint", status: "Verified" }, text),
		).toBe("Verified at the checkpoint");
		expect(joinGuardDecision({ ...entry, resolution: "Timeout", status: "Kicked" }, text)).toBe(
			"Kicked after the timeout",
		);
		expect(joinGuardDecision({ ...entry, resolution: "Rule", status: "Banned" }, text)).toBe(
			"Banned by the rule",
		);
		expect(
			joinGuardDecision(
				{
					...entry,
					moderator: {
						avatarUrl: null,
						displayName: "Stella",
						id: "1",
						username: "stella",
					},
					resolution: "Moderator",
					status: "Kicked",
				},
				text,
			),
		).toBe("Kicked by Stella");
		expect(joinGuardDecision({ ...entry, status: "Left" }, text)).toBe("Left");
	});

	it("says how old an account is in its largest unit", () => {
		const now = Date.UTC(2026, 10, 5);
		expect(formatJoinGuardAgo(now - 5 * DAY * 1000, now, "en")).toBe("5 days ago");
		expect(formatJoinGuardAgo(now - 12 * 3600 * 1000, now, "en")).toBe("12 hours ago");
		expect(formatJoinGuardAgo(now - 30 * 1000, now, "en")).toBe("1 minute ago");
	});
});

describe("the messages of the refusals", () => {
	it("words every failure the bot knows, and one for the rest", () => {
		expect(text.ts(joinGuardFailureKey("MissingPermissions"))).toContain("permission");
		expect(joinGuardFailureKey("SomethingNew")).toBe(
			"guild_settings.joinguard.failures.unknown",
		);
		expect(joinGuardFailureKey("toString")).toBe("guild_settings.joinguard.failures.unknown");
	});

	it("words the route's refusals and the editor's problems alike", () => {
		expect(text.ts(joinGuardRuleErrorKey("limit"))).toContain("10 rules");
		expect(text.ts(joinGuardRuleErrorKey("name"))).toBe("Give the rule a name.");
		expect(text.ts(joinGuardRuleErrorKey("checkpointOff"))).toBe(
			"Turn the checkpoint on before sending members to it.",
		);
	});
});
