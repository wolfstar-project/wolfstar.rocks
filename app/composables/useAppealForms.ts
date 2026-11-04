import type { AppealForm, AppealFormData } from "#shared/utils/appeal-forms";
import type { MaybeRefOrGetter } from "vue";

/** What the appeal form routes answer with when they refuse a request. */
export type AppealFormErrorCode =
	| "limit"
	| "nameTaken"
	| "nameInvalid"
	| "unknown"
	| "invalid"
	| "generic";

export type AppealFormResult<Value = void> =
	| { ok: true; value: Value }
	| { ok: false; code: AppealFormErrorCode };

export type AppealFormCreate = Partial<Omit<AppealFormData, "name">> & { name: string };
export type AppealFormUpdate = Partial<AppealFormData>;

const KNOWN_ERROR_CODES = new Set<string>([
	"limit",
	"nameTaken",
	"nameInvalid",
	"unknown",
	"invalid",
]);

function readErrorCode(error: unknown): AppealFormErrorCode {
	// The routes put their code in the `data` of the error they throw, which
	// ofetch exposes as the `data.data` of the `FetchError`.
	const data = (error as { data?: { data?: { code?: unknown } } } | null)?.data?.data;
	const code = data?.code;
	return typeof code === "string" && KNOWN_ERROR_CODES.has(code)
		? (code as AppealFormErrorCode)
		: "generic";
}

/**
 * The appeal forms of a guild, and the calls that change them.
 *
 * Forms are rows of their own rather than keys of `GuildData`, so they do not
 * go through the staged-changes bar: each call writes at once and reports
 * whether it went through, and the list is patched with what the server
 * answered instead of being fetched again.
 */
export function useAppealForms(guildId: MaybeRefOrGetter<string | null | undefined>) {
	const id = computed(() => toValue(guildId) ?? null);
	const base = computed(() => `/api/guilds/${id.value}/appeals/forms`);

	const asyncData = usePersistedAsyncData(
		() => `guild:${id.value ?? "none"}:appeals:forms`,
		() => (id.value ? $fetch<AppealForm[]>(base.value) : Promise.resolve([])),
		{
			default: (): AppealForm[] => [],
			watch: [id],
		},
	);

	const forms = computed(() => asyncData.data.value ?? []);

	async function run<Value>(request: () => Promise<Value>): Promise<AppealFormResult<Value>> {
		try {
			return { ok: true, value: await request() };
		} catch (error) {
			return { ok: false, code: readErrorCode(error) };
		}
	}

	/**
	 * Patches the list with a write's answer, unless the admin opened another
	 * guild while the request was in flight: `forms` follows the active guild,
	 * so the answer would land in that guild's list.
	 */
	function patchForms(
		requestGuildId: string | null,
		patch: (current: AppealForm[]) => AppealForm[],
	) {
		if (id.value === requestGuildId) {
			asyncData.data.value = patch(forms.value);
		}
	}

	async function createForm(body: AppealFormCreate) {
		const requestGuildId = id.value;
		const result = await run(() => $fetch<AppealForm>(base.value, { body, method: "POST" }));
		if (result.ok) {
			patchForms(requestGuildId, (current) => [...current, result.value]);
		}
		return result;
	}

	async function updateForm(formId: string, body: AppealFormUpdate) {
		const requestGuildId = id.value;
		const result = await run(() =>
			$fetch<AppealForm>(`${base.value}/${formId}`, { body, method: "PATCH" }),
		);
		if (result.ok) {
			patchForms(requestGuildId, (current) =>
				current.map((form) => (form.id === formId ? result.value : form)),
			);
		}
		return result;
	}

	async function deleteForm(formId: string) {
		const requestGuildId = id.value;
		const result = await run(() =>
			$fetch<null>(`${base.value}/${formId}`, { method: "DELETE" }),
		);
		// A form that is already gone is as deleted as one this call removed.
		if (result.ok || result.code === "unknown") {
			patchForms(requestGuildId, (current) => current.filter((form) => form.id !== formId));
		}
		return result.ok ? ({ ok: true, value: undefined } as const) : result;
	}

	/** Puts the forms in the order of `ids`; the server answers with every form, in that order. */
	async function reorderForms(ids: string[]) {
		const requestGuildId = id.value;
		const result = await run(() =>
			$fetch<AppealForm[]>(`${base.value}/order`, { body: { ids }, method: "PUT" }),
		);
		if (result.ok) {
			patchForms(requestGuildId, () => result.value);
		}
		return result;
	}

	return {
		createForm,
		deleteForm,
		error: asyncData.error,
		forms,
		refresh: asyncData.refresh,
		reorderForms,
		status: asyncData.status,
		updateForm,
	};
}
