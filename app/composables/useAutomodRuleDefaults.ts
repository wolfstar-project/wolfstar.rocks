import type { MaybeRefOrGetter } from "vue";
import type { AutomodRuleDefaults } from "~/utils/automod-rule-draft";

const STORAGE_KEY = "wolfstar-automod-defaults";

/**
 * The defaults new auto-moderation rules start from, per guild.
 *
 * The bot has no column for them, so they are kept in this browser: they shape
 * the form a new rule opens with and are never written anywhere else.
 */
export function useAutomodRuleDefaults(guildId: MaybeRefOrGetter<string | null | undefined>) {
	const stored = useLocalStorage<Record<string, AutomodRuleDefaults>>(STORAGE_KEY, {});

	const defaults = computed<AutomodRuleDefaults | undefined>(() => {
		const id = toValue(guildId);
		return id ? stored.value[id] : undefined;
	});

	function save(patch: AutomodRuleDefaults) {
		const id = toValue(guildId);
		if (!id) return;
		stored.value = { ...stored.value, [id]: { ...stored.value[id], ...patch } };
	}

	return { defaults, save };
}
