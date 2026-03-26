import type { GuildData } from "#server/database";
import type { Options as DeepMergeOptions } from "deepmerge";
import { useRouteParams } from "@vueuse/router";
import deepMerge from "deepmerge";

// Overwrite arrays when merging
const mergeOptions: DeepMergeOptions = {
	arrayMerge: (_, sourceArray) => sourceArray,
};

export function useGuildSettingsChanges() {
	const guildId = useRouteParams("id", null, { transform: String });
	const log = useLogger("guild:settings:changes");

	// Use guild-scoped state key
	const guildSettingsChanges = useState<GuildData | undefined>(
		`guild:${guildId.value}:settings:changes`,
		() => undefined,
	);
	const resetCounter = useState<number>(`guild:${guildId.value}:settings:resetCounter`, () => 0);

	const mergeGuildSettings = (changes?: Partial<GuildData>) => {
		if (!changes) {
			guildSettingsChanges.value = undefined;
			return;
		}

		guildSettingsChanges.value = deepMerge<GuildData, Partial<GuildData>>(
			guildSettingsChanges.value ?? ({} as GuildData),
			changes,
			mergeOptions,
		);
		log.info({ action: "merge_settings", guildId: guildId.value, keys: Object.keys(changes) });
	};

	const setGuildSettingsChanges = (changes?: Partial<GuildData>) => {
		mergeGuildSettings(changes);
	};

	const removeChange = (key: keyof GuildData) => {
		if (!guildSettingsChanges.value) {
			return;
		}

		const current = { ...guildSettingsChanges.value };
		delete current[key];

		// If no changes remain, set to undefined
		if (Object.keys(current).length === 0) {
			guildSettingsChanges.value = undefined;
		} else {
			guildSettingsChanges.value = current as GuildData;
		}
		log.info({ action: "remove_change", guildId: guildId.value, key });
	};

	const resetGuildSettingsChanges = () => {
		guildSettingsChanges.value = undefined;
		resetCounter.value += 1;
		log.info({ action: "reset_changes", guildId: guildId.value });
	};

	return {
		guildSettingsChanges: readonly(guildSettingsChanges),
		mergeGuildSettings,
		removeChange,
		resetCounter: readonly(resetCounter),
		resetGuildSettingsChanges,
		setGuildSettingsChanges,
	};
}
