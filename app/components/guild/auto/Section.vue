<template>
	<DashboardPageHeader
		:title="ts(`dashboard.nav.${slug}`)"
		:description="ts(`guild_settings.${slug}.subtitle`)"
	/>

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

	<!-- One card holds the list in every state, so the page keeps its shape
	     while it loads, fails or has nothing yet. -->
	<section class="console-card flex flex-col" :aria-labelledby="listHeadingId">
		<header class="flex min-h-8 items-center gap-2.5">
			<h2 :id="listHeadingId" class="text-base font-semibold text-balance">
				{{ ts(LIST_TITLE_KEYS[slug]) }}
			</h2>
			<span v-if="!isLoading && !error" class="font-mono text-xs text-muted tabular-nums">
				{{ ts("guild_settings.auto.count", { count: rows.length, maximum }) }}
			</span>
			<span class="flex-1"></span>
			<UButton
				v-if="rows.length > 0 && rows.length < maximum"
				color="primary"
				size="sm"
				icon="ic:round-add"
				@click="openNew"
			>
				{{ ts(`guild_settings.${slug}.add`) }}
			</UButton>
		</header>

		<DashboardSkeleton v-if="isLoading" kind="table" bare class="mt-3" />

		<UAlert
			v-else-if="error"
			class="mt-3"
			color="error"
			variant="subtle"
			icon="ic:round-error-outline"
			:title="ts('guild_settings.auto.load_failed')"
			:actions="[{ label: ts('guild_settings.auto.retry'), onClick: () => refresh() }]"
		/>

		<div v-else-if="rows.length === 0" class="auto-empty">
			<UIcon :name="MODULE_ICONS[slug]" class="size-6 text-muted" aria-hidden="true" />
			<h3 class="mt-1 text-sm font-semibold text-balance text-highlighted">
				{{ ts(`guild_settings.${slug}.empty_title`) }}
			</h3>
			<p class="max-w-md text-[0.8125rem] leading-normal text-pretty text-muted">
				{{ ts(`guild_settings.${slug}.empty_body`) }}
			</p>
			<UButton class="mt-3" color="primary" size="sm" icon="ic:round-add" @click="openNew">
				{{ ts(`guild_settings.${slug}.add`) }}
			</UButton>
		</div>

		<div v-else class="mt-3">
			<slot
				:rows="rows"
				:edit="openEdit"
				:remove="askRemove"
				:channel-name="channelName"
			></slot>
		</div>

		<p
			v-if="$slots.footnote && rows.length > 0"
			class="mt-3 text-[0.8125rem] leading-normal text-pretty text-muted"
		>
			<slot name="footnote"></slot>
		</p>
	</section>

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
	footnote(): unknown;
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

const listHeadingId = useId();

const LIST_TITLE_KEYS: Record<AutoChannelSlug, string> = {
	autodelete: "guild_settings.autodelete.channels_title",
	automessage: "guild_settings.automessage.messages_title",
	autopurge: "guild_settings.autopurge.schedules_title",
};
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

<style scoped>
@reference "@/assets/css/main.css";

.auto-empty {
	@apply mt-3 flex flex-col items-center gap-1 rounded-md px-4 py-8 text-center;
	border: 1px dashed var(--home-border-subtle);
}
</style>
