import type { MaybeRefOrGetter } from "vue";

/** What the rule routes answer with when they refuse a request. */
export type JoinGuardRuleErrorCode =
	| JoinGuardRuleProblem
	| "limit"
	| "nameTaken"
	| "unknown"
	| "invalid"
	| "generic";

export type JoinGuardRuleResult<Value = void> =
	| { ok: true; value: Value }
	| { ok: false; code: JoinGuardRuleErrorCode };

const KNOWN_ERROR_CODES = new Set<string>([
	"limit",
	"nameTaken",
	"unknown",
	"invalid",
	"name",
	"conditions",
	"accountAge",
	"nameContains",
	"actions",
	"hardActionConflict",
	"checkpointOff",
]);

function readErrorCode(error: unknown): JoinGuardRuleErrorCode {
	const code = readJoinGuardRouteCode(error);
	return code !== null && KNOWN_ERROR_CODES.has(code)
		? (code as JoinGuardRuleErrorCode)
		: "generic";
}

/**
 * The join guard rules of a guild, and the calls that change them.
 *
 * Rules are rows of their own rather than keys of `GuildData`, so they do not
 * go through the staged-changes bar: each call writes at once and reports
 * whether it went through, and the list is patched with what the server
 * answered instead of being fetched again, as the auto-moderation rules are.
 */
export function useJoinGuardRules(guildId: MaybeRefOrGetter<string | null | undefined>) {
	const id = computed(() => toValue(guildId) ?? null);
	const base = computed(() => `/api/guilds/${id.value}/joinguard/rules`);

	const asyncData = usePersistedAsyncData(
		() => `guild:${id.value ?? "none"}:joinguard:rules`,
		async (): Promise<JoinGuardRule[]> => {
			if (!id.value) return [];
			const response = await $fetch<JoinGuardRulesResponse>(base.value);
			return response.rules;
		},
		{
			default: (): JoinGuardRule[] => [],
			watch: [id],
		},
	);

	const rules = computed(() => asyncData.data.value ?? []);

	async function run<Value>(request: () => Promise<Value>): Promise<JoinGuardRuleResult<Value>> {
		try {
			return { ok: true, value: await request() };
		} catch (error) {
			return { ok: false, code: readErrorCode(error) };
		}
	}

	/**
	 * Patches the list with a write's answer, unless another guild was opened
	 * while the request was in flight: the answer would land in its list.
	 */
	function patchRules(
		requestGuildId: string | null,
		patch: (current: JoinGuardRule[]) => JoinGuardRule[],
	) {
		if (id.value === requestGuildId) {
			asyncData.data.value = patch(rules.value);
		}
	}

	async function createRule(body: JoinGuardRuleInput) {
		const requestGuildId = id.value;
		const result = await run(() => $fetch<JoinGuardRule>(base.value, { body, method: "POST" }));
		if (result.ok) {
			patchRules(requestGuildId, (current) => [...current, result.value]);
		}
		return result;
	}

	async function updateRule(ruleId: string, body: Partial<JoinGuardRuleInput>) {
		const requestGuildId = id.value;
		const result = await run(() =>
			$fetch<JoinGuardRule>(`${base.value}/${ruleId}`, { body, method: "PATCH" }),
		);
		if (result.ok) {
			patchRules(requestGuildId, (current) =>
				current.map((rule) => (rule.id === ruleId ? result.value : rule)),
			);
		}
		return result;
	}

	async function deleteRule(ruleId: string): Promise<JoinGuardRuleResult> {
		const requestGuildId = id.value;
		const result = await run(() =>
			$fetch<null>(`${base.value}/${ruleId}`, { method: "DELETE" }),
		);
		// A rule that is already gone is as deleted as one this call removed.
		if (result.ok || result.code === "unknown") {
			patchRules(requestGuildId, (current) => current.filter((rule) => rule.id !== ruleId));
			return { ok: true, value: undefined };
		}
		return result;
	}

	return {
		createRule,
		deleteRule,
		error: asyncData.error,
		refresh: asyncData.refresh,
		rules,
		status: asyncData.status,
		updateRule,
	};
}
