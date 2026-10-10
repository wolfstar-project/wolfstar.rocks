import type {
	AutoModerationRule,
	AutoModerationRuleData,
	AutoModerationRuleType,
} from "#shared/utils/automod-rules";
import type { MaybeRefOrGetter } from "vue";

/** What the rule routes answer with when they refuse a request. */
export type AutomodRuleErrorCode =
	| "limit"
	| "nameTaken"
	| "nameInvalid"
	| "unknown"
	| "invalid"
	| "generic";

export type AutomodRuleResult<Value = void> =
	| { ok: true; value: Value }
	| { ok: false; code: AutomodRuleErrorCode };

export type AutomodRuleCreate = Partial<Omit<AutoModerationRuleData, "name" | "type">> & {
	name: string;
	type: AutoModerationRuleType;
};
export type AutomodRuleUpdate = Partial<Omit<AutoModerationRuleData, "type">>;

const KNOWN_ERROR_CODES = new Set<string>([
	"limit",
	"nameTaken",
	"nameInvalid",
	"unknown",
	"invalid",
]);

function readErrorCode(error: unknown): AutomodRuleErrorCode {
	// The routes put their code in the `data` of the error they throw, which
	// ofetch exposes as the `data.data` of the `FetchError`.
	const data = (error as { data?: { data?: { code?: unknown } } } | null)?.data?.data;
	const code = data?.code;
	return typeof code === "string" && KNOWN_ERROR_CODES.has(code)
		? (code as AutomodRuleErrorCode)
		: "generic";
}

/**
 * The auto-moderation rules of a guild, and the calls that change them.
 *
 * Rules are rows of their own rather than keys of `GuildData`, so they do not
 * go through the staged-changes bar: each call writes at once and reports
 * whether it went through, and the list is patched with what the server
 * answered instead of being fetched again.
 */
export function useAutomodRules(guildId: MaybeRefOrGetter<string | null | undefined>) {
	const id = computed(() => toValue(guildId) ?? null);
	const base = computed(() => `/api/guilds/${id.value}/automod/rules`);

	const asyncData = useLazyAsyncData(
		() => `guild:${id.value ?? "none"}:automod:rules`,
		() => (id.value ? $fetch<AutoModerationRule[]>(base.value) : Promise.resolve([])),
		{
			default: (): AutoModerationRule[] => [],
			server: false,
			watch: [id],
		},
	);

	const rules = computed(() => asyncData.data.value ?? []);

	async function run<Value>(request: () => Promise<Value>): Promise<AutomodRuleResult<Value>> {
		try {
			return { ok: true, value: await request() };
		} catch (error) {
			return { ok: false, code: readErrorCode(error) };
		}
	}

	async function createRule(body: AutomodRuleCreate) {
		const result = await run(() =>
			$fetch<AutoModerationRule>(base.value, { body, method: "POST" }),
		);
		if (result.ok) {
			asyncData.data.value = [...rules.value, result.value];
		}
		return result;
	}

	async function updateRule(ruleId: string, body: AutomodRuleUpdate) {
		const result = await run(() =>
			$fetch<AutoModerationRule>(`${base.value}/${ruleId}`, { body, method: "PATCH" }),
		);
		if (result.ok) {
			asyncData.data.value = rules.value.map((rule) =>
				rule.id === ruleId ? result.value : rule,
			);
		}
		return result;
	}

	async function deleteRule(ruleId: string) {
		const result = await run(() =>
			$fetch<null>(`${base.value}/${ruleId}`, { method: "DELETE" }),
		);
		// A rule that is already gone is as deleted as one this call removed.
		if (result.ok || result.code === "unknown") {
			asyncData.data.value = rules.value.filter((rule) => rule.id !== ruleId);
		}
		return result.ok ? ({ ok: true, value: undefined } as const) : result;
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
