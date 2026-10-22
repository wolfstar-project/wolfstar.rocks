<template>
	<UModal
		v-model:open="open"
		:title="title"
		:description="ts(`guild_settings.auto.editor.${slug}_subtitle`)"
		:dismissible="!saving"
		:ui="{ content: 'sm:max-w-xl' }"
	>
		<template #body>
			<div class="flex flex-col gap-5">
				<SelectChannel
					v-model="draft.channelId"
					layout="field"
					:guild="guildData"
					:label="ts('guild_settings.auto.editor.channel')"
					:empty-label="ts('guild_settings.auto.editor.channel_placeholder')"
					:exclude="taken"
					:disabled="isEdit"
					:tooltip-title="
						isEdit ? ts('guild_settings.auto.editor.channel_locked') : undefined
					"
				/>

				<template v-if="slug === 'autodelete'">
					<UFormField
						:label="ts('guild_settings.auto.editor.delete_after')"
						:help="delayHelp"
					>
						<GuildAutomodDurationInput
							v-model="delayMilliseconds"
							:label="ts('guild_settings.auto.editor.delete_after')"
						/>
					</UFormField>
					<UFormField
						:label="ts('guild_settings.auto.editor.keep')"
						:help="ts('guild_settings.auto.editor.keep_help')"
					>
						<UCheckboxGroup
							v-model="draft.allow"
							:items="allowItems"
							variant="card"
							:ui="{ fieldset: 'grid gap-2 sm:grid-cols-2' }"
						/>
					</UFormField>
					<div class="flex items-start justify-between gap-4">
						<div class="min-w-0">
							<p :id="botsLabelId" class="text-sm font-medium">
								{{ ts("guild_settings.auto.editor.bots") }}
							</p>
							<p class="mt-0.5 text-[0.8125rem] text-muted">
								{{ ts("guild_settings.auto.editor.bots_help") }}
							</p>
						</div>
						<USwitch v-model="draft.bots" :aria-labelledby="botsLabelId" />
					</div>
				</template>

				<template v-else-if="slug === 'autopurge'">
					<UFormField
						:label="ts('guild_settings.auto.editor.purge_every')"
						:help="intervalHelp"
					>
						<GuildAutomodDurationInput
							v-model="intervalMilliseconds"
							:label="ts('guild_settings.auto.editor.purge_every')"
						/>
					</UFormField>
					<UFormField
						:label="ts('guild_settings.auto.editor.filter')"
						:help="ts('guild_settings.auto.editor.filter_help')"
					>
						<USelect
							v-model="draft.filter"
							:items="filterItems"
							class="w-full"
							:aria-label="ts('guild_settings.auto.editor.filter')"
						/>
					</UFormField>
					<UFormField
						v-if="valueKind"
						:label="ts(`guild_settings.auto.editor.value_${valueKind}`)"
						:help="
							ts('guild_settings.auto.editor.value_help', {
								maximum: MAXIMUM_AUTO_PURGE_VALUE_LENGTH,
							})
						"
					>
						<UInput
							v-model="draft.value"
							class="w-full"
							:maxlength="MAXIMUM_AUTO_PURGE_VALUE_LENGTH"
							:placeholder="
								ts(`guild_settings.auto.editor.value_${valueKind}_placeholder`)
							"
						/>
					</UFormField>
				</template>

				<template v-else>
					<UFormField :label="ts('guild_settings.auto.editor.message')">
						<UTextarea
							v-model="draft.content"
							:rows="4"
							autoresize
							class="w-full"
							:maxlength="MAXIMUM_AUTO_MESSAGE_LENGTH"
							:placeholder="ts('guild_settings.auto.editor.message_placeholder')"
						/>
						<template #hint>
							<span class="font-mono text-xs text-muted">
								{{ draft.content.length }} / {{ MAXIMUM_AUTO_MESSAGE_LENGTH }}
							</span>
						</template>
					</UFormField>
					<UFormField
						:label="ts('guild_settings.auto.editor.send_every')"
						:help="intervalHelp"
					>
						<GuildAutomodDurationInput
							v-model="intervalMilliseconds"
							:label="ts('guild_settings.auto.editor.send_every')"
						/>
					</UFormField>
					<div class="flex items-start justify-between gap-4">
						<div class="min-w-0">
							<p :id="mentionsLabelId" class="text-sm font-medium">
								{{ ts("guild_settings.auto.editor.mentions") }}
							</p>
							<p class="mt-0.5 text-[0.8125rem] text-muted">
								{{ ts("guild_settings.auto.editor.mentions_help") }}
							</p>
						</div>
						<USwitch v-model="draft.mentions" :aria-labelledby="mentionsLabelId" />
					</div>
					<div
						class="auto-preview"
						role="group"
						:aria-label="ts('guild_settings.auto.editor.preview')"
					>
						<p class="console-label">{{ ts("guild_settings.auto.editor.preview") }}</p>
						<p
							class="mt-2 text-sm break-words whitespace-pre-wrap"
							:class="{ 'text-muted': draft.content.trim() === '' }"
						>
							{{
								draft.content.trim() === ""
									? ts("guild_settings.auto.editor.preview_empty")
									: draft.content
							}}
						</p>
					</div>
				</template>

				<UAlert
					v-if="problemMessage"
					color="error"
					variant="subtle"
					icon="ic:round-error-outline"
					role="alert"
					:title="problemMessage"
				/>
			</div>
		</template>

		<template #footer>
			<div class="flex w-full justify-end gap-2">
				<UButton
					color="neutral"
					variant="outline"
					class="dialog-cancel"
					:disabled="saving"
					@click="open = false"
				>
					{{ ts("guild_settings.auto.editor.cancel") }}
				</UButton>
				<UButton
					color="primary"
					:loading="saving"
					:disabled="problem !== null"
					@click="save"
				>
					{{
						isEdit
							? ts("guild_settings.auto.editor.save")
							: ts("guild_settings.auto.editor.enable")
					}}
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type {
	AutoChannelErrorCode,
	AutoChannelSlug,
	AutoChannelTables,
} from "~/composables/useAutoChannels";
import {
	AUTO_DELETE_ALLOW_KINDS,
	AUTO_PURGE_FILTERS,
	MAXIMUM_AUTO_MESSAGE_LENGTH,
	MAXIMUM_AUTO_PURGE_VALUE_LENGTH,
} from "#shared/utils/auto-channels";
import {
	autoChannelBody,
	autoChannelDraftProblem,
	autoPurgeValueKind,
	emptyAutoChannelDraft,
	spellSeconds,
	type AutoChannelDraft,
} from "~/utils/auto-channels";

