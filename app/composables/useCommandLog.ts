import type { CommandLogEntry } from "#shared/types/command-log";
import type { MaybeRefOrGetter } from "vue";

interface CommandLogResponse {
	entries: CommandLogEntry[];
	total: number;
}

export function useCommandLog({
	guildId,
	immediate,
	limit,
	offset,
	filters,
}: {
	guildId: MaybeRefOrGetter<string>;
	immediate?: boolean;
	limit?: MaybeRefOrGetter<number>;
	offset?: MaybeRefOrGetter<number>;
	filters?: MaybeRefOrGetter<{
		userId?: string;
		commandName?: string;
		success?: "all" | "success" | "failure";
		from?: string;
		to?: string;
		q?: string;
	}>;
}) {
	const resolvedLimit = computed(() => (limit !== undefined ? toValue(limit) : undefined));
	const resolvedOffset = computed(() => (offset !== undefined ? toValue(offset) : undefined));
	const resolvedFilters = computed(() => (filters !== undefined ? toValue(filters) : undefined));

	const asyncData = useLazyAsyncData(
		() =>
			`guild:${toValue(guildId)}:logs:commands:${resolvedLimit.value ?? "default"}:${resolvedOffset.value ?? 0}:${JSON.stringify(resolvedFilters.value || {})}`,
		() => {
			const query: Record<string, string | number> = {};
			if (resolvedLimit.value !== undefined) query.limit = resolvedLimit.value;
			if (resolvedOffset.value !== undefined) query.offset = resolvedOffset.value;
			const f = resolvedFilters.value;
			if (f) {
				if (f.userId) query.userId = f.userId;
				if (f.commandName) query.commandName = f.commandName;
				if (f.success) query.success = f.success;
				if (f.from) query.from = f.from;
				if (f.to) query.to = f.to;
				if (f.q) query.q = f.q;
			}
			return $fetch<CommandLogResponse>(`/api/guilds/${toValue(guildId)}/logs/commands`, {
				query,
			});
		},
		{
			immediate: immediate !== false,
			watch: [resolvedLimit, resolvedOffset, resolvedFilters],
			getCachedData: (key, nuxt, { cause }) => {
				if (cause === "refresh:manual" || cause === "refresh:hook") return undefined;
				return (nuxt.isHydrating ? nuxt.payload.data[key] : nuxt.static.data[key]) as
					| CommandLogResponse
					| undefined;
			},
		},
	);

	const entries = computed(() => asyncData.data.value?.entries ?? []);
	const total = computed(() => asyncData.data.value?.total ?? 0);

	return {
		...asyncData,
		entries,
		total,
	};
}
