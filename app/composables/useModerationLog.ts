import type { ModerationLogEntry } from "#shared/types/moderation-log";
import type { ModerationCaseStatus } from "#shared/types/moderation-types";
import type { MaybeRefOrGetter } from "vue";

interface ModerationLogResponse {
	entries: ModerationLogEntry[];
	total: number;
}

export function useModerationLog({
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
	filters?: MaybeRefOrGetter<{
		userId?: string;
		moderatorId?: string;
		typeCode?: number;
		status?: ModerationCaseStatus;
		from?: string;
		to?: string;
		q?: string;
	}>;
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
			`guild:${toValue(guildId)}:logs:moderation:${resolvedLimit.value ?? "default"}:${resolvedOffset.value ?? 0}:${JSON.stringify(resolvedFilters.value || {})}`,
		() => {
			// Without a guild there is nothing to ask for, and no URL to ask it at.
			const id = toValue(guildId);
			if (!id) return Promise.resolve<ModerationLogResponse>({ entries: [], total: 0 });
			const query: Record<string, string | number> = {};
			if (resolvedLimit.value !== undefined) query.limit = resolvedLimit.value;
			if (resolvedOffset.value !== undefined) query.offset = resolvedOffset.value;
			const f = resolvedFilters.value;
			if (f) {
				if (f.userId) query.userId = f.userId;
				if (f.moderatorId) query.moderatorId = f.moderatorId;
				if (f.typeCode !== undefined) query.typeCode = f.typeCode;
				if (f.status) query.status = f.status;
				if (f.from) query.from = f.from;
				if (f.to) query.to = f.to;
				if (f.q) query.q = f.q;
			}
			return $fetch<ModerationLogResponse>(`/api/guilds/${id}/logs/moderation`, { query });
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
