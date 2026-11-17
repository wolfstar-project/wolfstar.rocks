import type { SocialTargetSuggestion } from "#shared/utils/social";
import type { MaybeRefOrGetter } from "vue";
import type { SocialSource } from "~/utils/social";

/** Staryl answers nothing for less, so the dialog does not ask. */
const MINIMUM_QUERY_LENGTH = 2;

/**
 * The accounts of `source` that match `query`, searched through Staryl as the
 * admin types the target of the add dialog. Nothing is asked for a short query
 * or without a source. A slower answer to an older query never replaces a
 * newer one, and a failed search suggests nothing: the target can still be
 * typed in full.
 */
export function useSocialTargetSearch(
	guildId: MaybeRefOrGetter<string | null | undefined>,
	source: MaybeRefOrGetter<SocialSource | null>,
	query: MaybeRefOrGetter<string>,
) {
	const debounced = refDebounced(
		computed(() => toValue(query).trim()),
		300,
	);
	const suggestions = ref<SocialTargetSuggestion[]>([]);
	let latest = 0;

	watch(
		[debounced, () => toValue(source), () => toValue(guildId)],
		async ([value, currentSource, id]) => {
			const request = ++latest;
			if (!id || currentSource === null || value.length < MINIMUM_QUERY_LENGTH) {
				suggestions.value = [];
				return;
			}
			const found = await $fetch<{ suggestions: SocialTargetSuggestion[] }>(
				`/api/guilds/${id}/social/targets`,
				{ query: { query: value, source: currentSource } },
			).then(
				(answer) => answer.suggestions,
				// A failed search is no reason to interrupt the admin, who can type the target.
				() => [],
			);
			if (request !== latest) return;
			suggestions.value = found;
		},
		{ immediate: true },
	);

	return { suggestions: computed(() => suggestions.value) };
}
