import type {
	AppealPage,
	AppealSubmissionAnswers,
	AppealSubmitError,
	MyAppealsResponse,
} from "#shared/utils/my-appeals";
import type { MaybeRefOrGetter } from "vue";
import { AppealSubmitErrors, BuiltInAppealFormPath } from "#shared/utils/my-appeals";

/** Why a page or an appeal could not be had: the bot's refusals, `unavailable` when the bridge to it is off. */
export type MyAppealErrorCode = AppealSubmitError | "unavailable";

export type MyAppealResult<Value = void> =
	| { ok: true; value: Value }
	| { ok: false; code: MyAppealErrorCode };

const BASE = "/api/users/appeals";

function readErrorCode(error: unknown): MyAppealErrorCode {
	const fetchError = error as {
		statusCode?: unknown;
		data?: { data?: { code?: unknown } };
	} | null;
	if (fetchError?.statusCode === 503) return "unavailable";
	// The routes put their code in the `data` of the error they throw, which
	// ofetch exposes as the `data.data` of the `FetchError`.
	const code = fetchError?.data?.data?.code;
	return typeof code === "string" && (AppealSubmitErrors as readonly string[]).includes(code)
		? (code as AppealSubmitError)
		: "generic";
}

async function attempt<Value>(request: () => Promise<Value>): Promise<MyAppealResult<Value>> {
	try {
		return { ok: true, value: await request() };
	} catch (error) {
		return { ok: false, code: readErrorCode(error) };
	}
}

/**
 * The member's own cases on the servers that use WolfStar, where each stands,
 * and the calls that read a server's page and send an appeal to it.
 *
 * The list comes from the dashboard's server; a page and an appeal go through
 * it to the bot, which decides what can be appealed and posts the appeal to the
 * staff. After an appeal is sent the list is read again.
 *
 * @param guild A server the member is not in, to list too: the one of the
 * bot's link, which a banned member follows.
 */
export function useMyAppeals({
	guild,
}: { guild?: MaybeRefOrGetter<string | null | undefined> } = {}) {
	const extra = computed(() => toValue(guild) ?? null);

	const asyncData = usePersistedAsyncData(
		() => `me:appeals:${extra.value ?? "none"}`,
		() =>
			$fetch<MyAppealsResponse>(BASE, {
				query: extra.value ? { guild: extra.value } : {},
			}),
		{ watch: [extra] },
	);

	const entries = computed(() => asyncData.data.value?.entries ?? []);
	const openCount = computed(() => asyncData.data.value?.openCount ?? 0);

	function loadPage(guildId: string) {
		return attempt(() => $fetch<AppealPage>(`${BASE}/${guildId}`));
	}

	async function submit(
		guildId: string,
		formId: string | null,
		caseId: number,
		answers: AppealSubmissionAnswers,
	): Promise<MyAppealResult> {
		const path = `${BASE}/${guildId}/${formId ?? BuiltInAppealFormPath}`;
		const result = await attempt(() =>
			$fetch(path, { method: "POST", body: { caseId, answers } }),
		);
		if (result.ok) await asyncData.refresh();
		return result.ok ? { ok: true, value: undefined } : result;
	}

	return {
		entries,
		error: asyncData.error,
		loadPage,
		openCount,
		refresh: asyncData.refresh,
		status: asyncData.status,
		submit,
	};
}
