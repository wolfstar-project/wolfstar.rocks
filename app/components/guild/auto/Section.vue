<template>
	<DashboardPageHeader
		:title="ts(`dashboard.nav.${slug}`)"
		:description="ts(`guild_settings.${slug}.subtitle`)"
	>
		<UBadge color="primary" variant="soft" size="lg" class="font-semibold">
			{{ ts("guild_settings.auto.count", { count: rows.length, maximum }) }}
		</UBadge>
		<UButton
			v-if="rows.length < maximum"
			color="primary"
			size="sm"
			icon="ic:round-add"
			@click="openNew"
		>
			{{ ts(`guild_settings.${slug}.add`) }}
		</UButton>
	</DashboardPageHeader>

	<GuildSettingsForm
		:schema="schema"
		:state="state"
		:map-to-guild-data="mapToGuildData"
		:aria-label="ts('guild_settings.modules.form_aria')"
		@error="onError"
	>
		<GuildModuleBanner
			:icon="MODULE_ICONS[slug]"
			:title="ts(`dashboard.nav.${slug}`)"
			:hint="ts('guild_settings.auto.module_hint')"
			:on="state[MODULE_KEYS[slug]] === true"
		>
			<USwitch
				v-model="state[MODULE_KEYS[slug]]"
				:aria-label="
					ts('guild_settings.modules.toggle_aria', {
						title: ts(`dashboard.nav.${slug}`),
					})
				"
			/>
		</GuildModuleBanner>
	</GuildSettingsForm>

	<slot name="notice"></slot>

	<DashboardSkeleton v-if="isLoading" kind="table" bare />

	<UAlert
		v-else-if="error"
		color="error"
		variant="subtle"
		icon="ic:round-error-outline"
		:title="ts('guild_settings.auto.load_failed')"
		:actions="[{ label: ts('guild_settings.auto.retry'), onClick: () => refresh() }]"
	/>

	<section
		v-else-if="rows.length === 0"
		class="console-card flex flex-col items-center gap-2 px-4 py-12 text-center"
		:aria-labelledby="emptyHeadingId"
	>
		<h2 :id="emptyHeadingId" class="text-base font-semibold">
			{{ ts(`guild_settings.${slug}.empty_title`) }}
		</h2>
		<p class="max-w-lg text-[0.8125rem] leading-normal text-muted">
			{{ ts(`guild_settings.${slug}.empty_body`) }}
		</p>
	</section>

	<slot
		v-else
		:rows="rows"
		:edit="openEdit"
		:remove="askRemove"
		:channel-name="channelName"
	></slot>

	<GuildAutoEditor
		v-model:open="editorOpen"
		:slug="slug"
		:row="editing"
		:taken="taken"
		:saving="saving"
		:error-code="errorCode"
		@save="save"
	/>

	<UModal
		:open="removing !== null"
		:title="ts(`guild_settings.${slug}.remove_title`)"
		:description="
			ts(`guild_settings.${slug}.remove_description`, {
				channel: removing ? channelName(removing.channelId) : '',
			})
		"
		:dismissible="!saving"
		@update:open="!$event && closeRemove()"
	>
		<template #footer>
			<div class="flex w-full justify-end gap-2">
				<UButton
					color="neutral"
					variant="outline"
					class="dialog-cancel"
					:disabled="saving"
					@click="closeRemove()"
				>
					{{ ts("guild_settings.auto.editor.cancel") }}
				</UButton>
				<UButton color="error" :loading="saving" @click="confirmRemove">
					{{ ts(`guild_settings.${slug}.remove`) }}
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts" generic="Slug extends AutoChannelSlug">
import type {
	AutoChannelErrorCode,
	AutoChannelSlug,
	AutoChannelTables,
} from "~/composables/useAutoChannels";
import type { autoChannelBody } from "~/utils/auto-channels";
import { AUTO_CHANNEL_MAXIMUMS } from "~/utils/auto-channels";

type Row = AutoChannelTables[Slug]["row"];

const { slug } = defineProps<{
	/** Which table the section shows: Auto-Delete, Auto-Purge or Auto-Message. */
	slug: Slug;
}>();

defineSlots<{
	default(props: {
		rows: Row[];
		edit: (row: Row) => void;
		remove: (row: Row) => void;
		channelName: (channelId: string) => string;
	}): unknown;
	notice(): unknown;
}>();

const { ts } = useI18n();
const toast = useToast();
const { activeGuildId } = useActiveGuild();
const { guildData } = useGuildData();
const { clearRow, error, refresh, rows, setRow, status } = useAutoChannels(slug, activeGuildId);

const MODULE_ICONS: Record<AutoChannelSlug, string> = {
	autodelete: "lucide:timer",
	automessage: "lucide:message-square-reply",
	autopurge: "lucide:eraser",
};

const MODULE_KEYS = {
	autodelete: "modulesAutodelete",
	automessage: "modulesAutomessage",
	autopurge: "modulesAutopurge",
} as const satisfies Record<AutoChannelSlug, ToggleSettingKey>;

const { mapToGuildData, onError, schema, state } = useSettingsForm({
	toggles: Object.values(MODULE_KEYS),
});

const emptyHeadingId = useId();
const maximum = AUTO_CHANNEL_MAXIMUMS[slug];
const isLoading = computed(() => status.value === "pending" && rows.value.length === 0);

function channelName(channelId: string): string {
	const channel = guildData.value?.channels.find((candidate) => candidate.id === channelId);
	return `#${channel?.name ?? ts("select.unknown_channel")}`;
}

const editorOpen = ref(false);
const editing = shallowRef<Row | null>(null);
const saving = ref(false);
const errorCode = ref<AutoChannelErrorCode | null>(null);

// A channel has one row per table: the editor does not offer the others'.
const taken = computed(() =>
	rows.value
		.map((row) => row.channelId)
		.filter((channelId) => channelId !== editing.value?.channelId),
);

function openNew() {
	editing.value = null;
	errorCode.value = null;
	editorOpen.value = true;
}

function openEdit(row: Row) {
	editing.value = row;
	errorCode.value = null;
	editorOpen.value = true;
}

async function save(channelId: string, body: ReturnType<typeof autoChannelBody>) {
	saving.value = true;
	errorCode.value = null;
	const result = await setRow(channelId, body as AutoChannelTables[Slug]["data"]);
	saving.value = false;

	if (!result.ok) {
		errorCode.value = result.code;
		return;
	}
	editorOpen.value = false;
	toast.add({
		color: "success",
		description: ts(`guild_settings.${slug}.saved_description`, {
			channel: channelName(channelId),
		}),
		icon: "heroicons:check",
		title: ts("guild_settings.auto.saved_title"),
	});
}

const removing = shallowRef<Row | null>(null);

function askRemove(row: Row) {
	removing.value = row;
}

function closeRemove() {
	removing.value = null;
}

async function confirmRemove() {
	const row = removing.value;
	if (!row) return;
	saving.value = true;
	const result = await clearRow(row.channelId);
	saving.value = false;
	removing.value = null;

	toast.add(
		result.ok
			? {
					color: "success",
					description: ts(`guild_settings.${slug}.removed_description`, {
						channel: channelName(row.channelId),
					}),
					icon: "heroicons:check",
					title: ts("guild_settings.auto.removed_title"),
				}
			: {
					color: "error",
					description: ts("guild_settings.please_try_again"),
					icon: "heroicons:x-circle",
					title: ts("guild_settings.save_failed"),
				},
	);
}
</script>
