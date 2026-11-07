import type { FlattenedMember } from "#shared/types/discord";
import { MEMBER_SEARCH_LIMIT } from "#shared/schemas/member-search";

/**
 * The members of a guild whose name matches `query`, searched as the admin
 * types. Nothing is asked for an empty query; a slower answer to an older query
 * never replaces a newer one.
 */
export function useGuildMemberSearch(
	guildId: MaybeRefOrGetter<string | null>,
	query: MaybeRefOrGetter<string>,
) {
	const debounced = refDebounced(
		computed(() => toValue(query).trim()),
		300,
	);
	const results = ref<FlattenedMember[]>([]);
	const pending = ref(false);
	let latest = 0;

	watch(
		[debounced, () => toValue(guildId)],
		async ([value, id]) => {
			const request = ++latest;
			if (!id || value.length === 0) {
				results.value = [];
				pending.value = false;
				return;
			}
			pending.value = true;
			const found = await $fetch<FlattenedMember[]>(`/api/guilds/${id}/members/search`, {
				query: { query: value },
			}).catch(() => []);
			if (request !== latest) return;
			results.value = found;
			pending.value = false;
		},
		{ immediate: true },
	);

	return { results: computed(() => results.value), pending: readonly(pending) };
}

/** The picked members of a guild still in it, by id; the others are left out. */
export async function resolveGuildMembers(
	guildId: string,
	ids: readonly string[],
): Promise<FlattenedMember[]> {
	const found: FlattenedMember[] = [];
	// The route resolves at most MEMBER_SEARCH_LIMIT ids a call.
	for (let start = 0; start < ids.length; start += MEMBER_SEARCH_LIMIT) {
		const chunk = ids.slice(start, start + MEMBER_SEARCH_LIMIT);
		found.push(
			...(await $fetch<FlattenedMember[]>(`/api/guilds/${guildId}/members/search`, {
				query: { ids: chunk.join(",") },
			})),
		);
	}
	return found;
}
