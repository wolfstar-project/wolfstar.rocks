<template>
	<h2 class="setup-title" tabindex="-1">{{ ts("guild_settings.setup.review.title") }}</h2>
	<p class="setup-lead">
		{{ ts("guild_settings.setup.review.description", { name: guildData?.name ?? "" }) }}
	</p>

	<dl class="mt-3.5">
		<div v-for="row of rows" :key="row.id" class="setup-review-row">
			<dt class="setup-review-label">{{ row.label }}</dt>
			<dd class="flex min-w-0 grow items-baseline gap-3">
				<span
					class="min-w-0 grow text-sm leading-normal [overflow-wrap:anywhere]"
					:class="{ 'text-muted': row.empty }"
				>
					{{ row.value }}
				</span>
				<button
					type="button"
					class="setup-review-edit"
					:aria-label="ts('guild_settings.setup.review.edit_aria', { label: row.label })"
					@click="emit('edit', row.step)"
				>
					{{ ts("guild_settings.setup.review.edit") }}
				</button>
			</dd>
		</div>
	</dl>
</template>

<script setup lang="ts">
import { GUILD_MODULES } from "#shared/utils/guild-modules";
import { mapLanguageKeysToNames } from "~/utils/guild-languages";
import { type SetupDraft, setupChannelFields } from "~/utils/guild-setup";
import { channelOptions, roleOptions } from "~/utils/select-options";

const draft = defineModel<SetupDraft>("draft", { required: true });
const emit = defineEmits<{
	/** The admin wants to change a row: the step that holds it. */
	edit: [step: number];
}>();

const { ts } = useI18n();
const { guildData } = useGuildData();

const channelNames = computed(
	() => new Map(channelOptions(guildData.value).map((option) => [option.value, option.label])),
);
const roleNames = computed(
	() => new Map(roleOptions(guildData.value).map((option) => [option.value, option.label])),
);

function channelName(id: string | null) {
	return id ? `#${channelNames.value.get(id) ?? id}` : "";
}

function roleList(ids: readonly string[]) {
	return ids.map((id) => roleNames.value.get(id) ?? id).join(", ");
}

/** A row of the review: its value, or what stands in for an empty one. */
function row(id: string, label: string, step: number, value: string, none: string) {
	return { empty: value === "", id, label, step, value: value || none };
}

const rows = computed(() => {
	const fields = setupChannelFields(draft.value);
	const language = mapLanguageKeysToNames(draft.value.language);
	const modules = GUILD_MODULES.filter((module) => draft.value.modules[module.key]).map(
		(module) => ts(module.labelKey),
	);
	const notSet = ts("guild_settings.setup.review.not_set");
	const none = ts("guild_settings.setup.review.none");

	return [
		row(
			"modules",
			ts("guild_settings.setup.review.rows.modules"),
			1,
			modules.join(", "),
			ts("guild_settings.setup.review.none_on"),
		),
		...(fields.moderation
			? [
					row(
						"moderation",
						ts("guild_settings.setup.review.rows.moderation_log"),
						2,
						channelName(draft.value.moderationChannel),
						notSet,
					),
				]
			: []),
		...(fields.automod
			? [
					row(
						"automod",
						ts("guild_settings.setup.review.rows.automod_log"),
						2,
						channelName(draft.value.automodChannel),
						notSet,
					),
				]
			: []),
		...(fields.events
			? [
					row(
						"events",
						ts("guild_settings.setup.review.rows.event_log"),
						2,
						channelName(draft.value.eventsChannel),
						notSet,
					),
				]
			: []),
		row(
			"admin",
			ts("guild_settings.setup.review.rows.admin"),
			3,
			roleList(draft.value.admin),
			none,
		),
		row(
			"moderator",
			ts("guild_settings.setup.review.rows.moderator"),
			3,
			roleList(draft.value.moderator),
			none,
		),
		row(
			"muted",
			ts("guild_settings.setup.review.rows.muted"),
			3,
			draft.value.muted ? (roleNames.value.get(draft.value.muted) ?? draft.value.muted) : "",
			notSet,
		),
		row(
			"language",
			ts("guild_settings.setup.review.rows.language"),
			4,
			language[1] ?? language[0],
			"",
		),
	];
});
</script>
