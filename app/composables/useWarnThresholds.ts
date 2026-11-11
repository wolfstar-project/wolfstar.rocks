import type { WarnThreshold, WarnThresholdData } from "#shared/utils/warn-thresholds";
import type { MaybeRefOrGetter } from "vue";

/** What the routes answer with when they refuse a request. */
export type WarnThresholdErrorCode = "limit" | "unknown" | "invalid" | "generic";

export type WarnThresholdResult<Value = void> =
	| { ok: true; value: Value }
	| { ok: false; code: WarnThresholdErrorCode };

const KNOWN_ERROR_CODES = new Set<string>(["limit", "unknown", "invalid"]);

function readErrorCode(error: unknown): WarnThresholdErrorCode {
	// The routes put their code in the `data` of the error they throw, which
	// ofetch exposes as the `data.data` of the `FetchError`.
	const code = (error as { data?: { data?: { code?: unknown } } } | null)?.data?.data?.code;
	return typeof code === "string" && KNOWN_ERROR_CODES.has(code)
		? (code as WarnThresholdErrorCode)
		: "generic";
}

function byCount(a: WarnThreshold, b: WarnThreshold): number {
	return a.count - b.count;
}

/**
 * The warning thresholds of a guild, and the calls that change them. Like the
 * automatic channels, they are rows of their own rather than keys of
 * `GuildData`: each call writes at once, reports whether it went through, and
 * patches the list with what the server answered.
 */
export function useWarnThresholds(guildId: MaybeRefOrGetter<string | null | undefined>) {
	const id = computed(() => toValue(guildId) ?? null);
	const base = computed(() => `/api/guilds/${id.value}/warn-thresholds`);

	const asyncData = usePersistedAsyncData(
		() => `guild:${id.value ?? "none"}:warn-thresholds`,
		() =>
			id.value ? $fetch<WarnThreshold[]>(base.value) : Promise.resolve<WarnThreshold[]>([]),
		{
			default: (): WarnThreshold[] => [],
			watch: [id],
		},
	);

	const thresholds = computed<WarnThreshold[]>(() => asyncData.data.value ?? []);

	async function run<Value>(request: () => Promise<Value>): Promise<WarnThresholdResult<Value>> {
		try {
			return { ok: true, value: await request() };
		} catch (error) {
			return { code: readErrorCode(error), ok: false };
		}
	}

	/**
	 * Patches the list, unless the admin opened another guild meanwhile, then
	 * reads it again: a read that started before the write, such as the one
	 * that refreshes cached rows, would otherwise land after it with the old
	 * rows. A new read cancels the one in flight.
	 */
	function patch(
		requestGuildId: string | null,
		change: (current: WarnThreshold[]) => WarnThreshold[],
	) {
		if (id.value !== requestGuildId) return;
		const patched = change(thresholds.value).toSorted(byCount);
		asyncData.data.value = patched;
		void rereadAfterWrite(requestGuildId, patched);
	}

	/**
	 * A failed read empties the list (Nuxt sets it back to its default), which
	 * would hide a write that went through: the patched rows are put back.
	 */
	async function rereadAfterWrite(requestGuildId: string | null, patched: WarnThreshold[]) {
		await asyncData.refresh();
		if (asyncData.error.value && id.value === requestGuildId) {
			asyncData.data.value = patched;
			asyncData.error.value = undefined;
		}
	}

	/** Sets the threshold of a number of warnings: a new one, or the one the number has. */
	async function setThreshold(
		count: number,
		body: WarnThresholdData,
	): Promise<WarnThresholdResult<WarnThreshold>> {
		const requestGuildId = id.value;
		const result = await run(() =>
			$fetch<WarnThreshold, string, "PUT">(`${base.value}/${count}`, { body, method: "PUT" }),
		);
		if (result.ok) {
			patch(requestGuildId, (current) => [
				...current.filter((threshold) => threshold.count !== count),
				result.value,
			]);
		}
		return result;
	}

	/** Removes the threshold of a number of warnings. One that is already gone is as removed. */
	async function removeThreshold(count: number): Promise<WarnThresholdResult> {
		const requestGuildId = id.value;
		const result = await run(() =>
			$fetch<null>(`${base.value}/${count}`, { method: "DELETE" }),
		);
		if (result.ok || result.code === "unknown") {
			patch(requestGuildId, (current) =>
				current.filter((threshold) => threshold.count !== count),
			);
		}
		return result.ok || result.code === "unknown" ? { ok: true, value: undefined } : result;
	}

	return {
		error: asyncData.error,
		refresh: asyncData.refresh,
		removeThreshold,
		setThreshold,
		status: asyncData.status,
		thresholds,
	};
}
