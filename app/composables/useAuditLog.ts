import type { DashboardAuditEntry } from "#shared/types/audit-log";
import type { MaybeRefOrGetter } from "vue";

interface AuditLogResponse {
	entries: DashboardAuditEntry[];
	total: number;
}

interface AuditLogFilters {
	actorId?: string;
	from?: string;
	to?: string;
	q?: string;
}

export function useAuditLog({
	guildId,
	immediate,
	limit,
	offset,
	filters,
}: {
	guildId: MaybeRefOrGetter<string | undefined>;
	immediate?: boolean;
	limit?: MaybeRefOrGetter<number>;
	offset?: MaybeRefOrGetter<number>;
	filters?: MaybeRefOrGetter<AuditLogFilters>;
}) {
	const resolvedLimit = computed(() => (limit !== undefined ? toValue(limit) : undefined));
	const resolvedOffset = computed(() => (offset !== undefined ? toValue(offset) : undefined));
	// Nested filter mutations need a new object so Nuxt 4.5 invalidates useAsyncData.
	const resolvedFilters = computed(() => {
		const value = filters !== undefined ? toValue(filters) : undefined;
		return value ? { ...value } : undefined;
	});

	const asyncData = usePersistedAsyncData(
		() =>
			`guild:${toValue(guildId)}:logs:activity:${resolvedLimit.value ?? "default"}:${resolvedOffset.value ?? 0}:${JSON.stringify(resolvedFilters.value ?? {})}`,
		() => {
			// Without a guild there is nothing to ask for, and no URL to ask it at.
			const id = toValue(guildId);
			if (!id) return Promise.resolve<AuditLogResponse>({ entries: [], total: 0 });
			const query: Record<string, string | number> = {};
			if (resolvedLimit.value !== undefined) query.limit = resolvedLimit.value;
			if (resolvedOffset.value !== undefined) query.offset = resolvedOffset.value;
			const f = resolvedFilters.value;
			if (f) {
				if (f.actorId) query.actorId = f.actorId;
				if (f.from) query.from = f.from;
				if (f.to) query.to = f.to;
				if (f.q) query.q = f.q;
			}
			return $fetch<AuditLogResponse>(`/api/guilds/${id}/logs`, {
				query,
			});
		},
		{
			immediate: immediate !== false,
			watch: [resolvedLimit, resolvedOffset, resolvedFilters],
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
