<template>
	<DashboardPageHeader
		:title="ts('guild_settings.channels.title')"
		:description="ts('guild_settings.channels.subtitle')"
	>
		<UBadge color="primary" variant="soft" size="lg" class="font-semibold">
			{{
				ts("guild_settings.channels.routed_count", {
					routed: routedCount,
					total: ConfigurableLoggingChannels.length,
				})
			}}
		</UBadge>
	</DashboardPageHeader>

	<GuildSettingsForm
		:state="state"
		:schema="schema"
		:map-to-guild-data="mapToGuildData"
		:aria-label="ts('guild_settings.channels.form_aria')"
		class="space-y-4"
		@error="onError"
	>
		<p class="text-[0.8125rem] text-muted">
			{{ ts("guild_settings.channels.logging_channels_help") }}
		</p>

		<div class="console-card flex flex-wrap items-center gap-x-6 gap-y-3">
			<GuildSettingsLogsBulkChannel
				class="min-w-0 flex-1"
				:keys="LOG_KEYS"
				:values="state"
				:label="ts('guild_settings.channels.bulk.all_label')"
				:help="ts('guild_settings.channels.bulk.all_help')"
				@apply="applyChannel(LOG_KEYS, $event)"
			/>
			<UButton
				:id="selectToggleId"
				color="neutral"
				:variant="selecting ? 'soft' : 'outline'"
				icon="heroicons:check-circle"
				:aria-pressed="selecting"
				@click="toggleSelecting"
			>
				{{ ts("guild_settings.channels.bulk.select_logs") }}
			</UButton>
		</div>

		<GuildSettingsLogsSelectionBar
			v-if="selecting"
			:keys="selectedKeys"
			:values="state"
			@apply="applyChannel(selectedKeys, $event)"
			@cancel="stopSelecting"
		/>

		<div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
			<section
				v-for="group in loggingGroups"
				:key="group.id"
				class="console-card"
				:aria-labelledby="`channels-${group.id}`"
			>
				<div class="mb-3 flex items-center gap-2.5">
					<UCheckbox
						v-if="selecting"
						:model-value="groupTicked(group.keys)"
						:aria-label="
							ts('guild_settings.channels.bulk.select_group', { group: group.title })
						"
						:ui="{ base: 'size-4.5 rounded-[4px]' }"
						@update:model-value="setTicked(group.keys, $event === true)"
					/>
					<h3 :id="`channels-${group.id}`" class="console-label">{{ group.title }}</h3>
				</div>
				<GuildSettingsLogsBulkChannel
					class="mb-2 border-b border-(--home-border-subtle) pb-2"
					:keys="group.keys"
					:values="state"
					:label="ts('guild_settings.channels.bulk.group_label', { group: group.title })"
					:help="ts('guild_settings.channels.bulk.group_help')"
					@apply="applyChannel(group.keys, $event)"
				/>
				<div class="space-y-2">
					<div
						v-for="config in group.entries"
						:key="config.key"
						class="flex items-center gap-3"
					>
						<UCheckbox
							v-if="selecting"
							:model-value="selected.has(config.key)"
							:aria-label="
								ts('guild_settings.channels.bulk.select_log', {
									name: translateEntry(config, 'name'),
								})
							"
							:ui="{ base: 'size-4.5 rounded-[4px]' }"
							@update:model-value="setTicked([config.key], $event === true)"
						/>
						<SelectChannel
							v-model="state[config.key]"
							class="min-w-0 flex-1"
							layout="row"
							:empty-label="ts('guild_settings.channels.not_logged')"
							:guild="guildData"
							:label="translateEntry(config, 'name')"
							:tooltip-title="translateEntry(config, 'description')"
						/>
					</div>
				</div>
				<div v-if="group.toggles.length > 0" class="mt-3">
					<GuildSettingsToggleRow
						v-for="config in group.toggles"
						:key="config.key"
						v-model="state[config.key]"
						:name="config.key"
						:title="translateEntry(config, 'name')"
						:description="translateEntry(config, 'description')"
					/>
				</div>
			</section>
		</div>

		<section class="console-card" aria-labelledby="channels-excluded">
			<div class="flex items-center gap-3">
				<h3 id="channels-excluded" class="text-[1.0625rem] font-semibold whitespace-nowrap">
					{{ ts("guild_settings.channels.excluded_channels") }}
				</h3>
				<span class="h-px flex-1 bg-(--field-border)" aria-hidden="true"></span>
			</div>
			<p class="mt-1.5 text-[0.8125rem] text-muted">
				{{ ts("guild_settings.channels.excluded_channels_help") }}
			</p>
			<div class="mt-4 flex flex-col gap-5">
				<SelectChannels
					v-for="config in ConfigurableIgnoreChannels"
					:key="config.key"
					v-model="state[config.key]"
					layout="chips"
					:guild="guildData"
					:label="translateEntry(config, 'name')"
					:tooltip-title="translateEntry(config, 'description')"
					:empty-label="ts('guild_settings.channels.nothing_ignored')"
					:dialog-title="ts('guild_settings.channels.ignore_dialog_title')"
					:search-placeholder="ts('guild_settings.channels.search_text_channels')"
					:count-label="(count) => tc('guild_settings.channels.ignored_count', count)"
				/>
			</div>
		</section>
	</GuildSettingsForm>
