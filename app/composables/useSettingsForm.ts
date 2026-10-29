import type { GuildData } from "#server/database";
import type { ListSettingKey, SingleSettingKey, ToggleSettingKey } from "#shared/types";
import type { FormErrorEvent } from "@nuxt/ui";
import { buildSettingsFormSchema } from "#shared/schemas";
import { setGuildDataChange } from "#shared/utils/guild-settings-map";
import {
	SETTING_CHOICES,
	SETTING_NUMBER_RANGES,
	type ChoiceSettingKey,
	type NumberSettingKey,
} from "#shared/utils/settings-choices";

interface SettingsFormKeys<
	One extends SingleSettingKey,
	Many extends ListSettingKey,
	Toggle extends ToggleSettingKey,
	Count extends NumberSettingKey,
	Choice extends ChoiceSettingKey,
> {
	/** Settings that hold one channel or role, or nothing. */
	one?: readonly One[];
	/** Settings that hold a list of channels, roles or names. */
	many?: readonly Many[];
	/** Settings that are switched on or off. */
	toggles?: readonly Toggle[];
	/** Settings that hold a whole number. */
	numbers?: readonly Count[];
	/** Settings that hold one word of a fixed set. */
	choices?: readonly Choice[];
}

/**
 * State, schema and change mapping for a settings section whose controls each
 * edit one `GuildData` key as-is: a channel or role picker, a multi-picker, a
 * switch, a number or a choice between a few words.
 *
 * The state follows the saved settings (and whatever is staged on top of
 * them), so a reset or a save elsewhere is reflected without a reload, and
 * `mapToGuildData` hands `GuildSettingsForm` exactly the keys the section owns.
 */
export function useSettingsForm<
	One extends SingleSettingKey = never,
	Many extends ListSettingKey = never,
	Toggle extends ToggleSettingKey = never,
	Count extends NumberSettingKey = never,
	Choice extends ChoiceSettingKey = never,
>(keys: SettingsFormKeys<One, Many, Toggle, Count, Choice>) {
	type FormState = Pick<GuildData, One | Many | Toggle | Count | Choice>;

	const { ts } = useI18n();
	const toast = useToast();
	const { guildSettings } = useGuildSettings();

	const one = keys.one ?? [];
	const many = keys.many ?? [];
	const toggles = keys.toggles ?? [];
	const numbers = keys.numbers ?? [];
	const choices = keys.choices ?? [];

	function readState(): FormState {
		const settings = guildSettings.value;
		const values: Partial<GuildData> = {};
		for (const key of one) {
			setGuildDataChange(values, key, (settings?.[key] ?? null) as GuildData[One]);
		}
		for (const key of many) {
			setGuildDataChange(values, key, [...(settings?.[key] ?? [])] as GuildData[Many]);
		}
		for (const key of toggles) {
			setGuildDataChange(values, key, (settings?.[key] ?? false) as GuildData[Toggle]);
		}
		// The settings carry every key once loaded; the fallbacks only stand in
		// before that, and the form stages nothing from them.
		for (const key of numbers) {
			setGuildDataChange(
				values,
				key,
				(settings?.[key] ?? SETTING_NUMBER_RANGES[key].minimum) as GuildData[Count],
			);
		}
		for (const key of choices) {
			setGuildDataChange(
				values,
				key,
				(settings?.[key] ?? SETTING_CHOICES[key][0]) as GuildData[Choice],
			);
		}
		return values as FormState;
	}

	const state = reactive(readState()) as FormState;

	// The saved settings are merged with the staged draft, so they change on
	// every edit of this very form. Only the keys whose value really differs are
	// written back: assigning a fresh copy of an unchanged list would re-trigger
	// the form's own change tracking and loop.
	watch(
		guildSettings,
		() => {
			const next = readState();
			const changed: Partial<FormState> = {};
			for (const key of [...one, ...many, ...toggles, ...numbers, ...choices]) {
				if (!isDeepEqual(state[key], next[key])) {
					Object.assign(changed, { [key]: next[key] });
				}
			}
			Object.assign(state, changed);
		},
		// Synchronous, so the state already holds the new values when
		// `GuildSettingsForm` snapshots it as the baseline for the same change.
		// A later flush would leave the form diffing the new state against the
		// old baseline and staging a change nobody made.
		{ deep: true, flush: "sync" },
	);

	function mapToGuildData(formState: FormState): Partial<GuildData> {
		const changes: Partial<GuildData> = {};
		for (const key of one) setGuildDataChange(changes, key, formState[key]);
		for (const key of many) setGuildDataChange(changes, key, formState[key]);
		for (const key of toggles) setGuildDataChange(changes, key, formState[key]);
		for (const key of numbers) setGuildDataChange(changes, key, formState[key]);
		for (const key of choices) setGuildDataChange(changes, key, formState[key]);
		return changes;
	}

	function onError(event: FormErrorEvent) {
		const [firstError] = event.errors;
		if (firstError?.id) {
			document
				.getElementById(firstError.id)
				?.scrollIntoView({ behavior: "smooth", block: "center" });
		}
		toast.add({
			color: "error",
			description: firstError?.message ?? ts("guild_settings.please_try_again"),
			icon: "heroicons:x-circle",
			title: ts("guild_settings.save_failed"),
		});
	}

	return {
		mapToGuildData,
		onError,
		schema: buildSettingsFormSchema({ choices, many, numbers, one, toggles }),
		state,
	};
}
