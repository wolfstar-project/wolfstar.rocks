import type { MaybeRefOrGetter } from "vue";

/** Why a page or an appeal could not be had: the bot's refusals, `unavailable` when the bridge to it is off. */
export type MyAppealErrorCode = AppealSubmitError | "unavailable";

export type MyAppealResult<Value = void> =
	| { ok: true; value: Value }
	| { ok: false; code: MyAppealErrorCode };

const BASE = "/api/users/appeals";

/**
 * How often the list is read again while it is shown, and the shortest wait
 * between two reads: the route takes five reads in ten seconds from a member.
 */
const LIVE_INTERVAL = 60_000;
const LIVE_MIN_GAP = 15_000;

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
 * @param live Whether the list is shown, and so read again every minute while
 * the tab is visible and when it comes back: a decision of the staff, or the
 * end of a cooldown, shows without a reload. Only the page that lists the
 * cases asks for it, so the badge of the Home does not read it twice.
 */
export function useMyAppeals({
	guild,
	live = false,
}: { guild?: MaybeRefOrGetter<string | null | undefined>; live?: boolean } = {}) {
	const extra = computed(() => toValue(guild) ?? null);

	// Every read is counted, the async data's own too, so a read in the
	// background that a newer one overtook does not bring back older cards.
	let reads = 0;
	const readList = () => {
		reads += 1;
		return $fetch<MyAppealsResponse>(BASE, {
			query: extra.value ? { guild: extra.value } : {},
		});
	};

	const asyncData = usePersistedAsyncData(() => `me:appeals:${extra.value ?? "none"}`, readList, {
		watch: [extra],
	});

	if (live && import.meta.client) {
		const visibility = useDocumentVisibility();
		let lastRead = Date.now();
		const readAgain = async () => {
			if (visibility.value !== "visible" || asyncData.status.value === "pending") return;
			if (Date.now() - lastRead < LIVE_MIN_GAP) return;
			lastRead = Date.now();
			// Nothing is shown but the failure: `refresh()` clears it when the read works.
			if (asyncData.status.value === "error") {
				await asyncData.refresh();
				return;
			}
			// Not `refresh()` otherwise: a failed read clears the data of an async
			// data, and a network blip or a rate limit would swap the cases for an
			// error. This one keeps what is shown when it fails, and the next one
			// tries again.
			try {
				const answer = readList();
				const read = reads;
				const list = await answer;
				if (read === reads) asyncData.data.value = list;
			} catch {
				// Kept as it is.
			}
		};
		useIntervalFn(() => void readAgain(), LIVE_INTERVAL);
		watch(visibility, (state) => {
			if (state === "visible") void readAgain();
		});
	}

	const entries = computed(() => asyncData.data.value?.entries ?? []);
	/** The list was read once: a later read keeps it shown while it runs. */
	const loaded = computed(() => asyncData.data.value != null);
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
		loaded,
		openCount,
		refresh: asyncData.refresh,
		status: asyncData.status,
		submit,
	};
}