</template>

<script setup lang="ts">
import type { SingleSettingKey } from "#shared/types";
// Explicit import: unimport misses identifiers referenced only inside nested
// functions and the template, leaving them unbound in the compiled module.
import {
	ConfigurableIgnoreChannels,
	ConfigurableLoggingChannels,
	ConfigurableLogToggles,
} from "#shared/utils/settingsDataEntries";
import { logChannelChanges, logSelectionState, toggleLogSelection } from "~/utils/log-channels";

const { tc, ts } = useI18n();
const { translateEntry } = useSettingsEntryI18n();
const { guildData } = useGuildData();

const { mapToGuildData, onError, schema, state } = useSettingsForm({
	one: ConfigurableLoggingChannels.map((entry) => entry.key),
	many: ConfigurableIgnoreChannels.map((entry) => entry.key),
	toggles: ConfigurableLogToggles.map((entry) => entry.key),
});

const LOG_KEYS: readonly SingleSettingKey[] = ConfigurableLoggingChannels.map((entry) => entry.key);

// One card per kind of event, in the order the events are written to the log.
const LOGGING_GROUPS = [
	{ id: "members", pattern: /^logs(Member|Prune)/ },
	{ id: "messages", pattern: /^logs(Message|Image)/ },
	{ id: "reactions", pattern: /^logsReaction/ },
	{ id: "roles", pattern: /^logsRole/ },
	{ id: "channels", pattern: /^logs(Channel|Threads)/ },
	{ id: "emojis", pattern: /^logs(Emoji|Expressions)/ },
	{ id: "server", pattern: /^logs(Server|Invites|Events|Integrations)/ },
] as const;

const loggingGroups = computed(() =>
	LOGGING_GROUPS.map((group) => ({
		entries: ConfigurableLoggingChannels.filter((entry) => group.pattern.test(entry.key)),
		id: group.id,
		keys: LOG_KEYS.filter((key) => group.pattern.test(key)),
		title: ts(`guild_settings.channels.groups.${group.id}`),
		toggles: ConfigurableLogToggles.filter((entry) => group.pattern.test(entry.key)),
	})).filter((group) => group.entries.length > 0),
);

/** Sets the channel of every log of `keys` through the form, so it is staged like any edit. */
function applyChannel(keys: readonly SingleSettingKey[], channel: string | null) {
	Object.assign(state, logChannelChanges(state, keys, channel));
}

// Mass edit: tick logs, then set or remove their channel from the selection bar.
const selectToggleId = useId();
const selecting = ref(false);
const selected = shallowRef<ReadonlySet<SingleSettingKey>>(new Set());
// In page order, whatever order the logs were ticked in.
const selectedKeys = computed(() => LOG_KEYS.filter((key) => selected.value.has(key)));

function setTicked(keys: readonly SingleSettingKey[], ticked: boolean) {
	selected.value = toggleLogSelection(selected.value, keys, ticked);
}

function groupTicked(keys: readonly SingleSettingKey[]): boolean | "indeterminate" {
	const ticked = logSelectionState(selected.value, keys);
	return ticked === "some" ? "indeterminate" : ticked === "all";
}

function toggleSelecting() {
	if (selecting.value) void stopSelecting();
	else selecting.value = true;
}

async function stopSelecting() {
	selecting.value = false;
	selected.value = new Set();
	// The selection bar may have held the focus: hand it back to the button
	// that opened the mode instead of dropping it on the page.
	await nextTick();
	document.getElementById(selectToggleId)?.focus();
}

const routedCount = computed(
	() => ConfigurableLoggingChannels.filter((entry) => state[entry.key]).length,
);
</script>
