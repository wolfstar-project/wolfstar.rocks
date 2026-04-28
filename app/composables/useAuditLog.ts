import type { DashboardAuditEntry } from "#shared/types/audit-log";
import type { MaybeRefOrGetter } from "vue";

interface AuditLogResponse {
	entries: DashboardAuditEntry[];
	total: number;
}

export function useAuditLog({
	guildId,
	immediate,
	limit,
	offset,
}: {
	guildId: MaybeRefOrGetter<string>;
	immediate?: boolean;
	limit?: MaybeRefOrGetter<number>;
	offset?: MaybeRefOrGetter<number>;
}) {
	const resolvedLimit = computed(() => (limit !== undefined ? toValue(limit) : undefined));
	const resolvedOffset = computed(() => (offset !== undefined ? toValue(offset) : undefined));

	const asyncData = useLazyAsyncData(
		() => `guild:${toValue(guildId)}:audit-logs`,
		() => {
			const query: Record<string, number> = {};
			if (resolvedLimit.value !== undefined) query.limit = resolvedLimit.value;
			if (resolvedOffset.value !== undefined) query.offset = resolvedOffset.value;
			return $fetch<AuditLogResponse>(`/api/guilds/${toValue(guildId)}/audit-logs`, {
				query,
			});
		},
		{
			immediate: immediate !== false,
			watch: [resolvedLimit, resolvedOffset],
			getCachedData: (key, nuxt, { cause }) => {
				if (cause === "refresh:manual" || cause === "refresh:hook" || cause === "watch")
					return undefined;
				return (nuxt.isHydrating ? nuxt.payload.data[key] : nuxt.static.data[key]) as
					| AuditLogResponse
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