const open = defineModel<boolean>("open", { required: true });

const {
	slug,
	row = null,
	taken,
	saving = false,
	errorCode = null,
} = defineProps<{
	slug: AutoChannelSlug;
	/** The row being edited, or `null` for a new one. */
	row?: AutoChannelTables[AutoChannelSlug]["row"] | null;
	/** The channels another row of this table already has. */
	taken: readonly string[];
	saving?: boolean;
	/** What the server refused the last save with. */
	errorCode?: AutoChannelErrorCode | null;
}>();

const emit = defineEmits<{
	save: [channelId: string, body: ReturnType<typeof autoChannelBody>];
}>();

const { ts } = useI18n();
const { guildData } = useGuildData();
const { locale } = useAppLocale();

const botsLabelId = useId();
const mentionsLabelId = useId();

const draft = reactive<AutoChannelDraft>(emptyAutoChannelDraft());
const isEdit = computed(() => row !== null);

// Opening fills the draft from the row it edits, or starts a new one.
watch(
	open,
	(isOpen) => {
		if (!isOpen) return;
		Object.assign(draft, emptyAutoChannelDraft(), row === null ? {} : draftOf(row));
	},
	{ immediate: true },
);

function draftOf(source: AutoChannelTables[AutoChannelSlug]["row"]): Partial<AutoChannelDraft> {
	if ("delay" in source) {
		return {
			allow: [...source.allow],
			bots: source.bots,
			channelId: source.channelId,
			delay: source.delay,
		};
	}
	if ("filter" in source) {
		return {
			channelId: source.channelId,
			filter: source.filter,
			interval: source.interval,
			value: source.value ?? "",
		};
	}
	return {
		channelId: source.channelId,
		content: source.content,
		interval: source.interval,
		mentions: source.mentions,
	};
}

const title = computed(() => {
	const name = ts(`dashboard.nav.${slug}`);
	if (!isEdit.value) return ts("guild_settings.auto.editor.new_title", { name });
	const channel = guildData.value?.channels.find((candidate) => candidate.id === draft.channelId);
	return ts("guild_settings.auto.editor.edit_title", {
		channel: `#${channel?.name ?? ts("select.unknown_channel")}`,
		name,
	});
});

// The duration field works in milliseconds, the tables in whole seconds.
const delayMilliseconds = computed({
	get: () => draft.delay * 1000,
	set: (value: number) => {
		draft.delay = Math.round(value / 1000);
	},
});
const intervalMilliseconds = computed({
	get: () => draft.interval * 1000,
	set: (value: number) => {
		draft.interval = Math.round(value / 1000);
	},
});

const delayHelp = computed(() =>
	draft.delay === 0
		? ts("guild_settings.auto.editor.delete_at_once")
		: ts("guild_settings.auto.editor.delete_after_help", {
				duration: spellSeconds(draft.delay, locale.value),
			}),
);

const intervalHelp = computed(() =>
	ts(`guild_settings.auto.editor.${slug}_interval_help`, {
		duration: spellSeconds(Math.max(draft.interval, 1), locale.value),
	}),
);

const allowItems = computed(() =>
	AUTO_DELETE_ALLOW_KINDS.map((kind) => ({
		description: ts(`guild_settings.auto.allow.${kind}_help`),
		label: ts(`guild_settings.auto.allow.${kind}`),
		value: kind,
	})),
);

const filterItems = computed(() =>
	AUTO_PURGE_FILTERS.map((filter) => ({
		label: ts(`guild_settings.auto.filters.${filter}`),
		value: filter,
	})),
);

const valueKind = computed(() => autoPurgeValueKind(draft.filter));

const problem = computed(() => autoChannelDraftProblem(slug, draft, taken));

// The rules the editor checks as it goes, then what the server refused.
const problemMessage = computed(() => {
	if (problem.value) {
		const channel = guildData.value?.channels.find(
			(candidate) => candidate.id === draft.channelId,
		);
		return ts(problem.value.key, {
			channel: `#${channel?.name ?? ""}`,
			...problem.value.values,
		});
	}
	return errorCode ? ts(`guild_settings.auto.server_errors.${errorCode}`) : null;
});

function save() {
	if (problem.value || !draft.channelId) return;
	emit("save", draft.channelId, autoChannelBody(slug, draft));
}
</script>

<style scoped>
@reference "@/assets/css/main.css";

.auto-preview {
	@apply rounded-lg px-3 py-2.5;
	background-color: var(--field-surface);
	border-left: 3px solid var(--color-primary);
}
</style>
