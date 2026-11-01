import type { ReportListResponse, ReportStatus } from "#shared/types/report";
import type { MaybeRefOrGetter } from "vue";

/**
 * The member reports of a guild, newest first, optionally only those with one
 * status. The list follows the guild and the status as they change.
 */
export function useReports({
	guildId,
	status,
	limit,
}: {
	guildId: MaybeRefOrGetter<string | undefined>;
	status?: MaybeRefOrGetter<ReportStatus | undefined>;
	limit?: MaybeRefOrGetter<number>;
}) {
	const resolvedStatus = computed(() => (status === undefined ? undefined : toValue(status)));
	const resolvedLimit = computed(() => (limit === undefined ? undefined : toValue(limit)));

	const asyncData = usePersistedAsyncData(
		() =>
			`guild:${toValue(guildId)}:reports:${resolvedStatus.value ?? "all"}:${resolvedLimit.value ?? "default"}`,
		() => {
			const id = toValue(guildId);
			if (!id) return Promise.resolve<ReportListResponse>({ entries: [], total: 0 });
			const query: Record<string, string | number> = {};
			if (resolvedStatus.value) query.status = resolvedStatus.value;
			if (resolvedLimit.value !== undefined) query.limit = resolvedLimit.value;
			return $fetch<ReportListResponse>(`/api/guilds/${id}/reports`, { query });
		},
		{ watch: [resolvedStatus, resolvedLimit] },
	);

	const entries = computed(() => asyncData.data.value?.entries ?? []);
	const total = computed(() => asyncData.data.value?.total ?? 0);

	return { ...asyncData, entries, total };
}
