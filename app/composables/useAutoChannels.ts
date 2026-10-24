import type {
	AutoDelete,
	AutoDeleteData,
	AutoMessage,
	AutoMessageData,
	AutoPurge,
	AutoPurgeData,
} from "#shared/utils/auto-channels";
import type { MaybeRefOrGetter } from "vue";

/** The tables of the channels the bot works in on its own, by the slug of their routes. */
export interface AutoChannelTables {
	autodelete: { row: AutoDelete; data: AutoDeleteData };
	automessage: { row: AutoMessage; data: AutoMessageData };
	autopurge: { row: AutoPurge; data: AutoPurgeData };
}

export type AutoChannelSlug = keyof AutoChannelTables;

/** What the routes answer with when they refuse a request. */
export type AutoChannelErrorCode = "channel" | "limit" | "unknown" | "invalid" | "generic";

export type AutoChannelResult<Value = void> =
	| { ok: true; value: Value }
	| { ok: false; code: AutoChannelErrorCode };

const KNOWN_ERROR_CODES = new Set<string>(["channel", "limit", "unknown", "invalid"]);

function readErrorCode(error: unknown): AutoChannelErrorCode {
	// The routes put their code in the `data` of the error they throw, which
	// ofetch exposes as the `data.data` of the `FetchError`.
	const code = (error as { data?: { data?: { code?: unknown } } } | null)?.data?.data?.code;
	return typeof code === "string" && KNOWN_ERROR_CODES.has(code)
		? (code as AutoChannelErrorCode)
		: "generic";
}

/**
 * The rows of one of the automatic channel tables of a guild (Auto-Delete,
 * Auto-Purge or Auto-Message), and the calls that change them.
 *
 * Like the auto-moderation rules, they are rows of their own rather than keys
 * of `GuildData`: each call writes at once, reports whether it went through,
 * and patches the list with what the server answered.
 */
export function useAutoChannels<Slug extends AutoChannelSlug>(
	slug: Slug,
	guildId: MaybeRefOrGetter<string | null | undefined>,
) {
	type Row = AutoChannelTables[Slug]["row"];
	type Data = AutoChannelTables[Slug]["data"];

	const id = computed(() => toValue(guildId) ?? null);
	const base = computed(() => `/api/guilds/${id.value}/${slug}`);

	const asyncData = usePersistedAsyncData(
		() => `guild:${id.value ?? "none"}:${slug}`,
		() => (id.value ? $fetch<Row[]>(base.value) : Promise.resolve<Row[]>([])),
		{
			default: (): Row[] => [],
			watch: [id],
		},
	);

	const rows = computed<Row[]>(() => asyncData.data.value ?? []);

	async function run<Value>(request: () => Promise<Value>): Promise<AutoChannelResult<Value>> {
		try {
			return { ok: true, value: await request() };
		} catch (error) {
			return { code: readErrorCode(error), ok: false };
		}
	}

	/** Patches the list, unless the admin opened another guild meanwhile. */
	function patchRows(requestGuildId: string | null, patch: (current: Row[]) => Row[]) {
		if (id.value === requestGuildId) {
			asyncData.data.value = patch(rows.value);
		}
	}

	/** Sets the row of a channel: a new one, or the one the channel has. */
	async function setRow(channelId: string, body: Data): Promise<AutoChannelResult<Row>> {
		const requestGuildId = id.value;
		const result = await run(() =>
			$fetch<Row>(`${base.value}/${channelId}`, { body, method: "PUT" }),
		);
		if (result.ok) {
			patchRows(requestGuildId, (current) =>
				current.some((row) => row.channelId === channelId)
					? current.map((row) => (row.channelId === channelId ? result.value : row))
					: [...current, result.value],
			);
		}
		return result;
	}

	/** Clears the row of a channel. One that is already gone is as cleared. */
	async function clearRow(channelId: string): Promise<AutoChannelResult> {
		const requestGuildId = id.value;
		const result = await run(() =>
			$fetch<null>(`${base.value}/${channelId}`, { method: "DELETE" }),
		);
		if (result.ok || result.code === "unknown") {
			patchRows(requestGuildId, (current) =>
				current.filter((row) => row.channelId !== channelId),
			);
		}
		return result.ok ? { ok: true, value: undefined } : result;
	}

	return {
		clearRow,
		error: asyncData.error,
		refresh: asyncData.refresh,
		rows,
		setRow,
		status: asyncData.status,
	};
}
