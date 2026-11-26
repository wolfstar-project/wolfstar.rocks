import type { OnboardingState } from "#shared/utils/onboarding";
import type { MaybeRefOrGetter } from "vue";

/**
 * The onboarding of a guild: its stages, its log channel, this week's counts
 * and what is blocked.
 *
 * The stages are rows of their own rather than keys of `GuildData`, so they do
 * not go through the staged-changes bar. The server answers every read and
 * every write with the whole configuration, and the page shows that answer.
 */
export function useOnboarding(guildId: MaybeRefOrGetter<string | null | undefined>) {
	const id = computed(() => toValue(guildId) ?? null);
	const base = computed(() => `/api/guilds/${id.value}/onboarding`);

	const asyncData = usePersistedAsyncData(
		() => `guild:${id.value ?? "none"}:onboarding`,
		async (): Promise<OnboardingState | null> => {
			if (!id.value) return null;
			return $fetch<OnboardingState>(base.value);
		},
		{
			default: (): OnboardingState | null => null,
			watch: [id],
		},
	);

	const state = computed(() => asyncData.data.value ?? null);

	return {
		error: asyncData.error,
		refresh: asyncData.refresh,
		state,
		status: asyncData.status,
	};
}
